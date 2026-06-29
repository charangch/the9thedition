import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchitectureNewsArticleJsonLd } from "@/components/architecture-news-json-ld";
import { SiteHeader } from "@/components/site-header";
import { GeneratedImageGallery, GeneratedImageHero } from "@/components/generated-image-gallery";
import {
  getArchitectureNewsBySlug,
  getArchitectureNewsSlugs,
  getRelatedArchitectureNews,
} from "@/lib/architecture-news";
import { absoluteGeneratedImageUrl, GENERATED_GALLERY_COUNT } from "@/lib/generated-media";
import { getSiteUrl } from "@/lib/site-url";

export async function generateStaticParams() {
  return getArchitectureNewsSlugs().map((slug) => ({ slug }));
}

function formatNewsDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getArchitectureNewsBySlug(slug);
  if (!item) return { title: "Architecture News | the9thedition" };
  const site = getSiteUrl();
  const url = `${site}/architecture-news/${item.slug}`;
  const og = absoluteGeneratedImageUrl(site, "news", item.slug, 0);
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
      images: [{ url: og, width: 1600, height: 900, alt: item.title }],
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
      "article:author": item.author,
    },
  };
}

export default async function ArchitectureNewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getArchitectureNewsBySlug(slug);
  if (!item) notFound();
  const related = getRelatedArchitectureNews(item.slug, 4);
  const urlPath = `/architecture-news/${item.slug}`;

  const paragraphs = item.body.split(/\n\n+/).filter(Boolean);

  return (
    <>
      <ArchitectureNewsArticleJsonLd item={item} urlPath={urlPath} />
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
                  <Link href="/architecture-news" className="hover:text-primary">
                    Architecture News
                  </Link>
                </li>
                <li aria-hidden className="text-charcoal/30">
                  /
                </li>
                <li className="line-clamp-1 text-charcoal">{item.title}</li>
              </ol>
            </nav>
          </div>
        </div>

        <header className="border-b border-charcoal/10">
          <div className="container-premium max-w-4xl py-10 md:py-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{item.category}</p>
            <h1 className="mt-4 font-serif text-3xl leading-[1.15] text-charcoal md:text-4xl lg:text-5xl">{item.title}</h1>
            <div className="article-lede mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <time dateTime={item.published_at}>{formatNewsDate(item.published_at)}</time>
              <span aria-hidden>·</span>
              <span>{item.author}</span>
              <span aria-hidden>·</span>
              <span>Region: {item.geo_region}</span>
            </div>
            <p className="mt-6 text-lg leading-relaxed text-charcoal/80 md:text-xl">{item.excerpt}</p>
          </div>
        </header>

        <GeneratedImageHero collection="news" itemKey={item.slug} index={0} title={item.title} priority />

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
            collection="news"
            itemKey={item.slug}
            title={item.title}
            from={1}
            count={GENERATED_GALLERY_COUNT - 1}
          />

          {item.faq.length ? (
            <section className="mt-16 border-t border-charcoal/10 pt-12" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="font-serif text-2xl text-charcoal">
                Questions & answers
              </h2>
              <dl className="mt-8 space-y-6">
                {item.faq.map((f, i) => (
                  <div key={i} className="rounded-xl border border-charcoal/10 bg-surface p-5">
                    <dt className="font-medium text-charcoal">{f.question}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-charcoal/80">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <aside className="mt-14 border-t border-charcoal/10 pt-12">
            <h2 className="font-serif text-2xl text-charcoal">Related architecture news</h2>
            <ul className="mt-6 space-y-4">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/architecture-news/${r.slug}`} className="group block text-base text-charcoal">
                    <span className="font-serif text-lg group-hover:text-primary">{r.title}</span>
                    <span className="mt-1 block text-xs text-muted">{r.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/architecture-news"
              className="mt-8 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:underline"
            >
              ← All architecture news
            </Link>
          </aside>
        </div>
      </article>
    </>
  );
}
