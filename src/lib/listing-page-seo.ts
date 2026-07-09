import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

type ListingParams = {
  page?: number;
  category?: string | null;
  q?: string | null;
};

/** Canonical for listing index pages — paginated / filtered views point to the primary URL. */
export function listingPageCanonical(path: string, params: ListingParams = {}): string {
  const site = getSiteUrl();
  const base = `${site}${path.startsWith("/") ? path : `/${path}`}`;
  const page = params.page ?? 1;
  const category = params.category?.trim() || null;
  const q = params.q?.trim() || null;

  if (page <= 1 && !category && !q) return base;

  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  if (q) qs.set("q", q);
  if (page > 1) qs.set("page", String(page));
  return `${base}?${qs.toString()}`;
}

/** Primary listing URL without filters or pagination — used as canonical for duplicate variants. */
export function listingPrimaryCanonical(path: string): string {
  const site = getSiteUrl();
  return `${site}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Paginated and filtered listing URLs should not be indexed separately.
 * They remain crawlable (follow) so Google can discover linked project/article URLs.
 */
export function listingPageRobots(params: ListingParams = {}): NonNullable<Metadata["robots"]> {
  const page = params.page ?? 1;
  const filtered = Boolean(params.category?.trim() || params.q?.trim());
  const paginated = page > 1;

  if (paginated || filtered) {
    return {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  };
}

export function isListingVariant(params: ListingParams = {}): boolean {
  const page = params.page ?? 1;
  return page > 1 || Boolean(params.category?.trim() || params.q?.trim());
}
