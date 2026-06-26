/** Seven local JPEGs per catalog project (homepage + /projects listing). */
export const CATALOG_PROJECT_IMAGE_COUNT = 7;

export function catalogProjectImagePath(slug: string, index: number): string {
  const i = Math.max(0, Math.min(CATALOG_PROJECT_IMAGE_COUNT - 1, index));
  return `/images/projects/${slug}/${i}.jpg`;
}

export function catalogProjectGalleryPaths(slug: string): string[] {
  return Array.from({ length: CATALOG_PROJECT_IMAGE_COUNT }, (_, i) => catalogProjectImagePath(slug, i));
}

export function isCatalogProjectImagePath(src: string): boolean {
  return /^\/images\/projects\/[^/]+\/\d+\.jpg$/.test(src);
}

export function catalogProjectHeroPath(slug: string): string {
  return catalogProjectImagePath(slug, 0);
}
