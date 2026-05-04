import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialArticleJsonLd } from "@/components/editorial-article-json-ld";
import { GeneratedImageGallery, GeneratedImageHero } from "@/components/generated-image-gallery";
import { BlockRenderer } from "@/components/block-renderer";
import { SiteHeader } from "@/components/site-header";
import { getCmsEntryBySlug } from "@/lib/cms";
import { getEditorialArticleBySlug, getEditorialArticleSlugs, getRelatedEditorialArticles } from "@/lib/editorial-articles";
import { absoluteGeneratedImageUrl, GENERATED_GALLERY_COUNT } from "@/lib/generated-media";
import { getPublishedArticleBySlug } from "@/lib/published-articles";
import { getSiteUrl } from "@/lib/site-url";

const CMS_FALLBACK_SLUGS = ["courtyard-typology-return", "stone-lime-modernity"] as const;

export const dynamicParams = true;

export async function generateStaticParams() {
  const editorial = getEditorialArticleSlugs().map((slug) => ({ slug }));
  const cms = CMS_FALLBACK_SLUGS.map((slug) => ({ slug }));
  return [...editorial, ...cms];
}

function formatArticleDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const editorial = getEditorialArticleBySlug(slug);
  if (editorial) {
    const site = getSiteUrl();
    const url = `${site}/articles/${editorial.slug}`;
    const og = absoluteGeneratedImageUrl(site, "articles", editorial.slug, 0);
    return {
      title: editorial.seo_title,
      description: editorial.seo_description,
      keywords: editorial.keywords,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        locale: "en_US",
        url,
        siteName: "the9thedition",
        title: editorial.title,
        description: editorial.seo_description,
        publishedTime: editorial.published_at,
        modifiedTime: editorial.date_modified,
        section: editorial.category,
        tags: editorial.keywords,
        images: [{ url: og, width: 1600, height: 900, alt: editorial.image_alts[0] ?? editorial.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: editorial.title,
        description: editorial.seo_description,
        images: [og],
      },
      robots: { index: true, follow: true },
      other: {
        "geo.region": editorial.geo_region,
      },
    };
  }

  const published = await getPublishedArticleBySlug(slug);
  if (published) {
    return {
      title: `${published.title} | Articles | the9thedition`,
      description: published.excerpt ?? undefined,
    };
  }

  const item = await getCmsEntryBySlug("articles", slug);
  if (item) return { title: `${item.title} | Articles | the9thedition`, description: item.excerpt };
  return { title: "Articles | the9thedition" };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const editorial = getEditorialArticleBySlug(slug);
  if (editorial) {
    const related = getRelatedEditorialArticles(editorial.slug, 4);
    const urlPath = `/articles/${editorial.slug}`;
    const paragraphs = editorial.body.split(/\n\n+/).filter(Boolean);

    return (
      <>
        <EditorialArticleJsonLd item={editorial} urlPath={urlPath} />
        <SiteHeader />
        <article className="bg-white">
          <div className="border-b border-charcoal/10">
            <div className="container-premium py-5 text-[11px] uppercase tracking-[0.16em] text-muted">
              <nav aria-label="Breadcrumb">
                <ol className="flex flex-wrap gap-x-2 gap-y-1">
                  <li>
                    <Link href="/" className="hover:text-primary">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden className="text-charcoal/30">
                    /
                  </li>
                  <li>
                    <Link href="/articles" className="hover:text-primary">
                      Articles
                    </Link>
                  </li>
                  <li aria-hidden className="text-charcoal/30">
                    /
                  </li>
                  <li className="line-clamp-1 text-charcoal">{editorial.title}</li>
                </ol>
              </nav>
            </div>
          </div>

          <header className="border-b border-charcoal/10">
            <div className="container-premium max-w-4xl py-10 md:py-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{editorial.category}</p>
              <h1 className="mt-4 font-serif text-3xl leading-[1.15] text-charcoal md:text-4xl lg:text-5xl">{editorial.title}</h1>
              <div className="article-lede mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                <time dateTime={editorial.published_at}>{formatArticleDate(editorial.published_at)}</time>
                <span aria-hidden>·</span>
                <span>Focus: {editorial.focus_entity}</span>
                <span aria-hidden>·</span>
                <span>Region: {editorial.geo_region}</span>
              </div>
              <p className="mt-6 text-lg leading-relaxed text-charcoal/80 md:text-xl">{editorial.excerpt}</p>
            </div>
          </header>

          <GeneratedImageHero
            collection="articles"
            itemKey={editorial.slug}
            index={0}
            title={editorial.title}
            alt={editorial.image_alts[0]}
            priority
          />

          <div className="container-premium max-w-3xl py-12 md:py-16">
            <div className="article-body prose max-w-none text-base leading-relaxed text-charcoal/85">
              {paragraphs.map((p, i) => (
                <p key={i} className="mb-6 last:mb-0">
                  {p}
                </p>
              ))}
            </div>

            <GeneratedImageGallery
              className="mt-16 border-t border-charcoal/10 pt-14"
              collection="articles"
              itemKey={editorial.slug}
              title={editorial.title}
              from={1}
              count={GENERATED_GALLERY_COUNT - 1}
              alts={editorial.image_alts}
            />

            <section className="mt-16 border-t border-charcoal/10 pt-12" aria-labelledby="article-faq-heading">
              <h2 id="article-faq-heading" className="font-serif text-2xl text-charcoal">
                Questions & answers
              </h2>
              <p className="mt-2 text-sm text-muted">
                Short answers for readers and answer engines (AEO)—verify against local codes and manufacturer data for
                project work.
              </p>
              <dl className="mt-8 space-y-6">
                {editorial.faq.map((f, i) => (
                  <div key={i} className="rounded-xl border border-charcoal/10 bg-surface p-5">
                    <dt className="font-medium text-charcoal">{f.question}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-charcoal/80">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <aside className="mt-14 border-t border-charcoal/10 pt-12">
              <h2 className="font-serif text-2xl text-charcoal">Related articles</h2>
              <ul className="mt-6 space-y-4">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/articles/${r.slug}`} className="group block text-base text-charcoal">
                      <span className="font-serif text-lg group-hover:text-primary">{r.title}</span>
                      <span className="mt-1 block text-xs text-muted">{r.category}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/articles"
                className="mt-8 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:underline"
              >
                ← All articles
              </Link>
            </aside>
          </div>
        </article>
      </>
    );
  }

  const published = await getPublishedArticleBySlug(slug);
  if (published) {
    return (
      <>
        <SiteHeader />
        <article className="container-premium py-14">
          <p className="text-[11px] uppercase tracking-[0.14em] text-primary">{published.category ?? "Article"}</p>
          <h1 className="mt-3 font-serif text-5xl text-charcoal">{published.title}</h1>
          <p className="mt-4 max-w-3xl text-muted">{published.excerpt}</p>
          <div className="mt-8">
            <BlockRenderer
              blocks={published.layout_blocks}
              context={{ pageType: "article", slug: published.slug, title: published.title }}
            />
          </div>
          <div className="prose mt-8 max-w-3xl text-charcoal/90">{published.body ?? published.excerpt}</div>
        </article>
      </>
    );
  }

  const item = await getCmsEntryBySlug("articles", slug);
  if (!item) notFound();
  return (
    <>
      <SiteHeader />
      <article className="container-premium py-14">
        <p className="text-[11px] uppercase tracking-[0.14em] text-primary">{item.category ?? "Article"}</p>
        <h1 className="mt-3 font-serif text-5xl text-charcoal">{item.title}</h1>
        <p className="mt-4 max-w-3xl text-muted">{item.excerpt}</p>
        <div className="prose mt-8 max-w-3xl text-charcoal/90">{item.body ?? item.excerpt}</div>
      </article>
    </>
  );
}
