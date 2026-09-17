import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("zentra_ops")?.value;
  const isLogin = pathname === "/ops/login";

  if (pathname.startsWith("/ops") && !isLogin && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/ops/login";
    return NextResponse.redirect(url);
  }

  if (isLogin && session) {
    const url = request.nextUrl.clone();
    url.pathname = "/ops";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ops/:path*"],
};
