import { unstable_cache } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { LikeShareBar } from "@/components/like-share-bar";
import { SiteHeader } from "@/components/site-header";
import { EditorsRadar } from "@/components/editors-radar";
import {
  directoryPicks,
  editorsRadar,
  featuredStories,
  leadStory,
  marketAndNews,
  newsletterHighlights,
  projectSpotlights,
  secondaryLeadStories,
} from "@/lib/content";
import {
  featuredStorySlugs,
  getProjectBySlug,
  getSectionStoriesResolved,
  projectSpotlightSlugs,
  projectsByCategory,
} from "@/lib/project-catalog";
import { generatedImagePath } from "@/lib/generated-media";
import { getFeaturedPublishedProjects, getTrendingPublishedProjects } from "@/lib/published-projects";

const loadHomePublishedRails = unstable_cache(
  async () => {
    const [featuredByAdmin, trendingByDb] = await Promise.all([
      getFeaturedPublishedProjects(4),
      getTrendingPublishedProjects(3),
    ]);
    return { featuredByAdmin, trendingByDb };
  },
  ["home-published-featured-trending"],
  { revalidate: 90 },
);

export default async function Home() {
  const sectionResolved = getSectionStoriesResolved();
  const { featuredByAdmin, trendingByDb } = await loadHomePublishedRails();

  return (
    <div className="pb-16">
      <SiteHeader />

      <EditorsRadar items={editorsRadar} />

      {featuredByAdmin.length ? (
        <section className="container-premium pt-8">
          <div className="mb-4 flex items-end justify-between border-b border-primary/20 pb-2">
            <h2 className="font-serif text-2xl md:text-3xl">Featured by Admin</h2>
            <Link href="/projects" className="text-xs uppercase tracking-[0.18em] text-primary">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredByAdmin.map((p) => (
              <article
                key={p.slug}
                className="flex flex-col overflow-hidden rounded-xl border border-primary/15 bg-surface transition hover:border-primary/35"
              >
                <Link href={`/projects/${p.slug}`} className="group block flex-1 p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-primary">
                    {p.category || "Featured"}
                  </p>
                  <h3 className="mt-1 font-serif text-xl leading-snug group-hover:text-primary">{p.title}</h3>
                  {p.excerpt ? <p className="mt-2 text-sm text-muted">{p.excerpt}</p> : null}
                </Link>
                <div className="border-t border-primary/10 px-4 py-3">
                  <LikeShareBar
                    storageId={`project:${p.slug}`}
                    sharePath={`/projects/${p.slug}`}
                    title={p.title}
                    compact
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container-premium pt-8">
        <div className="mb-4 flex items-end justify-between border-b border-primary/20 pb-2">
          <h2 className="font-serif text-2xl md:text-3xl">Projects by Category</h2>
          <Link href="/projects" className="text-xs uppercase tracking-[0.18em] text-primary">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {projectsByCategory.map(({ category, slug }) => {
            const p = getProjectBySlug(slug);
            if (!p) return null;
            return (
              <article
                key={slug}
                className="flex flex-col overflow-hidden rounded-xl border border-primary/15 bg-surface shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <Link href={`/projects/${slug}`} className="group block flex-1">
                  <div className="relative aspect-[4/3] overflow-hidden bg-charcoal/5">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                      {category}
                    </p>
                    <p className="mt-1 font-serif text-base leading-snug text-charcoal group-hover:text-primary md:text-lg">
                      {p.title}
                    </p>
                  </div>
                </Link>
                <div className="border-t border-primary/10 px-3 py-2">
                  <LikeShareBar
                    storageId={`project:${slug}`}
                    sharePath={`/projects/${slug}`}
                    title={p.title}
                    compact
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container-premium pt-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <article className="overflow-hidden rounded-xl border border-primary/15 bg-surface lg:col-span-7">
            <div className="relative aspect-[16/10]">
              <Image
                src={leadStory.image}
                alt={leadStory.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                {leadStory.category}
              </p>
              <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{leadStory.title}</h1>
              <p className="mt-4 text-sm leading-relaxed text-muted">{leadStory.excerpt}</p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.15em] text-charcoal/60">
                {leadStory.byline}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/articles"
                  className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                >
                  Read Cover Story
                </Link>
                <Link
                  href="/projects"
                  className="rounded-full border border-primary/25 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal"
                >
                  Explore Projects
                </Link>
              </div>
            </div>
          </article>

          <aside className="rounded-xl border border-primary/15 bg-surface p-5 lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Top Stories
            </p>
            <div className="mt-4 space-y-5">
              {secondaryLeadStories.map((story) => (
                <article key={story.title} className="grid grid-cols-[96px_1fr] gap-3 border-b border-primary/10 pb-4 last:border-0 last:pb-0">
                  <div className="relative h-20 overflow-hidden rounded-md">
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-primary/90">{story.category}</p>
                    <h2 className="mt-1 font-serif text-lg leading-tight">{story.title}</h2>
                    <p className="mt-1 text-xs text-muted">{story.byline}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-primary/15 bg-background-light p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-primary">Market & News</p>
              <ul className="mt-3 space-y-2">
                {marketAndNews.slice(0, 4).map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-charcoal/85">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="container-premium mt-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-4 flex items-end justify-between border-b border-primary/20 pb-2">
              <h2 className="font-serif text-3xl">Projects & Homes</h2>
              <Link href="/projects" className="text-xs uppercase tracking-[0.18em] text-primary">
                View all
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {projectSpotlights.map((story, i) => {
                const slug = projectSpotlightSlugs[i];
                if (!slug) return null;
                const inner = (
                  <>
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-primary">
                        {story.category}
                        {story.location ? ` • ${story.location}` : ""}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl leading-snug">{story.title}</h3>
                      <p className="mt-2 text-sm text-muted">{story.excerpt}</p>
                    </div>
                  </>
                );
                return (
                  <article
                    key={story.title}
                    className="flex flex-col overflow-hidden rounded-xl border border-primary/15 bg-surface transition hover:border-primary/35"
                  >
                    <Link href={`/projects/${slug}`} className="group block flex-1">
                      {inner}
                    </Link>
                    <div className="border-t border-primary/10 px-4 py-3">
                      <LikeShareBar
                        storageId={`project:${slug}`}
                        sharePath={`/projects/${slug}`}
                        title={story.title}
                        compact
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="space-y-5 lg:col-span-4">
            <div className="rounded-xl border border-primary/15 bg-surface p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Directory Picks
              </p>
              <ul className="mt-4 space-y-3">
                {directoryPicks.map((item) => (
                  <li key={item} className="border-b border-primary/10 pb-3 text-sm leading-relaxed last:border-0 last:pb-0">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-primary/15 bg-surface p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Newsletter Briefing
              </p>
              <ul className="mt-3 space-y-2">
                {newsletterHighlights.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-charcoal/85">
                    • {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/newsletter"
                className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
              >
                Subscribe
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="container-premium mt-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-primary/15 bg-surface p-5">
            <h3 className="font-serif text-2xl">Homes</h3>
            <div className="mt-4 space-y-5">
              {sectionResolved.homes.map((story) => (
                <article
                  key={story.slug}
                  className="border-b border-primary/10 pb-5 last:border-0 last:pb-0"
                >
                  <Link
                    href={`/projects/${story.slug}`}
                    className="group flex gap-3"
                  >
                    <div className="relative h-[4.5rem] w-[5.25rem] shrink-0 overflow-hidden rounded-md bg-charcoal/5 sm:h-20 sm:w-28">
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        sizes="112px"
                        className="object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-primary">{story.category}</p>
                      <h4 className="mt-1 break-words font-serif text-lg leading-snug group-hover:text-primary">
                        {story.title}
                      </h4>
                    </div>
                  </Link>
                  <div className="mt-3 border-t border-primary/10 pt-3">
                    <LikeShareBar
                      storageId={`project:${story.slug}`}
                      sharePath={`/projects/${story.slug}`}
                      title={story.title}
                      compact
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-primary/15 bg-surface p-5">
            <h3 className="font-serif text-2xl">Projects</h3>
            <div className="mt-4 space-y-5">
              {sectionResolved.projects.map((story) => (
                <article
                  key={story.slug}
                  className="border-b border-primary/10 pb-5 last:border-0 last:pb-0"
                >
                  <Link
                    href={`/projects/${story.slug}`}
                    className="group flex gap-3"
                  >
                    <div className="relative h-[4.5rem] w-[5.25rem] shrink-0 overflow-hidden rounded-md bg-charcoal/5 sm:h-20 sm:w-28">
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        sizes="112px"
                        className="object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-primary">{story.category}</p>
                      <h4 className="mt-1 break-words font-serif text-lg leading-snug group-hover:text-primary">
                        {story.title}
                      </h4>
                    </div>
                  </Link>
                  <div className="mt-3 border-t border-primary/10 pt-3">
                    <LikeShareBar
                      storageId={`project:${story.slug}`}
                      sharePath={`/projects/${story.slug}`}
                      title={story.title}
                      compact
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-primary/15 bg-surface p-5">
            <h3 className="font-serif text-2xl">Culture</h3>
            <div className="mt-4 space-y-5">
              {sectionResolved.culture.map((story) => (
                <article
                  key={story.slug}
                  className="border-b border-primary/10 pb-5 last:border-0 last:pb-0"
                >
                  <Link
                    href={`/projects/${story.slug}`}
                    className="group flex gap-3"
                  >
                    <div className="relative h-[4.5rem] w-[5.25rem] shrink-0 overflow-hidden rounded-md bg-charcoal/5 sm:h-20 sm:w-28">
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        sizes="112px"
                        className="object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-primary">{story.category}</p>
                      <h4 className="mt-1 break-words font-serif text-lg leading-snug group-hover:text-primary">
                        {story.title}
                      </h4>
                    </div>
                  </Link>
                  <div className="mt-3 border-t border-primary/10 pt-3">
                    <LikeShareBar
                      storageId={`project:${story.slug}`}
                      sharePath={`/projects/${story.slug}`}
                      title={story.title}
                      compact
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-premium mt-10">
        <div className="rounded-xl border border-primary/15 bg-surface p-6">
          <div className="mb-5 flex items-end justify-between border-b border-primary/20 pb-3">
            <h2 className="font-serif text-3xl">Trending Now</h2>
            <Link href="/archive" className="text-xs uppercase tracking-[0.18em] text-primary">
              Archive
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(trendingByDb.length
              ? trendingByDb.map((p) => ({
                  title: p.title,
                  excerpt: p.excerpt ?? "",
                  image: p.hero_image_url ?? p.image_urls[0] ?? generatedImagePath("projects", p.slug, 0),
                  category: p.category || "Trending",
                  slug: p.slug,
                }))
              : featuredStories.map((story, i) => ({
                  ...story,
                  slug: featuredStorySlugs[i] ?? "",
                }))).map((story) => {
              if (!story.slug) return null;
              const imgUnopt = story.image.startsWith("/api/");
              return (
                <article
                  key={story.slug}
                  className="flex h-full flex-col overflow-hidden rounded-xl border border-primary/10 bg-background-light/60 shadow-sm transition hover:border-primary/25 hover:shadow-md"
                >
                  <Link href={`/projects/${story.slug}`} className="group block flex-1">
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal/5">
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        unoptimized={imgUnopt}
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-primary">{story.category}</p>
                      <h3 className="mt-1 break-words font-serif text-xl leading-snug group-hover:text-primary">
                        {story.title}
                      </h3>
                      {story.excerpt ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{story.excerpt}</p>
                      ) : null}
                    </div>
                  </Link>
                  <div className="mt-auto border-t border-primary/10 px-4 py-3">
                    <LikeShareBar
                      storageId={`project:${story.slug}`}
                      sharePath={`/projects/${story.slug}`}
                      title={story.title}
                      compact
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
