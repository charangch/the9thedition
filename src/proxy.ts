import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const INSFORGE_ACCESS_COOKIE = "insforge_access_token";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(INSFORGE_ACCESS_COOKIE)?.value;
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
