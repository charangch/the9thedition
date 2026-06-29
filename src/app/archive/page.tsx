import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArchiveIndexJsonLd } from "@/components/archive-project-json-ld";
import { LikeShareBar } from "@/components/like-share-bar";
import { SiteHeader } from "@/components/site-header";
import {
  getArchiveCategories,
  getFeaturedArchiveProject,
  listArchiveProjects,
  type ArchiveProject,
} from "@/lib/archive-projects";
import { publishedToArchiveProject } from "@/lib/admin/published-to-archive";
import { getArchivedPublishedForArchive } from "@/lib/published-projects";
import { generatedImagePath } from "@/lib/generated-media";
import { getSiteUrl } from "@/lib/site-url";

const PAGE_TITLE = "Project Archive";
const PAGE_DESC =
  "Browse cultural, residential, civic, and landscape projects in the the9thedition archive—with photography, credits, and editorial notes.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}): Promise<Metadata> {
  const p = await searchParams;
  const page = Math.max(1, parseInt(p.page ?? "1", 10) || 1);
  const cat = p.category ?? null;
  const q = p.q ?? null;
  const site = getSiteUrl();
  const title =
    page > 1 || cat || q
      ? `${PAGE_TITLE}${cat ? ` · ${cat}` : ""}${q ? ` · “${q}”` : ""}${page > 1 ? ` · Page ${page}` : ""} | the9thedition`
      : `${PAGE_TITLE} | the9thedition`;
  return {
    title,
    description: PAGE_DESC,
    keywords: [
      "architecture archive",
      "project archive",
      "built works",
      "architecture search",
      "design precedent",
      "construction",
      "the9thedition",
    ],
    alternates: { canonical: `${site}/archive` },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `${site}/archive`,
      siteName: "The 9th Edition",
      title: `${PAGE_TITLE} | the9thedition`,
      description: PAGE_DESC,
    },
    twitter: { card: "summary_large_image", title: `${PAGE_TITLE} | the9thedition`, description: PAGE_DESC },
    robots: { index: true, follow: true },
  };
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}) {
  const p = await searchParams;
  const page = Math.max(1, parseInt(p.page ?? "1", 10) || 1);
  const category = p.category?.trim() || null;
  const q = p.q?.trim() || null;
  const archivedPublished =
    page === 1 && !category && !q ? await getArchivedPublishedForArchive(24) : [];
  const archivedAsArchive: ArchiveProject[] = archivedPublished.map(publishedToArchiveProject);
  const archivedSlugs = new Set(archivedAsArchive.map((x) => x.slug));

  const staticList = listArchiveProjects({ page, category, q });
  const mergedItems: ArchiveProject[] =
    page === 1 && !category && !q
      ? [
          ...archivedAsArchive,
          ...staticList.items.filter((x) => !archivedSlugs.has(x.slug)),
        ]
      : staticList.items;

  const items = mergedItems;
  const total = staticList.total + (page === 1 && !category && !q ? archivedAsArchive.length : 0);
  const currentPage = staticList.page;
  const totalPages = staticList.totalPages;
  const categories = getArchiveCategories();
  const showFeatured = currentPage === 1 && !category && !q && archivedAsArchive.length === 0;
  const featured = showFeatured ? getFeaturedArchiveProject() : null;
  const gridItems =
    showFeatured && featured ? items.filter((x) => x.slug !== featured.slug) : items;

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
      <ArchiveIndexJsonLd />
      <SiteHeader />
      <main className="min-h-screen bg-white">
        <section className="border-b border-charcoal/10 bg-neutral-50/80">
          <div className="container-premium py-10 md:py-14">
            <form action="/archive" method="GET" className="flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="archive-search">
                Search projects
              </label>
              <input
                id="archive-search"
                name="q"
                type="search"
                defaultValue={q ?? ""}
                placeholder="Search by title, place, architect…"
                className="w-full rounded-lg border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal shadow-sm outline-none ring-primary/20 placeholder:text-muted focus:border-primary/40 focus:ring-2"
              />
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <button
                type="submit"
                className="rounded-lg bg-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-charcoal/90"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="border-t border-charcoal/10 py-12 md:py-16">
          <div className="container-premium">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-serif text-2xl text-charcoal md:text-3xl">Results</h2>
                <p className="mt-2 text-sm text-muted">
                  {total} project{total === 1 ? "" : "s"}
                  {category ? ` · ${category}` : ""}
                  {q ? ` · matching “${q}”` : ""} · Page {currentPage} of {totalPages}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/archive"
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                    !category ? "bg-charcoal text-white" : "border border-charcoal/15 bg-white text-charcoal hover:border-primary/40"
                  }`}
                >
                  All topics
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c}
                    href={q ? `/archive?category=${encodeURIComponent(c)}&q=${encodeURIComponent(q)}` : `/archive?category=${encodeURIComponent(c)}`}
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

            {featured && showFeatured ? (
              <article className="mt-10 border border-charcoal/10 bg-white shadow-sm">
                <Link href={`/archive/${featured.slug}`} className="group grid gap-0 lg:grid-cols-2">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal/5 lg:aspect-auto lg:min-h-[360px]">
                    <Image
                      src={generatedImagePath("archive", featured.slug, 0)}
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
                    <p className="mt-2 text-sm text-muted">
                      {featured.location} · {formatDate(featured.published_at)}
                    </p>
                    <p className="mt-4 line-clamp-4 text-base leading-relaxed text-charcoal/80">{featured.excerpt}</p>
                    <span className="mt-6 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      Open project →
                    </span>
                  </div>
                </Link>
                <div className="border-t border-charcoal/10 px-8 py-4 md:px-12">
                  <LikeShareBar
                    storageId={`archive:${featured.slug}`}
                    sharePath={`/archive/${featured.slug}`}
                    title={featured.title}
                    compact
                  />
                </div>
              </article>
            ) : null}

            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {gridItems.map((project) => (
                <li key={project.id}>
                  <article className="flex h-full flex-col overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm transition hover:shadow-md">
                    <Link href={`/archive/${project.slug}`} className="group block flex-1">
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal/5">
                        <Image
                          src={generatedImagePath("archive", project.slug, 0)}
                          alt={project.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                          {project.category}
                          {project.location ? ` · ${project.location.split(",")[0]}` : ""}
                        </p>
                        <h3 className="mt-2 font-serif text-lg leading-snug text-charcoal group-hover:text-primary md:text-xl">
                          {project.title}
                        </h3>
                        <p className="mt-2 text-xs text-muted">{project.byline}</p>
                        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-charcoal/75">
                          {project.excerpt}
                        </p>
                      </div>
                    </Link>
                    <div className="border-t border-charcoal/10 px-5 py-3">
                      <LikeShareBar
                        storageId={`archive:${project.slug}`}
                        sharePath={`/archive/${project.slug}`}
                        title={project.title}
                        compact
                      />
                    </div>
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
                    href={`/archive${baseQs(currentPage - 1, category, q)}`}
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
                    href={`/archive${baseQs(currentPage + 1, category, q)}`}
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
