import Link from "next/link";
import { ProjectCard, type ProjectCardModel } from "@/components/project-card";
import { generatedImagePath } from "@/lib/generated-media";
import { getLatestPublishedProjects } from "@/lib/published-projects";

/** FIFO homepage rail — newest admin-published projects first (additive section). */
export async function LatestProjectsSection() {
  const latest = await getLatestPublishedProjects(6);
  if (!latest.length) return null;

  const cards: ProjectCardModel[] = latest.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category || "Architecture & Design",
    location: p.location,
    image: p.hero_image_url ?? p.image_urls[0] ?? generatedImagePath("projects", p.slug, 0),
    meta: p.byline ?? null,
  }));

  return (
    <section className="container-premium pt-8">
      <div className="mb-4 flex items-end justify-between border-b border-primary/20 pb-2">
        <h2 className="font-serif text-2xl md:text-3xl">Latest Projects</h2>
        <Link href="/projects" className="text-xs uppercase tracking-[0.18em] text-primary">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
