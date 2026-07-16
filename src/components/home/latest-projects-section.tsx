import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { getAllProjects } from "@/lib/project-catalog";

/** All 20 editorial catalog projects (newest folder order: 1 → 20). */
export function LatestProjectsSection() {
  const latest = getAllProjects();

  return (
    <section className="container-premium pt-8">
      <div className="mb-4 flex items-end justify-between border-b border-primary/20 pb-2">
        <h2 className="font-serif text-2xl md:text-3xl">Latest Projects</h2>
        <Link href="/projects" className="text-xs uppercase tracking-[0.18em] text-primary">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {latest.map((project) => (
          <ProjectCard
            key={project.slug}
            project={{
              slug: project.slug,
              title: project.title,
              category: project.category,
              location: project.location,
              image: project.image,
              meta: project.byline ?? null,
            }}
          />
        ))}
      </div>
    </section>
  );
}
