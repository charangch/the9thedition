import {
  createInsForgeServerClient,
  createInsForgeServiceClient,
  InsForgeConfigurationError,
} from "@/lib/insforge-server";
import type { ProfessionalRow } from "@/lib/professionals-db";

const professionalSelectBase = "id, slug, name, firm, bio, image_url";

export type EnsureProfessionalResult =
  | { ok: true; professional: ProfessionalRow }
  | { ok: false; message: string };

type WriteClient = ReturnType<typeof createInsForgeServerClient>;

/** Prefer service role for admin writes (bypasses RLS); fall back to the admin session token. */
export function createProfessionalWriteClient(accessToken: string): WriteClient {
  const serviceKey = process.env.INSFORGE_SERVICE_KEY?.trim();
  if (serviceKey) {
    try {
      return createInsForgeServiceClient();
    } catch (err) {
      if (!(err instanceof InsForgeConfigurationError)) throw err;
    }
  }
  return createInsForgeServerClient(accessToken);
}

async function loadBySlug(client: WriteClient, slug: string): Promise<ProfessionalRow | null> {
  const { data, error } = await client.database
    .from("professionals")
    .select(professionalSelectBase)
    .eq("slug", slug)
    .limit(1);
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as ProfessionalRow | undefined) ?? null;
}

function stripSocialColumns(row: Record<string, unknown>) {
  const copy = { ...row };
  delete copy.website;
  delete copy.instagram_url;
  delete copy.facebook_url;
  delete copy.youtube_url;
  return copy;
}

async function writeRow(
  client: WriteClient,
  slug: string,
  row: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const existing = await loadBySlug(client, slug);
  const now = new Date().toISOString();
  const payload = { ...row, slug, updated_at: now };

  if (existing) {
    const { error } = await client.database.from("professionals").update(payload).eq("slug", slug);
    if (!error) return { ok: true };
    const retry = await client.database.from("professionals").update(stripSocialColumns(payload)).eq("slug", slug);
    if (retry.error) return { ok: false, message: retry.error.message ?? "Could not update architect profile." };
    return { ok: true };
  }

  const { error } = await client.database.from("professionals").insert([payload]);
  if (!error) return { ok: true };
  const retry = await client.database.from("professionals").insert([stripSocialColumns(payload)]);
  if (retry.error) {
    const msg = retry.error.message ?? "Could not create architect profile.";
    if (/duplicate|unique|23505/i.test(msg)) {
      const { error: updateErr } = await client.database
        .from("professionals")
        .update(stripSocialColumns(payload))
        .eq("slug", slug);
      if (!updateErr) return { ok: true };
      return { ok: false, message: updateErr.message ?? msg };
    }
    return { ok: false, message: msg };
  }
  return { ok: true };
}

export async function ensureProfessionalRow(
  accessToken: string,
  slug: string,
  row: Record<string, unknown>,
): Promise<EnsureProfessionalResult> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return {
      ok: false,
      message:
        "Could not generate a studio slug from the firm name. Use at least one letter or number in the firm name.",
    };
  }

  const client = createProfessionalWriteClient(accessToken);
  const written = await writeRow(client, normalizedSlug, row);
  if (!written.ok) return written;

  const loaded = await loadBySlug(client, normalizedSlug);
  if (!loaded) {
    return {
      ok: false,
      message:
        "Architect profile was saved but could not be read back. Add INSFORGE_SERVICE_KEY to web/.env.local or confirm your admin profile exists in the database.",
    };
  }
  return { ok: true, professional: loaded };
}
