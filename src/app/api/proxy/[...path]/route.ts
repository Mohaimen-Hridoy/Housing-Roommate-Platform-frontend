import { NextResponse } from "next/server";

import { API_URL } from "@/lib/config";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  decodeJwtPayload,
  serializeSession,
} from "@/lib/auth/tokens";
import type { ApiResponse, AuthTokens } from "@/lib/types/api";

export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "content-encoding",
  "content-length",
  "host",
  "cookie",
  "authorization",
]);

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

function applySessionCookies(response: NextResponse, tokens: AuthTokens): NextResponse {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: Math.max(Math.floor(tokens.expiresIn ?? 900), 60),
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  const claims = decodeJwtPayload(tokens.accessToken);
  if (claims?.sub && claims.role) {
    response.cookies.set(
      SESSION_COOKIE,
      serializeSession({
        id: claims.sub,
        email: typeof claims.email === "string" ? claims.email : "",
        name: typeof claims.name === "string" ? claims.name : null,
        role: claims.role,
      }),
      { httpOnly: false, sameSite: "lax", secure, path: "/", maxAge: SESSION_MAX_AGE_SECONDS },
    );
  }
  return response;
}

function relay(upstream: Response, withCookies?: NextResponse): NextResponse {
  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store, max-age=0",
    },
  });
  if (withCookies) {
    for (const cookie of withCookies.cookies.getAll()) {
      response.cookies.set(cookie);
    }
  }
  return response;
}

async function tryRefresh(request: Request): Promise<AuthTokens | null> {
  const refreshToken = readCookie(request, REFRESH_COOKIE);
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as ApiResponse<AuthTokens>;
    if (!payload.success || !payload.data?.accessToken) return null;
    return payload.data;
  } catch {
    return null;
  }
}

/**
 * Authenticated reverse proxy to the B7A6 API.
 *
 * The backend only accepts `Authorization: Bearer <token>`, so browser requests
 * are relayed here: the httpOnly access cookie is read server-side and attached
 * as a bearer header. A 401 triggers one silent refresh + retry, so client code
 * never has to think about token expiry.
 */
async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await context.params;
  const incoming = new URL(request.url);
  const target = `${API_URL}/${path.map(encodeURIComponent).join("/")}${incoming.search}`;

  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  }

  const isBodyless = request.method === "GET" || request.method === "HEAD";
  const body = isBodyless ? undefined : await request.arrayBuffer();
  const payload = body && body.byteLength > 0 ? body : undefined;

  const send = (token: string | undefined) => {
    const outgoing = new Headers(headers);
    if (token) outgoing.set("authorization", `Bearer ${token}`);
    return fetch(target, {
      method: request.method,
      headers: outgoing,
      body: payload,
      cache: "no-store",
      redirect: "manual",
    });
  };

  const accessToken = readCookie(request, ACCESS_COOKIE);
  let upstream = await send(accessToken);

  if (upstream.status === 401) {
    const refreshed = await tryRefresh(request);
    if (refreshed?.accessToken) {
      upstream = await send(refreshed.accessToken);
      return relay(upstream, applySessionCookies(new NextResponse(), refreshed));
    }
  }

  return relay(upstream);
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;

export function OPTIONS(): NextResponse {
  return new NextResponse(null, { status: 204, headers: { Allow: "GET,POST,PATCH,PUT,DELETE,OPTIONS" } });
}
