import Image from "next/image";
import Link from "next/link";
import { LikeShareBar } from "@/components/like-share-bar";
import { generatedImagePath } from "@/lib/generated-media";
import { shouldUseUnoptimizedImage } from "@/lib/media/remote-image";
import type { ProjectEntry } from "@/lib/project-catalog";
import type { PublishedProject } from "@/lib/published-projects";

export type ProjectCardModel = {
  slug: string;
  title: string;
  category: string;
  location?: string | null;
  image: string;
  meta?: string | null;
};

export function catalogEntryToProjectCard(project: ProjectEntry): ProjectCardModel {
  return {
    slug: project.slug,
    title: project.title,
    category: project.category,
    image: project.image,
    meta: project.byline ?? null,
  };
}

export function publishedToProjectCard(project: PublishedProject): ProjectCardModel {
  return {
    slug: project.slug,
    title: project.title,
    category: project.category,
    location: project.location,
    image:
      project.hero_image_url ??
      project.image_urls?.[0] ??
      generatedImagePath("projects", project.slug, 0),
    meta: project.byline ?? null,
  };
}

/** Shared project card — matches `/projects` listing markup (production design system). */
export function ProjectCard({ project }: { project: ProjectCardModel }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-primary/15 bg-surface shadow-sm transition hover:border-primary/35 hover:shadow-md">
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
            {project.location ? ` • ${project.location}` : ""}
          </p>
          <h2 className="mt-1 break-words font-serif text-xl leading-snug group-hover:text-primary">{project.title}</h2>
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
  );
}
