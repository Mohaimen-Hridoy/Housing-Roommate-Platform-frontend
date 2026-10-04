import type { Role, SessionUser } from "@/lib/types/api";

export const ACCESS_COOKIE = "hsg_access";
export const REFRESH_COOKIE = "hsg_refresh";
/**
 * Readable by the browser on purpose: it only mirrors the display identity so
 * client components can render role-aware UI. Authorisation is enforced by the
 * backend's RBAC middleware and by `src/middleware.ts`, never by this cookie.
 */
export const SESSION_COOKIE = "hsg_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24;

export interface JwtClaims {
  sub: string;
  role: Role;
  email?: string;
  name?: string | null;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Decode (never verify) a JWT payload. Used only for optimistic routing in
 * `src/middleware.ts`; the API re-validates the signature on every request.
 */
export function decodeJwtPayload(token: string | undefined | null): JwtClaims | null {
  if (!token) return null;
  const segments = token.split(".");
  if (segments.length !== 3) return null;
  try {
    const json = Buffer.from(segments[1], "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as JwtClaims;
  } catch {
    return null;
  }
}

export function isTokenExpired(claims: JwtClaims | null): boolean {
  if (!claims?.exp) return true;
  return claims.exp * 1000 <= Date.now();
}

export function serializeSession(user: SessionUser): string {
  return JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role });
}

export function parseSessionCookie(raw: string | undefined | null): SessionUser | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Partial<SessionUser>;
    if (!candidate.id || !candidate.email || !candidate.role) return null;
    return {
      id: candidate.id,
      email: candidate.email,
      name: candidate.name ?? null,
      role: candidate.role,
    };
  } catch {
    return null;
  }
}
