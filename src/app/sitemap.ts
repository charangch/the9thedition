import type { MetadataRoute } from "next";
import { architects } from "@/lib/architects";
import { getArchitectureNewsSlugs } from "@/lib/architecture-news";
import { getArchiveProjectSlugs } from "@/lib/archive-projects";
import { getEditorialArticleSlugs } from "@/lib/editorial-articles";
import { getAllProjectSlugs } from "@/lib/project-catalog";
import { getPublishedProjects } from "@/lib/published-projects";
import { getSiteUrl } from "@/lib/site-url";

type SitemapEntry = MetadataRoute.Sitemap[number];

function mergeEntries(entries: SitemapEntry[]): SitemapEntry[] {
  const byUrl = new Map<string, SitemapEntry>();
  for (const e of entries) {
    const prev = byUrl.get(e.url);
    if (!prev) {
      byUrl.set(e.url, e);
      continue;
    }
    const pTime = prev.lastModified instanceof Date ? prev.lastModified.getTime() : 0;
    const nTime = e.lastModified instanceof Date ? e.lastModified.getTime() : 0;
    if (nTime > pTime) byUrl.set(e.url, e);
  }
  return [...byUrl.values()];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const newsSlugs = getArchitectureNewsSlugs();
  const archiveSlugs = getArchiveProjectSlugs();
  const editorialSlugs = getEditorialArticleSlugs();
  const catalogProjectSlugs = getAllProjectSlugs();

  let publishedRows: Awaited<ReturnType<typeof getPublishedProjects>> = [];
  try {
    publishedRows = await getPublishedProjects(5000);
  } catch {
    publishedRows = [];
  }

  const newsEntries: MetadataRoute.Sitemap = newsSlugs.slice(0, 60).map((slug) => ({
    url: `${base}/architecture-news/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.72,
  }));

  const archiveEntries: MetadataRoute.Sitemap = archiveSlugs.slice(0, 60).map((slug) => ({
    url: `${base}/archive/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.68,
  }));

  const articleEntries: MetadataRoute.Sitemap = editorialSlugs.slice(0, 60).map((slug) => ({
    url: `${base}/articles/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const catalogProjectEntries: MetadataRoute.Sitemap = catalogProjectSlugs.map((slug) => ({
    url: `${base}/projects/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.78,
  }));

  const dbProjectEntries: MetadataRoute.Sitemap = publishedRows.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: p.published_at ? new Date(p.published_at) : p.created_at ? new Date(p.created_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.78,
  }));

  const professionalEntries: MetadataRoute.Sitemap = architects.map((a) => ({
    url: `${base}/professionals/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/architecture-news`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${base}/archive`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/professionals`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/newsletter`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/awards`, lastModified: now, changeFrequency: "monthly", priority: 0.62 },
    { url: `${base}/submission-guidelines`, lastModified: now, changeFrequency: "monthly", priority: 0.64 },
    { url: `${base}/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.58 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.35 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.35 },
    { url: `${base}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/report-bug`, lastModified: now, changeFrequency: "yearly", priority: 0.25 },
  ];

  return mergeEntries([
    ...staticPages,
    ...newsEntries,
    ...archiveEntries,
    ...articleEntries,
    ...catalogProjectEntries,
    ...dbProjectEntries,
    ...professionalEntries,
  ]);
}
