import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveProjectJsonLd } from "@/components/archive-project-json-ld";
import { ArchiveProjectPresentation } from "@/components/archive-project-presentation";
import { SiteHeader } from "@/components/site-header";
import { buildArchiveProjectViewModel } from "@/lib/builder/archive-project-view-model";
import { publishedToArchiveProject } from "@/lib/admin/published-to-archive";
import { absoluteGeneratedImageUrl } from "@/lib/generated-media";
import { getArchiveProjectBySlug, getArchiveProjectSlugs } from "@/lib/archive-projects";
import { getArchivedPublishedBySlug } from "@/lib/published-projects";
import { getSiteUrl } from "@/lib/site-url";

export function generateStaticParams() {
  return getArchiveProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const archivedPublished = await getArchivedPublishedBySlug(slug);
  const item = archivedPublished
    ? publishedToArchiveProject(archivedPublished)
    : getArchiveProjectBySlug(slug);
  if (!item) return { title: "Archive | the9thedition" };
  const site = getSiteUrl();
  const url = `${site}/archive/${item.slug}`;
  const hero = item.hero_image_url?.trim();
  const og =
    hero && (hero.startsWith("http") || hero.startsWith("/"))
      ? hero.startsWith("/")
        ? `${site}${hero}`
        : hero
      : absoluteGeneratedImageUrl(site, "archive", item.slug, 0);
  return {
    title: item.seo_title,
    description: item.seo_description,
    keywords: item.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "en_US",
      url,
      siteName: "the9thedition",
      title: item.title,
      description: item.seo_description,
      publishedTime: item.published_at,
      modifiedTime: item.date_modified,
      section: item.category,
      tags: item.keywords,
      images: [{ url: og, width: 2000, height: 1125, alt: item.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.seo_description,
      images: [og],
    },
    robots: { index: true, follow: true },
    other: {
      "geo.region": item.geo_region,
    },
  };
}

export default async function ArchiveProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const archivedPublished = await getArchivedPublishedBySlug(slug);
  const archivedItem = archivedPublished ? publishedToArchiveProject(archivedPublished) : null;
  const model = archivedItem ? buildArchiveProjectViewModel(archivedItem.slug, archivedItem) : buildArchiveProjectViewModel(slug);
  if (!model) notFound();

  return (
    <>
      <ArchiveProjectJsonLd item={model.item} path={model.path} />
      <SiteHeader />
      <ArchiveProjectPresentation model={model} />
    </>
  );
}
