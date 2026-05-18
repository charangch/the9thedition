import { createInsForgeServerClientPublic } from "@/lib/insforge-server";

export type PublishedProject = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  location: string | null;
  byline: string | null;
  hero_image_url: string | null;
  image_urls: string[];
  video_links: string[];
  external_links: string[];
  form_data: Record<string, unknown> | null;
  layout_blocks?: unknown;
  professional_slug?: string | null;
  linked_product_slugs?: string[];
  professional_id?: string | null;
  is_trending?: boolean;
  media?: Record<string, unknown> | null;
  created_at?: string | null;
  is_featured_home?: boolean;
  published_at?: string | null;
  deleted_at?: string | null;
  editorial_status?: string | null;
  archived_at?: string | null;
};

function isActivePublished(row: PublishedProject): boolean {
  return row.editorial_status !== "archived";
}

/** Detail pages + admin — includes heavy `content` / `layout_blocks`. */
const publishedProjectSelectFull =
  "slug, title, excerpt, content, category, location, byline, hero_image_url, image_urls, video_links, external_links, form_data, layout_blocks, professional_slug, professional_id, linked_product_slugs, is_trending, media, is_featured_home, created_at, published_at";

/** Grids, related, filters — drops large JSON columns. */
const publishedProjectSelectSlim =
  "slug, title, excerpt, category, location, byline, hero_image_url, image_urls, video_links, external_links, form_data, professional_slug, professional_id, linked_product_slugs, is_trending, media, is_featured_home, created_at, published_at";

/** Homepage rails — smallest payload. */
const publishedProjectSelectHome =
  "slug, title, excerpt, category, location, byline, hero_image_url, image_urls, is_featured_home, is_trending, published_at, created_at";

function normalizeRow(row: PublishedProject): PublishedProject {
  return {
    ...row,
    content: row.content ?? null,
    layout_blocks: row.layout_blocks ?? null,
    form_data: row.form_data ?? null,
    image_urls: Array.isArray(row.image_urls) ? row.image_urls : [],
    video_links: Array.isArray(row.video_links) ? row.video_links : [],
    external_links: Array.isArray(row.external_links) ? row.external_links : [],
    linked_product_slugs: Array.isArray(row.linked_product_slugs) ? row.linked_product_slugs : [],
  };
}

export async function getPublishedProjectBySlug(slug: string): Promise<PublishedProject | null> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("published_projects")
    .select(publishedProjectSelectFull)
    .eq("slug", slug)
    .limit(1);

  if (error) return null;
  const row = (Array.isArray(data) ? data[0] : data) as PublishedProject | undefined;
  if (!row || !isActivePublished(row)) return null;
  return normalizeRow(row);
}

/** Archived admin-published projects — shown first on /archive. */
export async function getArchivedPublishedBySlug(slug: string): Promise<PublishedProject | null> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("published_projects")
    .select(publishedProjectSelectFull)
    .eq("slug", slug)
    .eq("editorial_status", "archived")
    .limit(1);
  if (error) return null;
  const row = (Array.isArray(data) ? data[0] : data) as PublishedProject | undefined;
  if (!row) return null;
  return normalizeRow(row);
}

export async function getArchivedPublishedForArchive(limit = 48): Promise<PublishedProject[]> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("published_projects")
    .select(publishedProjectSelectSlim)
    .eq("editorial_status", "archived")
    .order("archived_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) return [];
  const rows = Array.isArray(data) ? data : [];
  return rows.map((row) => normalizeRow(row as PublishedProject));
}

export async function getFeaturedPublishedProjects(limit = 6): Promise<PublishedProject[]> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("published_projects")
    .select(publishedProjectSelectHome)
    .eq("is_featured_home", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  const rows = Array.isArray(data) ? data : [];
  return rows.map((row) => normalizeRow(row as PublishedProject)).filter(isActivePublished);
}

/** FIFO homepage rail — newest published first. */
export async function getLatestPublishedProjects(limit = 6): Promise<PublishedProject[]> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("published_projects")
    .select(publishedProjectSelectHome)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit * 2);
  if (error) return [];
  const rows = Array.isArray(data) ? data : [];
  return rows
    .map((row) => normalizeRow(row as PublishedProject))
    .filter(isActivePublished)
    .slice(0, limit);
}

export async function getPublishedProjects(limit = 200): Promise<PublishedProject[]> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("published_projects")
    .select(publishedProjectSelectSlim)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  const rows = Array.isArray(data) ? data : [];
  return rows.map((row) => normalizeRow(row as PublishedProject)).filter(isActivePublished);
}

export async function getTrendingPublishedProjects(limit = 3): Promise<PublishedProject[]> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("published_projects")
    .select(publishedProjectSelectHome)
    .eq("is_trending", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  const rows = Array.isArray(data) ? data : [];
  return rows.map((row) => normalizeRow(row as PublishedProject)).filter(isActivePublished);
}

export async function getPublishedProjectsByArchitectureFirm(
  firmName: string,
  limit = 20,
): Promise<PublishedProject[]> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("published_projects")
    .select(publishedProjectSelectSlim)
    .order("published_at", { ascending: false })
    .limit(120);
  if (error) return [];
  const normalizedFirm = firmName.trim().toLowerCase();
  const rows = Array.isArray(data) ? data : [];
  return rows
    .filter((row) => {
      const form = (row as { form_data?: Record<string, unknown> }).form_data ?? {};
      return String(form.architectureFirm ?? "").trim().toLowerCase() === normalizedFirm;
    })
    .slice(0, limit)
    .map((row) => normalizeRow(row as PublishedProject));
}

export async function getProjectsUsingProductSlug(productSlug: string, limit = 12): Promise<PublishedProject[]> {
  const client = createInsForgeServerClientPublic();
  const { data: links, error: linksError } = await client.database
    .from("project_product_links")
    .select("project_slug")
    .eq("product_slug", productSlug)
    .limit(limit);
  if (linksError) return [];
  const projectSlugs = (Array.isArray(links) ? links : [])
    .map((row) => String((row as { project_slug?: string }).project_slug ?? ""))
    .filter(Boolean);
  if (!projectSlugs.length) return [];
  const { data, error } = await client.database
    .from("published_projects")
    .select(publishedProjectSelectSlim)
    .in("slug", projectSlugs)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  const rows = Array.isArray(data) ? data : [];
  return rows.map((row) => normalizeRow(row as PublishedProject));
}

export async function getPublishedProjectsByProfessionalId(
  professionalId: string,
  limit = 40,
): Promise<PublishedProject[]> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("published_projects")
    .select(publishedProjectSelectSlim)
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  const rows = Array.isArray(data) ? data : [];
  return rows
    .map((row) => normalizeRow(row as PublishedProject))
    .filter(isActivePublished);
}

/** Count-only — avoids loading rows when only totals are needed (e.g. directory cards). */
export async function countPublishedProjectsByProfessionalId(professionalId: string): Promise<number> {
  if (!professionalId) return 0;
  const client = createInsForgeServerClientPublic();
  const { count, error } = await client.database
    .from("published_projects")
    .select("slug", { count: "exact", head: true })
    .eq("professional_id", professionalId);
  if (error) return 0;
  return typeof count === "number" ? count : 0;
}
