import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GeneratedImageGallery, GeneratedImageHero } from "@/components/generated-image-gallery";
import { LikeShareBar } from "@/components/like-share-bar";
import { SiteHeader } from "@/components/site-header";
import { Top100ProjectJsonLd } from "@/components/top100-project-json-ld";
import { GENERATED_GALLERY_COUNT } from "@/lib/generated-media";
import { absoluteGeneratedImageUrl } from "@/lib/generated-media";
import { getRelatedTop100, getTop100ProjectBySlug, getTop100Slugs } from "@/lib/top100-projects";
import { getSiteUrl } from "@/lib/site-url";

export function generateStaticParams() {
  return getTop100Slugs().map((slug) => ({ slug }));
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getTop100ProjectBySlug(slug);
  if (!item) return { title: "Top 100 | the9thedition" };
  const site = getSiteUrl();
  const url = `${site}/top-100/${item.slug}`;
  const og = absoluteGeneratedImageUrl(site, "top100", item.slug, 0);
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
      section: "Top 100",
      tags: item.keywords,
      images: [{ url: og, width: 1600, height: 900, alt: item.image_alts[0] ?? item.title }],
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

export default async function Top100DetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getTop100ProjectBySlug(slug);
  if (!item) notFound();

  const related = getRelatedTop100(item.slug, 4);
  const urlPath = `/top-100/${item.slug}`;
  const paragraphs = item.body.split(/\n\n+/).filter(Boolean);

  return (
    <>
      <Top100ProjectJsonLd item={item} urlPath={urlPath} />
      <SiteHeader />
      <article className="bg-card">
        <div className="border-b border-border">
          <div className="container-premium py-5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
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
                  <Link href="/top-100" className="hover:text-primary">
                    Top 100
                  </Link>
                </li>
                <li aria-hidden className="text-charcoal/30">
                  /
                </li>
                <li className="line-clamp-1 text-foreground">#{String(item.rank).padStart(2, "0")}</li>
              </ol>
            </nav>
          </div>
        </div>

        <header className="border-b border-border bg-gradient-to-b from-card to-background-light">
          <div className="container-premium grid gap-10 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,340px)] md:items-start md:py-14 lg:gap-16">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Top 100 · Rank #{item.rank}</p>
              <h1 className="mt-4 font-serif text-3xl leading-[1.12] text-foreground md:text-4xl lg:text-5xl">{item.title}</h1>
              <div className="article-lede mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span>{item.typology}</span>
                <span aria-hidden>
                  ·
                </span>
                <span>{item.location}</span>
                <span aria-hidden>
                  ·
                </span>
                <span>Region: {item.geo_region}</span>
              </div>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">{item.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                <time dateTime={item.published_at}>Indexed {formatDate(item.published_at)}</time>
              </p>
              <div className="mt-5">
                <LikeShareBar
                  storageId={`top100:${item.slug}`}
                  sharePath={urlPath}
                  title={item.title}
                />
              </div>
            </div>
            <aside className="rounded-2xl border border-border bg-background-light/80 p-6 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Dossier snapshot</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                  <dt className="text-muted-foreground">Rank</dt>
                  <dd className="font-medium text-foreground">#{String(item.rank).padStart(2, "0")}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                  <dt className="text-muted-foreground">Typology</dt>
                  <dd className="text-right font-medium text-foreground">{item.typology}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                  <dt className="text-muted-foreground">Place</dt>
                  <dd className="text-right font-medium text-foreground">{item.location}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Geo focus</dt>
                  <dd className="text-right font-medium text-foreground">{item.geo_region}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </header>

        <GeneratedImageHero
          collection="top100"
          itemKey={item.slug}
          index={0}
          title={item.title}
          alt={item.image_alts[0]}
          priority
        />

        <div className="container-premium max-w-3xl py-12 md:py-16">
          <div className="article-body max-w-none text-base leading-relaxed text-foreground/90">
            {paragraphs.map((p, i) => (
              <p key={i} className="mb-6 last:mb-0">
                {p}
              </p>
            ))}
          </div>

          <GeneratedImageGallery
            className="mt-16 border-t border-border pt-14"
            collection="top100"
            itemKey={item.slug}
            title={item.title}
            from={1}
            count={GENERATED_GALLERY_COUNT - 1}
            alts={item.image_alts}
          />

          <section className="mt-16 border-t border-border pt-12" aria-labelledby="top100-faq">
            <h2 id="top100-faq" className="font-serif text-2xl text-foreground">
              Questions & answers
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Structured for answer engines—verify critical facts with primary sources and local codes for project work.
            </p>
            <dl className="mt-8 space-y-6">
              {item.faq.map((f, i) => (
                <div key={i} className="rounded-xl border border-border bg-background-light p-5">
                  <dt className="font-medium text-foreground">{f.question}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>

          <aside className="mt-14 border-t border-border pt-12">
            <h2 className="font-serif text-2xl text-foreground">Related Top 100 dossiers</h2>
            <ul className="mt-6 space-y-4">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/top-100/${r.slug}`} className="group block text-foreground">
                    <span className="font-serif text-lg group-hover:text-primary">
                      #{String(r.rank).padStart(2, "0")} — {r.title}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">{r.typology}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/top-100"
              className="mt-8 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:underline"
            >
              ← Full Top 100 roadmap
            </Link>
          </aside>
        </div>
      </article>
    </>
  );
}
