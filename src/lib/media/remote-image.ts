/** Hostname from NEXT_PUBLIC_INSFORGE_URL (e.g. 6u6zb4gt.ap-southeast.insforge.app). */
export function insforgeStorageHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_INSFORGE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

/** Use unoptimized Next/Image for on-site generated URLs and InsForge storage. */
export function shouldUseUnoptimizedImage(src: string): boolean {
  if (src.startsWith("/api/generated-image")) return true;
  if (src.includes("insforge.app")) return true;
  const host = insforgeStorageHostname();
  return Boolean(host && src.includes(host));
}
