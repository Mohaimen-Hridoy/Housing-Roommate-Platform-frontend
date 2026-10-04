import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE, SESSION_COOKIE, decodeJwtPayload, isTokenExpired, parseSessionCookie } from "@/lib/auth/tokens";
import { ROLE_HOME } from "@/lib/constants";
import type { Role } from "@/lib/types/api";

const GUARDS: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/owner", roles: ["OWNER"] },
  { prefix: "/dashboard", roles: ["TENANT"] },
];

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

/**
 * Route-level RBAC. The access token is only decoded here (never trusted for
 * data access — the API re-validates every request), which is enough to keep
 * each role inside its own area and to bounce signed-in users away from the
 * login screen.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const claims = decodeJwtPayload(token);
  const session = parseSessionCookie(request.cookies.get(SESSION_COOKIE)?.value);
  const role: Role | null = session?.role ?? claims?.role ?? null;
  const authenticated = Boolean(claims?.sub) && !isTokenExpired(claims);

  const guard = GUARDS.find((entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`));

  if (guard) {
    if (!authenticated || !role) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(login);
    }
    if (!guard.roles.includes(role)) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
    }
    return NextResponse.next();
  }

  if (AUTH_PAGES.includes(pathname) && authenticated && role) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/owner/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
};
