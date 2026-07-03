/** Six local JPEGs per archive / articles entry — one luxury building per slug. */
export const EDITORIAL_IMAGE_COUNT = 6;

export type EditorialImageCollection = "archive" | "articles";

export function editorialImagePath(collection: EditorialImageCollection, slug: string, index: number): string {
  const i = Math.max(0, Math.min(EDITORIAL_IMAGE_COUNT - 1, index));
  return `/images/${collection}/${slug}/${i}.jpg`;
}

export function editorialGalleryPaths(collection: EditorialImageCollection, slug: string): string[] {
  return Array.from({ length: EDITORIAL_IMAGE_COUNT }, (_, i) => editorialImagePath(collection, slug, i));
}

export function editorialHeroPath(collection: EditorialImageCollection, slug: string): string {
  return editorialImagePath(collection, slug, 0);
}

export function isEditorialImagePath(src: string): boolean {
  return /^\/images\/(archive|articles)\/[^/]+\/\d+\.jpg$/.test(src);
}

export function absoluteEditorialImageUrl(
  siteOrigin: string,
  collection: EditorialImageCollection,
  slug: string,
  index: number,
): string {
  return `${siteOrigin.replace(/\/$/, "")}${editorialImagePath(collection, slug, index)}`;
}
