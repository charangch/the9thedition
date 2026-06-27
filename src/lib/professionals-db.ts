import { slugifyProject } from "@/lib/submission-template";
import {
  createInsForgeServerClient,
  createInsForgeServerClientPublicOrNull,
} from "@/lib/insforge-server";

export type ProfessionalRow = {
  id: string;
  slug: string;
  name: string;
  firm: string;
  bio: string | null;
  image_url: string | null;
  website?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  youtube_url?: string | null;
  project_count?: number;
};

const professionalSelectBase = "id, slug, name, firm, bio, image_url";
const professionalSelectExtended =
  "id, slug, name, firm, bio, image_url, website, instagram_url, facebook_url, youtube_url, project_count";

async function queryProfessionals(
  client: NonNullable<ReturnType<typeof createInsForgeServerClientPublicOrNull>>,
  select: string,
  limit: number,
) {
  return client.database.from("professionals").select(select).order("firm", { ascending: true }).limit(limit);
}

export async function getProfessionals(limit = 400): Promise<ProfessionalRow[]> {
  const client = createInsForgeServerClientPublicOrNull();
  if (!client) return [];
  const primary = await queryProfessionals(client, professionalSelectExtended, limit);
  const result = primary.error
    ? await queryProfessionals(client, professionalSelectBase, limit)
    : primary;
  if (result.error) return [];
  const rows = Array.isArray(result.data) ? result.data : [];
  return rows as unknown as ProfessionalRow[];
}

export async function getProfessionalBySlug(slug: string): Promise<ProfessionalRow | null> {
  const client = createInsForgeServerClientPublicOrNull();
  if (!client) return null;
  const primary = await client.database
    .from("professionals")
    .select(professionalSelectExtended)
    .eq("slug", slug)
    .limit(1);
  const resolved = primary.error
    ? await client.database.from("professionals").select(professionalSelectBase).eq("slug", slug).limit(1)
    : primary;
  if (resolved.error) return null;
  const data = resolved.data;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as ProfessionalRow | undefined) ?? null;
}

export async function upsertProfessionalByName(
  accessToken: string,
  value: string,
): Promise<ProfessionalRow | null> {
  const normalized = value.trim();
  if (!normalized) return null;
  const slug = slugifyProject(normalized);
  const { ensureProfessionalRow } = await import("@/lib/admin/ensure-professional");
  const result = await ensureProfessionalRow(accessToken, slug, {
    name: normalized,
    firm: normalized,
  });
  return result.ok ? result.professional : null;
}

export type CompanyRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
};

export async function getCompanies(limit = 400): Promise<CompanyRow[]> {
  const client = createInsForgeServerClientPublicOrNull();
  if (!client) return [];
  const { data, error } = await client.database
    .from("companies")
    .select("id, slug, name, description, logo_url")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (Array.isArray(data) ? data : []) as CompanyRow[];
}
