/**
 * Canonical origin for auth redirects and absolute URLs.
 * In production, requires APP_ORIGIN or NEXT_PUBLIC_SITE_URL (no Host-header trust).
 */
export function getRequestOrigin(request: Request): string {
  const explicit =
    process.env.APP_ORIGIN?.trim().replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

  if (process.env.NODE_ENV === "production") {
    if (!explicit) {
      throw new Error(
        "APP_ORIGIN or NEXT_PUBLIC_SITE_URL must be set in production for safe redirect URLs.",
      );
    }
    return explicit;
  }

  if (explicit) return explicit;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  if (host) {
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}
