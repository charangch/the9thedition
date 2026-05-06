import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllowedOrigins, isOriginAllowed } from "@/lib/allowed-origins";

const INSFORGE_ACCESS_COOKIE = "insforge_access_token";

function corsHeaders(request: NextRequest, allowed: string[]): Headers {
  const origin = request.headers.get("origin");
  const h = new Headers();
  const allow = origin && isOriginAllowed(origin, allowed) ? origin : allowed[0] ?? "";
  if (allow) {
    h.set("Access-Control-Allow-Origin", allow);
    h.set("Vary", "Origin");
  }
  h.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  h.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  h.set("Access-Control-Max-Age", "86400");
  return h;
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/api")) {
    const allowed = getAllowedOrigins();
    if (request.method === "OPTIONS") {
      const origin = request.headers.get("origin");
      if (origin && !isOriginAllowed(origin, allowed)) {
        return new NextResponse(null, { status: 403 });
      }
      return new NextResponse(null, { status: 204, headers: corsHeaders(request, allowed) });
    }
    const origin = request.headers.get("origin");
    if (origin && !isOriginAllowed(origin, allowed)) {
      return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
    }
    const res = NextResponse.next();
    if (origin && isOriginAllowed(origin, allowed)) {
      const ch = corsHeaders(request, allowed);
      ch.forEach((value, key) => res.headers.set(key, value));
    }
    return res;
  }

  const token = request.cookies.get(INSFORGE_ACCESS_COOKIE)?.value;
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
