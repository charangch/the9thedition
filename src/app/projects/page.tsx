import Image from "next/image";
import Link from "next/link";
import { LikeShareBar } from "@/components/like-share-bar";
import { SiteHeader } from "@/components/site-header";
import { getArchitectBySlug } from "@/lib/architects";
import { generatedImagePath } from "@/lib/generated-media";
import { getPublishedProjects } from "@/lib/published-projects";
import { getAllProjects } from "@/lib/project-catalog";

export default async function ProjectsPage() {
  const [published, staticProjects] = await Promise.all([getPublishedProjects(120), Promise.resolve(getAllProjects())]);
  const staticRows = staticProjects
    .filter((project) => !published.some((p) => p.slug === project.slug))
    .map((project) => {
      const architect = getArchitectBySlug(project.architectSlug);
      return {
        slug: project.slug,
        title: project.title,
        category: project.category,
        location: project.location,
        image: project.image,
        meta: architect?.firm ?? null,
      };
    });
  const rows = [
    ...published.map((project) => ({
      slug: project.slug,
      title: project.title,
      category: project.category,
      location: project.location,
      image: project.hero_image_url ?? project.image_urls[0] ?? generatedImagePath("projects", project.slug, 0),
      meta: project.byline ?? null,
    })),
    ...staticRows,
  ];

  return (
    <>
      <SiteHeader />
      <main className="container-premium pb-16 pt-10">
        <div className="max-w-3xl">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">Projects</h1>
          <p className="mt-4 text-muted">
            Every project featured on the homepage lives here too — the same editorial catalog, with
            architect credits and full detail pages.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((project) => (
            <article
              key={project.slug}
              className="flex flex-col overflow-hidden rounded-xl border border-primary/15 bg-surface shadow-sm transition hover:border-primary/35 hover:shadow-md"
            >
              <Link href={`/projects/${project.slug}`} className="group block flex-1">
                <div className="relative aspect-[16/10] bg-charcoal/5">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    unoptimized={project.image.startsWith("/api/generated-image")}
                  />
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-primary">
                    {project.category}
                    {project.location ? ` • ${project.location}` : ""}
                  </p>
                  <h2 className="mt-1 break-words font-serif text-xl leading-snug group-hover:text-primary">
                    {project.title}
                  </h2>
                  {project.meta ? (
                    <p className="mt-2 text-xs text-muted">
                      <span className="text-charcoal/80">{project.meta}</span>
                    </p>
                  ) : null}
                </div>
              </Link>
              <div className="border-t border-primary/10 px-4 py-3">
                <LikeShareBar
                  storageId={`project:${project.slug}`}
                  sharePath={`/projects/${project.slug}`}
                  title={project.title}
                  compact
                />
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
