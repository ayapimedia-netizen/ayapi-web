import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSecureSessionToken } from "@/lib/auth-helper";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin paths, except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get("admin_session");
    const expectedToken = getSecureSessionToken();

    if (!session || session.value !== expectedToken) {
      // Redirect to login page
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configure paths that will run this proxy
export const config = {
  matcher: ["/admin/:path*"],
};
