import Image from "next/image";
import Link from "next/link";
import { LikeShareBar } from "@/components/like-share-bar";
import { ProjectCard } from "@/components/project-card";
import { SiteHeader } from "@/components/site-header";
import { getAllProjects } from "@/lib/project-catalog";
import { shouldUseUnoptimizedImage } from "@/lib/media/remote-image";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata = buildPageMetadata({
  title: "Architecture & design projects",
  description:
    "Explore twenty luxury architecture and interior design projects from The Ninth Edition — residential, hospitality, and cultural works with photography and editorial documentation.",
  path: "/projects",
});

export default function ProjectsPage() {
  const rows = getAllProjects();

  return (
    <>
      <SiteHeader />
      <main className="container-premium pb-16 pt-10">
        <div className="max-w-3xl">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">Projects</h1>
          <p className="mt-4 text-muted">
            The Ninth Edition project library — architecture and interior design with photography,
            build details, and full editorial pages.
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
                    unoptimized={shouldUseUnoptimizedImage(project.image)}
                  />
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-primary">
                    {project.category}
                    {project.location ? ` • ${project.location.split(",")[0]}` : ""}
                  </p>
                  <h2 className="mt-1 break-words font-serif text-xl leading-snug group-hover:text-primary">
                    {project.title}
                  </h2>
                  {project.byline ? (
                    <p className="mt-2 text-xs text-muted">
                      <span className="text-charcoal/80">{project.byline}</span>
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
