import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  clearAuthCookies,
  OAUTH_VERIFIER_COOKIE,
  setAuthCookies,
} from "@/lib/auth-cookies";
import { isAdminSession, isAllowedAdminEmail } from "@/lib/admin-auth";
import {
  createInsForgeServerClientPublic,
  getInsForgePublicEnv,
} from "@/lib/insforge-server";
import { getRequestOrigin } from "@/lib/request-origin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("insforge_code");
  const nextPath = url.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  if (!getInsForgePublicEnv()) {
    return NextResponse.redirect(new URL("/login?error=insforge_not_configured", request.url));
  }

  const store = await cookies();
  const codeVerifier = store.get(OAUTH_VERIFIER_COOKIE)?.value;

  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.auth.exchangeOAuthCode(code, codeVerifier);

  if (error || !data?.accessToken) {
    await clearAuthCookies();
    const fail = new URL("/login", getRequestOrigin(request));
    fail.searchParams.set("error", "oauth_exchange_failed");
    return NextResponse.redirect(fail);
  }

  const email = String(data.user?.email ?? "").toLowerCase();
  if (!email || !isAllowedAdminEmail(email)) {
    await clearAuthCookies();
    const fail = new URL("/login", getRequestOrigin(request));
    fail.searchParams.set("error", "domain_not_allowed");
    return NextResponse.redirect(fail);
  }

  const isAdmin = await isAdminSession(data.accessToken, data.user.id);
  if (!isAdmin) {
    await clearAuthCookies();
    const fail = new URL("/login", getRequestOrigin(request));
    fail.searchParams.set("error", "admin_only");
    return NextResponse.redirect(fail);
  }

  await setAuthCookies(data.accessToken, data.refreshToken);
  store.delete(OAUTH_VERIFIER_COOKIE);

  const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
  return NextResponse.redirect(new URL(safeNext, getRequestOrigin(request)));
}
