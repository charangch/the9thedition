import { createInsForgeServerClient } from "@/lib/insforge-server";

/**
 * Creates a reader profile row after OAuth if missing.
 * Safe to call on every callback; ignores duplicate errors.
 */
export async function ensureReaderProfile(accessToken: string) {
  const client = createInsForgeServerClient(accessToken);
  const { data: session } = await client.auth.getCurrentUser();
  if (!session?.user?.id) {
    return;
  }

  const { data: rows } = await client.database
    .from("profiles")
    .select("id")
    .eq("user_id", session.user.id)
    .limit(1);

  if (rows && Array.isArray(rows) && rows.length > 0) {
    return;
  }

  // No row yet (or table empty) — attempt insert
  const { error: insErr } = await client.database.from("profiles").insert([
    {
      user_id: session.user.id,
      role: "reader",
    },
  ]);

  if (insErr) {
    // Likely race duplicate or schema not migrated yet
    console.warn("ensureReaderProfile insert:", insErr.message);
  }
}
