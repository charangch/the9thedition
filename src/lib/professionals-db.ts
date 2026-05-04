import { slugifyProject } from "@/lib/submission-template";
import { createInsForgeServerClient, createInsForgeServerClientPublic } from "@/lib/insforge-server";

export type ProfessionalRow = {
  id: string;
  slug: string;
  name: string;
  firm: string;
  bio: string | null;
  image_url: string | null;
};

export type CompanyRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
};

export async function getProfessionals(limit = 400): Promise<ProfessionalRow[]> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("professionals")
    .select("id, slug, name, firm, bio, image_url")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (Array.isArray(data) ? data : []) as ProfessionalRow[];
}

export async function getProfessionalBySlug(slug: string): Promise<ProfessionalRow | null> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("professionals")
    .select("id, slug, name, firm, bio, image_url")
    .eq("slug", slug)
    .limit(1);
  if (error) return null;
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
  const client = createInsForgeServerClient(accessToken);
  const { error } = await client.database.from("professionals").upsert(
    [
      {
        slug,
        name: normalized,
        firm: normalized,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "slug" },
  );
  if (error) return null;
  const { data } = await client.database
    .from("professionals")
    .select("id, slug, name, firm, bio, image_url")
    .eq("slug", slug)
    .limit(1);
  const row = Array.isArray(data) ? data[0] : data;
  return (row as ProfessionalRow | undefined) ?? null;
}

export async function getCompanies(limit = 400): Promise<CompanyRow[]> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("companies")
    .select("id, slug, name, description, logo_url")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (Array.isArray(data) ? data : []) as CompanyRow[];
}

export async function upsertCompanyByName(
  accessToken: string,
  value: string,
): Promise<CompanyRow | null> {
  const normalized = value.trim();
  if (!normalized) return null;
  const slug = slugifyProject(normalized);
  const client = createInsForgeServerClient(accessToken);
  const { error } = await client.database.from("companies").upsert(
    [
      {
        slug,
        name: normalized,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "slug" },
  );
  if (error) return null;
  const { data } = await client.database
    .from("companies")
    .select("id, slug, name, description, logo_url")
    .eq("slug", slug)
    .limit(1);
  const row = Array.isArray(data) ? data[0] : data;
  return (row as CompanyRow | undefined) ?? null;
}
