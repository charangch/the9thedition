/** Canonical site origin for metadata, JSON-LD, and Open Graph. Override with NEXT_PUBLIC_SITE_URL. */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://theninthedition.com").replace(/\/$/, "");
}
