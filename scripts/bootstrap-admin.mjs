import { createClient } from "@insforge/sdk";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

async function main() {
  const baseUrl = required("NEXT_PUBLIC_INSFORGE_URL");
  const serviceKey = required("INSFORGE_SERVICE_KEY");
  const adminUserId = required("ADMIN_BOOTSTRAP_USER_ID");
  const displayName = process.env.ADMIN_BOOTSTRAP_DISPLAY_NAME?.trim() || "Administrator";

  const client = createClient({
    baseUrl,
    anonKey: serviceKey,
    isServerMode: true,
  });

  const { error } = await client.database.from("profiles").upsert(
    [
      {
        user_id: adminUserId,
        role: "admin",
        display_name: displayName,
      },
    ],
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(`Failed to bootstrap admin: ${error.message}`);
  }

  console.log(`Admin role granted to user ${adminUserId}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
