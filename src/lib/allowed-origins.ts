/** Origins allowed for browser CORS on `/api/*`. */

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, "");
}

export function getAllowedOrigins(): string[] {
  const out = new Set<string>();
  const app = process.env.APP_ORIGIN?.trim();
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (app) out.add(normalizeOrigin(app));
  if (site) out.add(normalizeOrigin(site));
  const extra = process.env.ALLOWED_ORIGINS?.split(",") ?? [];
  for (const raw of extra) {
    const o = raw.trim();
    if (o) out.add(normalizeOrigin(o));
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    out.add(normalizeOrigin(`https://${vercel}`));
  }
  if (process.env.NODE_ENV !== "production") {
    out.add("http://localhost:3000");
    out.add("http://127.0.0.1:3000");
  }
  return [...out];
}

export function isOriginAllowed(origin: string | null, allowed: string[]): boolean {
  if (!origin) return true;
  return allowed.includes(normalizeOrigin(origin));
}
