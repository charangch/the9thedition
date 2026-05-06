import type { Metadata } from "next";
import { SITE_BRAND, SITE_DESCRIPTION } from "@/lib/site-metadata";
import { getSiteUrl } from "@/lib/site-url";

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
}): Metadata {
  const base = getSiteUrl();
  const description = opts.description ?? SITE_DESCRIPTION;
  const path = opts.path ? (opts.path.startsWith("/") ? opts.path : `/${opts.path}`) : "";
  const url = `${base}${path}`;
  return {
    title: opts.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description,
      url,
      siteName: SITE_BRAND,
      locale: "en_US",
      type: "website",
      images: defaultOpenGraphImages(),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description,
    },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
