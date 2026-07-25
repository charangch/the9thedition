import { LatestProjectsCarousel } from "@/components/home/latest-projects-carousel";
import { getAllProjects } from "@/lib/project-catalog";

/** All 20 editorial catalog projects as a right→left drifting carousel. */
export function LatestProjectsSection() {
  const latest = getAllProjects().map((project) => ({
    slug: project.slug,
    title: project.title,
    category: project.category,
    location: project.location?.split(",")[0]?.trim() ?? project.location,
    image: project.image,
    meta: project.byline ?? null,
  }));

  return <LatestProjectsCarousel projects={latest} />;
}
