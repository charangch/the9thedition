import { createInsForgeServerClient } from "@/lib/insforge-server";

export type ProfileRow = {
  id: string;
  user_id: string;
  role: "reader" | "admin";
  display_name: string | null;
  bio?: string | null;
  website?: string | null;
  instagram_handle?: string | null;
  /** User-uploaded photo; overrides OAuth avatar in UI when set. */
  custom_avatar_url?: string | null;
  custom_avatar_storage_key?: string | null;
};

function dbErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export async function getProfileForUser(
  userId: string,
  accessToken: string,
): Promise<ProfileRow | null> {
  const client = createInsForgeServerClient(accessToken);
  const { data: rows, error } = await client.database
    .from("profiles")
    .select(
      "id, user_id, role, display_name, bio, website, instagram_handle, custom_avatar_url, custom_avatar_storage_key",
    )
    .eq("user_id", userId)
    .limit(1);

  if (error) {
    const msg = dbErrorMessage(error);
    console.error("[profiles] lookup failed:", msg || error);
    if (/does not exist|schema cache|Could not find the table|42P01/i.test(msg)) {
      console.info(
        "[profiles] Apply migration: npx @insforge/cli db query \"$(cat insforge/sql/001_profiles_and_submissions.sql)\" (from the web/ folder, project linked)",
      );
    }
    return null;
  }
  const row = Array.isArray(rows) ? rows[0] : rows;
  return (row as ProfileRow) ?? null;
}
