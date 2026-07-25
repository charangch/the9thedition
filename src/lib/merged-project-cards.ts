import type { ProjectCardModel } from "@/components/project-card";
import { publishedToProjectCard } from "@/components/project-card";
import { getAllProjects, resolveProjectHeroImage } from "@/lib/project-catalog";
import { getPublishedProjects, type PublishedProject } from "@/lib/published-projects";

function catalogCards(): ProjectCardModel[] {
  return getAllProjects().map((project) => ({
    slug: project.slug,
    title: project.title,
    category: project.category,
    location: project.location?.split(",")[0]?.trim() ?? project.location,
    image: resolveProjectHeroImage(project.slug),
    meta: project.byline ?? null,
  }));
}

function publishedCard(project: PublishedProject): ProjectCardModel {
  const card = publishedToProjectCard(project);
  return {
    ...card,
    location: card.location?.split(",")[0]?.trim() ?? card.location,
  };
}

/**
 * Catalog editorial projects + admin-published projects (newest published first).
 * Dedupes by slug — published rows win when both exist.
 */
export async function getMergedProjectCards(limit = 240): Promise<ProjectCardModel[]> {
  const published = await getPublishedProjects(limit);
  const bySlug = new Map<string, ProjectCardModel>();

  for (const p of published) {
    bySlug.set(p.slug, publishedCard(p));
  }
  for (const p of catalogCards()) {
    if (!bySlug.has(p.slug)) bySlug.set(p.slug, p);
  }

  const publishedOrder = published.map((p) => p.slug);
  const ordered: ProjectCardModel[] = [];
  const seen = new Set<string>();

  for (const slug of publishedOrder) {
    const card = bySlug.get(slug);
    if (!card || seen.has(slug)) continue;
    ordered.push(card);
    seen.add(slug);
  }
  for (const card of catalogCards()) {
    if (seen.has(card.slug)) continue;
    ordered.push(card);
    seen.add(card.slug);
  }

  return ordered;
}
