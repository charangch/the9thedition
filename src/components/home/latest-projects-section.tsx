import { LatestProjectsCarousel } from "@/components/home/latest-projects-carousel";
import { getMergedProjectCards } from "@/lib/merged-project-cards";

/** Latest catalog + admin-published projects, button/drag carousel. */
export async function LatestProjectsSection() {
  const latest = await getMergedProjectCards(80);
  return <LatestProjectsCarousel projects={latest} />;
}
