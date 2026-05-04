import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveProjectJsonLd } from "@/components/archive-project-json-ld";
import { BlockRenderer } from "@/components/block-renderer";
import { GeneratedImageGallery, GeneratedImageHero } from "@/components/generated-image-gallery";
import { LikeShareBar } from "@/components/like-share-bar";
import { ProjectVideoBlock } from "@/components/project-media";
import { SiteHeader } from "@/components/site-header";
import {
  getArchiveProjectBySlug,
  getArchiveProjectSlugs,
  getRelatedArchiveProjects,
} from "@/lib/archive-projects";
import { type LayoutBlock, normalizeLayoutBlocks } from "@/lib/layout-blocks";
import { absoluteGeneratedImageUrl, GENERATED_GALLERY_COUNT } from "@/lib/generated-media";
import { getSiteUrl } from "@/lib/site-url";

export function generateStaticParams() {
  return getArchiveProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getArchiveProjectBySlug(slug);
  if (!item) return { title: "Archive | the9thedition" };
  const site = getSiteUrl();
  const url = `${site}/archive/${item.slug}`;
  const og = absoluteGeneratedImageUrl(site, "archive", item.slug, 0);
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
  const item = getArchiveProjectBySlug(slug);
  if (!item) notFound();

  const related = getRelatedArchiveProjects(item.slug, 4);
  const path = `/archive/${item.slug}`;
  const enquirySlug = `archive/${item.slug}`;

  const editorialBlocks: LayoutBlock[] = normalizeLayoutBlocks([
    {
      id: "arch-ed",
      type: "EditorialText",
      heading: "Archive narrative",
      body: item.content,
    },
  ]);
  const leadBlocks: LayoutBlock[] = normalizeLayoutBlocks([
    {
      id: "arch-lead",
      type: "LeadInquiryForm",
      heading: "Enquire about this project",
    },
  ]);

  return (
    <>
      <ArchiveProjectJsonLd item={item} path={path} />
      <SiteHeader />
      <article className="pb-20">
        <div className="container-premium pt-8">
          <nav className="text-xs uppercase tracking-[0.16em] text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/archive" className="hover:text-primary">
              Archive
            </Link>
            <span className="mx-2">/</span>
            <span className="text-charcoal/80">{item.category}</span>
          </nav>
          <h1 className="archive-lede mt-4 max-w-4xl font-serif text-4xl leading-tight md:text-5xl">{item.title}</h1>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
            <span className="uppercase tracking-[0.12em] text-primary">{item.category}</span>
            {item.location ? <span>{item.location}</span> : null}
            {item.byline ? <span>{item.byline}</span> : null}
          </div>
          <p className="mt-3 text-sm text-muted">
            Region: {item.geo_region} · Indexed {new Date(item.published_at).getFullYear()}
          </p>
          <div className="mt-5">
            <LikeShareBar storageId={`archive:${item.slug}`} sharePath={path} title={item.title} />
          </div>
        </div>

        <div className="container-premium mt-8">
          <div className="overflow-hidden rounded-xl border border-primary/10">
            <GeneratedImageHero collection="archive" itemKey={item.slug} index={0} title={item.title} priority />
          </div>
        </div>

        <div className="container-premium mt-12 grid gap-12 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            <section className="rounded-xl border border-primary/15 bg-surface p-4 text-sm">
              <h2 className="font-serif text-xl text-charcoal">Build details</h2>
              <dl className="mt-3 space-y-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted">Category</dt>
                  <dd>{item.category}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted">Location</dt>
                  <dd>{item.location}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted">Area</dt>
                  <dd>{item.area}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted">Year</dt>
                  <dd>{item.year}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted">Photographer credits</dt>
                  <dd>{item.renderCredits}</dd>
                </div>
              </dl>
            </section>
            <section className="rounded-xl border border-primary/10 bg-surface p-4 text-sm text-charcoal/85">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Also explore</p>
              <Link href="/projects" className="mt-2 inline-block font-medium text-primary hover:underline">
                Current projects →
              </Link>
            </section>
          </aside>

          <div>
            {item.excerpt ? (
              <p className="font-serif text-xl italic leading-snug text-charcoal/85 md:text-2xl">{item.excerpt}</p>
            ) : null}
            <div className="article-body mt-8">
              <BlockRenderer
                blocks={editorialBlocks}
                context={{ pageType: "project", slug: enquirySlug, title: item.title }}
              />
            </div>
            <GeneratedImageGallery
              className="mt-10"
              collection="archive"
              itemKey={item.slug}
              title={item.title}
              from={1}
              count={GENERATED_GALLERY_COUNT - 1}
            />
            <div className="mt-10">
              <BlockRenderer
                blocks={leadBlocks}
                context={{ pageType: "project", slug: enquirySlug, title: item.title }}
              />
            </div>
            {item.video_links[0] ? (
              <ProjectVideoBlock url={item.video_links[0]} title={`${item.title} — video`} />
            ) : null}

            <section className="mt-14 border-t border-charcoal/10 pt-12" aria-labelledby="archive-faq">
              <h2 id="archive-faq" className="font-serif text-2xl text-charcoal">
                Questions & answers
              </h2>
              <p className="mt-2 text-sm text-muted">
                Short answers for readers and AI systems—verify critical facts with the original design team when
                quoting.
              </p>
              <dl className="mt-8 space-y-6">
                {item.faq.map((f, i) => (
                  <div key={i} className="rounded-xl border border-charcoal/10 bg-surface p-5">
                    <dt className="font-medium text-charcoal">{f.question}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-charcoal/80">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {related.length ? (
              <section className="mt-10 rounded-xl border border-primary/10 bg-surface p-5">
                <h3 className="font-serif text-2xl text-charcoal">Related archive projects</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/archive/${r.slug}`}
                      className="rounded-lg border border-primary/10 bg-white px-3 py-3 hover:border-primary/30"
                    >
                      <p className="text-[10px] uppercase tracking-[0.14em] text-primary">{r.category}</p>
                      <p className="mt-1 font-serif text-lg text-charcoal">{r.title}</p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <Link
              href="/archive"
              className="mt-10 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:underline"
            >
              ← Back to archive search
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
