import { createInsForgeServerClient } from "@/lib/insforge-server";

/** Recompute and persist `professionals.project_count` from live published rows. */
export async function syncProfessionalProjectCount(accessToken: string, professionalId: string): Promise<void> {
  if (!professionalId) return;
  const client = createInsForgeServerClient(accessToken);
  const { count, error: countErr } = await client.database
    .from("published_projects")
    .select("slug", { count: "exact", head: true })
    .eq("professional_id", professionalId);
  if (countErr) return;
  const total = typeof count === "number" ? count : 0;
  await client.database
    .from("professionals")
    .update({ project_count: total, updated_at: new Date().toISOString() })
    .eq("id", professionalId);
}
