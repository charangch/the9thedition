import data from "@/data/ninth-edition-projects.json";
import { resolveArchitectSlugFromFirm } from "@/lib/architects";
import type { ProjectEntry } from "@/lib/project-catalog-types";
import { catalogProjectHeroPath } from "@/lib/catalog-project-images";

export type NinthEditionProjectRecord = {
  id: number;
  slug: string;
  title: string;
  dek: string;
  excerpt: string;
  category: string;
  location: string;
  projectType: string;
  architects: string;
  lead: string;
  byline: string;
  paragraphs: string[];
  specs: { label: string; value: string }[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
    geo_region: string;
  };
  imageAlts: string[];
};

const records = data.projects as NinthEditionProjectRecord[];

const bySlug = new Map(records.map((p) => [p.slug, p]));

export function getNinthEditionProjectBySlug(slug: string): NinthEditionProjectRecord | undefined {
  return bySlug.get(slug);
}

export function getAllNinthEditionProjects(): NinthEditionProjectRecord[] {
  return records;
}

export function getNinthEditionProjectSlugs(): string[] {
  return records.map((p) => p.slug);
}

export function toProjectEntry(record: NinthEditionProjectRecord): ProjectEntry {
  return {
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt,
    image: catalogProjectHeroPath(record.slug),
    category: record.category,
    location: record.location,
    byline: record.byline,
    architectSlug: resolveArchitectSlugFromFirm(record.architects),
    projectType: record.projectType,
  };
}

export function getAllProjectEntries(): ProjectEntry[] {
  return records.map(toProjectEntry);
}

export function getRelatedProjectEntries(current: ProjectEntry, max = 24): ProjectEntry[] {
  const all = getAllProjectEntries().filter((p) => p.slug !== current.slug);
  const ordered: ProjectEntry[] = [];
  const push = (candidates: ProjectEntry[]) => {
    for (const p of candidates) {
      if (ordered.length >= max) return;
      if (ordered.some((x) => x.slug === p.slug)) continue;
      ordered.push(p);
    }
  };
  push(all.filter((p) => p.category === current.category && p.projectType === current.projectType));
  push(all.filter((p) => p.category === current.category));
  push(all);
  return ordered;
}
