import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

// Laravel-style route middleware groups, centralized in one place:
// - "guest" pages (login/register) bounce an already-authenticated user to "/"
// - role-gated prefixes require both a session AND the matching role, or redirect
const GUEST_ONLY_PATHS = ["/login", "/register"];

const ROLE_PATH_PREFIXES: Record<string, "EMPLOYER" | "CANDIDATE" | "ADMIN"> = {
  "/employer": "EMPLOYER",
  "/candidate": "CANDIDATE",
  "/admin": "ADMIN",
};

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  if (GUEST_ONLY_PATHS.some((p) => matchesPrefix(pathname, p))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
    return;
  }

  const roleEntry = Object.entries(ROLE_PATH_PREFIXES).find(([prefix]) => matchesPrefix(pathname, prefix));
  if (!roleEntry) return;
  const [, requiredRole] = roleEntry;

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (req.auth?.user?.role !== requiredRole) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/employer/:path*", "/candidate/:path*", "/admin/:path*", "/login", "/register"],
};
