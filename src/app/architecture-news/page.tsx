import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ArchitectureNewsIndexJsonLd } from "@/components/architecture-news-json-ld";
import {
  getAllArchitectureNews,
  getArchitectureNewsCategories,
  getFeaturedArchitectureNews,
  listArchitectureNewsPage,
} from "@/lib/architecture-news";
import { generatedImagePath } from "@/lib/generated-media";
import { listingPageRobots, listingPrimaryCanonical } from "@/lib/listing-page-seo";

const PAGE_TITLE = "Architecture News";
const PAGE_DESC =
  "Architecture news, construction updates, building technology, materials, urban development, and design policy from the9thedition.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}): Promise<Metadata> {
  const p = await searchParams;
  const page = Math.max(1, parseInt(p.page ?? "1", 10) || 1);
  const cat = p.category ?? null;
  const listingParams = { page, category: cat };
  const primaryCanonical = listingPrimaryCanonical("/architecture-news");
  const title =
    page > 1 || cat
      ? `${PAGE_TITLE}${cat ? ` · ${cat}` : ""}${page > 1 ? ` · Page ${page}` : ""} | the9thedition`
      : `${PAGE_TITLE} | the9thedition`;
  return {
    title,
    description: PAGE_DESC,
    keywords: [
      "architecture news",
      "construction news",
      "building industry",
      "architecture technology",
      "urban development",
      "BIM",
      "sustainable architecture",
    ],
    alternates: { canonical: primaryCanonical },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: primaryCanonical,
      siteName: "The 9th Edition",
      title: `${PAGE_TITLE} | the9thedition`,
      description: PAGE_DESC,
    },
    twitter: {
      card: "summary_large_image",
      title: `${PAGE_TITLE} | the9thedition`,
      description: PAGE_DESC,
    },
    robots: listingPageRobots(listingParams),
  };
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

export default async function ArchitectureNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const p = await searchParams;
  const page = Math.max(1, parseInt(p.page ?? "1", 10) || 1);
  const category = p.category?.trim() || null;
  const { items, total, page: currentPage, totalPages } = listArchitectureNewsPage(page, category);
  const categories = getArchitectureNewsCategories();
  const featured =
    currentPage === 1 && !category ? getFeaturedArchitectureNews() : items[0] ?? null;
  const gridItems =
    currentPage === 1 && !category && featured ? items.filter((x) => x.slug !== featured.slug) : items;

  const baseQs = (nextPage: number, cat: string | null) => {
    const q = new URLSearchParams();
    if (cat) q.set("category", cat);
    if (nextPage > 1) q.set("page", String(nextPage));
    const s = q.toString();
    return s ? `?${s}` : "";
  };

  return (
    <>
      <ArchitectureNewsIndexJsonLd />
      <SiteHeader />
      <main>
        <section className="border-t border-charcoal/10 bg-background-light py-12 md:py-16">
          <div className="container-premium">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-serif text-2xl text-charcoal md:text-3xl">Latest stories</h2>
                <p className="mt-2 text-sm text-muted">
                  {total} articles
                  {category ? ` in ${category}` : ""} · Page {currentPage} of {totalPages}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/architecture-news"
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                    !category ? "bg-charcoal text-white" : "border border-charcoal/15 bg-white text-charcoal hover:border-primary/40"
                  }`}
                >
                  All
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c}
                    href={`/architecture-news?category=${encodeURIComponent(c)}`}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                      category === c
                        ? "bg-charcoal text-white"
                        : "border border-charcoal/15 bg-white text-charcoal hover:border-primary/40"
                    }`}
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>

            {featured && currentPage === 1 && !category ? (
              <article className="mt-10 border border-charcoal/10 bg-white shadow-sm">
                <Link href={`/architecture-news/${featured.slug}`} className="group grid gap-0 lg:grid-cols-2">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal/5 lg:aspect-auto lg:min-h-[380px]">
                    <Image
                      src={generatedImagePath("news", featured.slug, 0)}
                      alt={featured.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col justify-center p-8 md:p-12">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                      {featured.category}
                    </p>
                    <h3 className="mt-3 font-serif text-2xl leading-snug text-charcoal md:text-3xl lg:text-4xl">
                      <span className="group-hover:text-primary">{featured.title}</span>
                    </h3>
                    <p className="mt-2 text-sm text-muted">{formatNewsDate(featured.published_at)}</p>
                    <p className="mt-4 line-clamp-4 text-base leading-relaxed text-charcoal/80">{featured.excerpt}</p>
                    <span className="mt-6 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      Read article →
                    </span>
                  </div>
                </Link>
              </article>
            ) : null}

            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {gridItems.map((item) => (
                <li key={item.id}>
                  <article className="flex h-full flex-col border border-charcoal/10 bg-white shadow-sm transition hover:shadow-md">
                    <Link href={`/architecture-news/${item.slug}`} className="group block">
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal/5">
                        <Image
                          src={generatedImagePath("news", item.slug, 0)}
                          alt={item.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                          {item.category}
                        </p>
                        <h3 className="mt-2 font-serif text-lg leading-snug text-charcoal group-hover:text-primary md:text-xl">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-xs text-muted">{formatNewsDate(item.published_at)}</p>
                        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-charcoal/75">
                          {item.excerpt}
                        </p>
                      </div>
                    </Link>
                  </article>
                </li>
              ))}
            </ul>

            {totalPages > 1 ? (
              <nav
                className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-charcoal/10 pt-10"
                aria-label="Pagination"
              >
                {currentPage > 1 ? (
                  <Link
                    href={`/architecture-news${baseQs(currentPage - 1, category)}`}
                    className="rounded-full border border-charcoal/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] hover:border-primary hover:text-primary"
                  >
                    Previous
                  </Link>
                ) : null}
                <span className="px-4 text-sm text-muted">
                  Page {currentPage} / {totalPages}
                </span>
                {currentPage < totalPages ? (
                  <Link
                    href={`/architecture-news${baseQs(currentPage + 1, category)}`}
                    className="rounded-full border border-charcoal/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] hover:border-primary hover:text-primary"
                  >
                    Next
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}
