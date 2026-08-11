import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSessionValid } from "@/lib/auth-helper";
import logger from "@/lib/logger";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get("admin_session")?.value;
  const isAuthenticated = isSessionValid(sessionCookie);

  // 1. If accessing /admin/login while already logged in -> Redirect to /admin
  if (pathname === "/admin/login" && isAuthenticated) {
    const adminDashboardUrl = new URL("/admin", request.url);
    return NextResponse.redirect(adminDashboardUrl);
  }

  // 2. Protect /admin routes (except /admin/login) -> Redirect to /admin/login if not logged in
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAuthenticated) {
      logger.auth("DENIED", `Unauthorized access attempt to ${pathname} -> Redirecting to /admin/login`);
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
