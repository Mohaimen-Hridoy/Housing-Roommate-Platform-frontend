import "server-only";

import { cookies } from "next/headers";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  decodeJwtPayload,
  parseSessionCookie,
  serializeSession,
} from "@/lib/auth/tokens";
import { ROLE_HOME } from "@/lib/constants";
import type { AuthTokens, Role, SessionUser } from "@/lib/types/api";

const secureCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

export async function readAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

/**
 * Identity used for rendering. Falls back to the JWT claims so a session stays
 * usable even if the mirror cookie is missing.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const mirrored = parseSessionCookie(store.get(SESSION_COOKIE)?.value);
  if (mirrored) return mirrored;

  const claims = decodeJwtPayload(store.get(ACCESS_COOKIE)?.value);
  if (!claims?.sub || !claims.role) return null;
  return {
    id: claims.sub,
    email: claims.email ?? "",
    name: claims.name ?? null,
    role: claims.role,
  };
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

export async function writeSession(tokens: AuthTokens, user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, tokens.accessToken, {
    ...secureCookieOptions,
    maxAge: Math.max(Math.floor(tokens.expiresIn ?? 900), 60),
  });
  store.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...secureCookieOptions,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  store.set(SESSION_COOKIE, serializeSession(user), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function writeAccessToken(accessToken: string, expiresIn: number): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, {
    ...secureCookieOptions,
    maxAge: Math.max(Math.floor(expiresIn), 60),
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(SESSION_COOKIE);
}

export function homeForRole(role: Role): string {
  return ROLE_HOME[role];
}
