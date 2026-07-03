import type { Metadata } from "next";
import { SITE_BRAND, SITE_DESCRIPTION, SITE_KEYWORDS } from "@/lib/site-metadata";
import { getSiteUrl } from "@/lib/site-url";

function withBrand(title: string): string {
  const t = title.trim();
  if (
    t.toLowerCase().includes(SITE_BRAND.toLowerCase()) ||
    t.toLowerCase().includes("the9thedition") ||
    t.toLowerCase().includes("theninthedition")
  ) {
    return t;
  }
  return `${SITE_BRAND} | ${t}`;
}

const defaultOgImagePath = "/images/brand/edition-arch-logo.png";

export function defaultOpenGraphImages(): NonNullable<Metadata["openGraph"]>["images"] {
  const base = getSiteUrl();
  return [
    {
      url: `${base}${defaultOgImagePath}`,
      width: 1200,
      height: 630,
      alt: SITE_BRAND,
    },
  ];
}

export function buildPageMetadata(opts: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
}): Metadata {
  const base = getSiteUrl();
  const description = opts.description ?? SITE_DESCRIPTION;
  const path = opts.path ? (opts.path.startsWith("/") ? opts.path : `/${opts.path}`) : "";
  const url = `${base}${path}`;
  const title = withBrand(opts.title);
  const keywords = opts.keywords ?? SITE_KEYWORDS;
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_BRAND,
      locale: "en_US",
      type: "website",
      images: defaultOpenGraphImages(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}
