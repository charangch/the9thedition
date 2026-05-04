/** On-site procedural images only — no third-party CDNs. Used by /api/generated-image. */
export const GENERATED_GALLERY_COUNT = 20;
/** Bump to invalidate aggressively cached generated image URLs. */
export const GENERATED_MEDIA_VERSION = "20260420-project-scenes-v2";

export type GeneratedCollection = "articles" | "news" | "archive" | "top100" | "projects";

export function generatedImagePath(
  collection: GeneratedCollection,
  key: string,
  index: number,
): `/api/generated-image${string}` {
  const params = new URLSearchParams({
    c: collection,
    k: key,
    i: String(Math.max(0, Math.min(GENERATED_GALLERY_COUNT - 1, index))),
    v: GENERATED_MEDIA_VERSION,
  });
  return `/api/generated-image?${params.toString()}` as `/api/generated-image${string}`;
}

export function generatedGalleryPaths(collection: GeneratedCollection, key: string): `/api/generated-image${string}`[] {
  return Array.from({ length: GENERATED_GALLERY_COUNT }, (_, i) => generatedImagePath(collection, key, i));
}

export function absoluteGeneratedImageUrl(siteOrigin: string, collection: GeneratedCollection, key: string, index: number): string {
  const path = generatedImagePath(collection, key, index);
  return `${siteOrigin.replace(/\/$/, "")}${path}`;
}
