import { cookies } from "next/headers";

export const ACCESS_COOKIE = "insforge_access_token";
export const REFRESH_COOKIE = "insforge_refresh_token";
export const OAUTH_VERIFIER_COOKIE = "insforge_oauth_verifier";

const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(accessToken: string, refreshToken?: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, { ...baseOptions, maxAge: 60 * 60 * 24 * 7 });
  if (refreshToken) {
    store.set(REFRESH_COOKIE, refreshToken, { ...baseOptions, maxAge: 60 * 60 * 24 * 30 });
  }
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(OAUTH_VERIFIER_COOKIE);
}

export async function setOAuthVerifierCookie(verifier: string) {
  const store = await cookies();
  store.set(OAUTH_VERIFIER_COOKIE, verifier, { ...baseOptions, maxAge: 600 });
}
