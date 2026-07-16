import { catalogProjectHeroPath } from "@/lib/catalog-project-images";
import { generatedImagePath } from "@/lib/generated-media";
import {
  getAllProjectEntries,
  getNinthEditionProjectBySlug,
  getNinthEditionProjectSlugs,
  getRelatedProjectEntries,
} from "@/lib/ninth-edition-projects";
import type { ProjectEntry } from "@/lib/project-catalog-types";

export type { ProjectEntry } from "@/lib/project-catalog-types";

/** All projects at `/projects/[slug]` — The Ninth Edition editorial set (20). */
export const projectCatalog: ProjectEntry[] = getAllProjectEntries();

const bySlug = new Map(projectCatalog.map((p) => [p.slug, p]));

export function getProjectBySlug(slug: string): ProjectEntry | undefined {
  return bySlug.get(slug);
}

export function getAllProjects(): ProjectEntry[] {
  return projectCatalog;
}

export function getProjectsByArchitectSlug(architectSlug: string): ProjectEntry[] {
  return projectCatalog.filter((p) => p.architectSlug === architectSlug);
}

export function getRelatedProjects(current: ProjectEntry, max = 24): ProjectEntry[] {
  return getRelatedProjectEntries(current, max);
}

export function getAllProjectSlugs(): string[] {
  return getNinthEditionProjectSlugs();
}

export function isCatalogProjectSlug(slug: string): boolean {
  return Boolean(getNinthEditionProjectBySlug(slug));
}

type ProjectHeroSource = {
  dbHero?: string | null;
  dbGallery?: readonly string[] | null;
};

export function resolveProjectHeroImage(slug: string, source: ProjectHeroSource = {}): string {
  const catalog = getProjectBySlug(slug);
  if (catalog) return catalogProjectHeroPath(slug);

  const hero = source.dbHero?.trim();
  if (hero) return hero;

  const fromGallery = source.dbGallery?.map((url) => url?.trim()).find(Boolean);
  if (fromGallery) return fromGallery;

  return generatedImagePath("projects", slug, 0);
}

export function resolveProjectListImage(slug: string, dbHero?: string | null): string {
  return resolveProjectHeroImage(slug, { dbHero });
}

/** First seven slugs for legacy homepage rails (may reference removed projects). */
export const featuredStorySlugs = projectCatalog.slice(0, 7).map((p) => p.slug);
export const projectSpotlightSlugs = projectCatalog.slice(7, 13).map((p) => p.slug);

export function getSectionStoriesResolved(): {
  homes: ProjectEntry[];
  projects: ProjectEntry[];
  culture: ProjectEntry[];
} {
  return {
    homes: projectCatalog.slice(0, 4),
    projects: projectCatalog.slice(4, 8),
    culture: projectCatalog.slice(8, 11),
  };
}

export const projectsByCategory: { category: string; slug: string }[] = [
  { category: "Architecture & Design", slug: projectCatalog[0]?.slug ?? "vela-house" },
  { category: "Interior Design & Architecture", slug: projectCatalog[10]?.slug ?? "maison-de-l-ombre" },
  { category: "Hospitality", slug: projectCatalog[4]?.slug ?? "hotel-nott" },
  { category: "Residential", slug: projectCatalog[1]?.slug ?? "kurokawa-courtyard-house" },
  { category: "Retreat", slug: projectCatalog[11]?.slug ?? "house-of-distant-dunes" },
].filter((row) => row.slug);
