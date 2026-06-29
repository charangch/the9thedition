import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EditorialArticlesIndexJsonLd } from "@/components/editorial-article-json-ld";
import { SiteHeader } from "@/components/site-header";
import {
  getAllEditorialArticles,
  getEditorialCategories,
  getFeaturedEditorialArticle,
  listEditorialArticlesPage,
} from "@/lib/editorial-articles";
import { generatedImagePath } from "@/lib/generated-media";
import { getSiteUrl } from "@/lib/site-url";

const PAGE_TITLE = "Articles";
const PAGE_DESC =
  "Long-form editorial features on architects, houses, and building products from the9thedition.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}): Promise<Metadata> {
  const p = await searchParams;
  const page = Math.max(1, parseInt(p.page ?? "1", 10) || 1);
  const cat = p.category?.trim() || null;
  const q = p.q?.trim() || null;
  const site = getSiteUrl();
  const title =
    page > 1 || cat || q
      ? `${PAGE_TITLE}${cat ? ` · ${cat}` : ""}${q ? ` · “${q}”` : ""}${page > 1 ? ` · Page ${page}` : ""} | the9thedition`
      : `${PAGE_TITLE} | the9thedition`;
  const canonicalQs = new URLSearchParams();
  if (cat) canonicalQs.set("category", cat);
  if (q) canonicalQs.set("q", q);
  if (page > 1) canonicalQs.set("page", String(page));
  const canonical = `${site}/articles${canonicalQs.toString() ? `?${canonicalQs}` : ""}`;
  return {
    title,
    description: PAGE_DESC,
    keywords: [
      "architecture articles",
      "architects",
      "houses",
      "building products",
      "interior architecture",
      "design editorial",
      "the9thedition",
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: "The 9th Edition",
      title: `${PAGE_TITLE} | the9thedition`,
      description: PAGE_DESC,
    },
    twitter: {
      card: "summary_large_image",
      title: `${PAGE_TITLE} | the9thedition`,
      description: PAGE_DESC,
    },
    robots: { index: true, follow: true },
  };
}

function formatArticleDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}) {
  const p = await searchParams;
  const page = Math.max(1, parseInt(p.page ?? "1", 10) || 1);
  const category = p.category?.trim() || null;
  const q = p.q?.trim() || null;
  const { items, total, page: currentPage, totalPages } = listEditorialArticlesPage(page, category, q);
  const indexSize = getAllEditorialArticles().length;
  const categories = getEditorialCategories();
  const featured =
    currentPage === 1 && !category && !q ? getFeaturedEditorialArticle() : items[0] ?? null;
  const gridItems =
    currentPage === 1 && !category && !q && featured ? items.filter((x) => x.slug !== featured.slug) : items;

  const baseQs = (nextPage: number, cat: string | null, query: string | null) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (query) params.set("q", query);
    if (nextPage > 1) params.set("page", String(nextPage));
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  return (
    <>
      <EditorialArticlesIndexJsonLd total={indexSize} />
      <SiteHeader />
      <main>
        <section className="border-t border-charcoal/10 bg-background-light py-12 md:py-16">
          <div className="container-premium">
            <form
              className="flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-end"
              action="/articles"
              method="get"
              role="search"
            >
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <label className="flex-1 text-sm text-muted">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal">
                  Search articles
                </span>
                <input
                  name="q"
                  type="search"
                  defaultValue={q ?? ""}
                  placeholder="Architects, materials, regions…"
                  className="mt-1 w-full rounded-lg border border-charcoal/15 bg-white px-4 py-2.5 text-sm text-charcoal outline-none ring-primary/30 placeholder:text-muted focus:ring-2"
                  autoComplete="off"
                />
              </label>
              <button
                type="submit"
                className="rounded-full bg-charcoal px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-charcoal/90"
              >
                Search
              </button>
            </form>

            <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-serif text-2xl text-charcoal md:text-3xl">Library</h2>
                <p className="mt-2 text-sm text-muted">
                  {total} articles
                  {category ? ` in ${category}` : ""}
                  {q ? ` matching “${q}”` : ""} · Page {currentPage} of {totalPages}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={q ? `/articles?q=${encodeURIComponent(q)}` : "/articles"}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                    !category ? "bg-charcoal text-white" : "border border-charcoal/15 bg-white text-charcoal hover:border-primary/40"
                  }`}
                >
                  All
                </Link>
                {categories.map((c) => {
                  const href = (() => {
                    const params = new URLSearchParams();
                    params.set("category", c);
                    if (q) params.set("q", q);
                    return `/articles?${params}`;
                  })();
                  return (
                    <Link
                      key={c}
                      href={href}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                        category === c
                          ? "bg-charcoal text-white"
                          : "border border-charcoal/15 bg-white text-charcoal hover:border-primary/40"
                      }`}
                    >
                      {c}
                    </Link>
                  );
                })}
              </div>
            </div>

            {featured && currentPage === 1 && !category && !q ? (
              <article className="mt-10 border border-charcoal/10 bg-white shadow-sm">
                <Link href={`/articles/${featured.slug}`} className="group grid gap-0 lg:grid-cols-2">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal/5 lg:aspect-auto lg:min-h-[380px]">
                    <Image
                      src={generatedImagePath("articles", featured.slug, 0)}
                      alt={featured.image_alts[0] ?? featured.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col justify-center p-8 md:p-12">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{featured.category}</p>
                    <h3 className="mt-3 font-serif text-2xl leading-snug text-charcoal md:text-3xl lg:text-4xl">
                      <span className="group-hover:text-primary">{featured.title}</span>
                    </h3>
                    <p className="mt-2 text-sm text-muted">{formatArticleDate(featured.published_at)}</p>
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
                    <Link href={`/articles/${item.slug}`} className="group block">
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal/5">
                        <Image
                          src={generatedImagePath("articles", item.slug, 0)}
                          alt={item.image_alts[0] ?? item.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">{item.category}</p>
                        <h3 className="mt-2 font-serif text-lg leading-snug text-charcoal group-hover:text-primary md:text-xl">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-xs text-muted">{formatArticleDate(item.published_at)}</p>
                        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-charcoal/75">{item.excerpt}</p>
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
                    href={`/articles${baseQs(currentPage - 1, category, q)}`}
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
                    href={`/articles${baseQs(currentPage + 1, category, q)}`}
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
