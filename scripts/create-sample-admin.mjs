/**
 * Creates (or updates) a sample admin user in InsForge for local development.
 *
 * Requires in web/.env.local:
 *   NEXT_PUBLIC_INSFORGE_URL
 *   NEXT_PUBLIC_INSFORGE_ANON_KEY
 *   INSFORGE_SERVICE_KEY
 *
 * Run from the web/ folder:
 *   npm run create-sample-admin
 *
 * Optional env overrides:
 *   SAMPLE_ADMIN_EMAIL   (default: sample.admin@theninthedition.com)
 *   SAMPLE_ADMIN_PASSWORD (default: SampleAdmin9th!)
 *
 * If sign-up fails because the user already exists, the script still tries to
 * grant admin on profiles when INSFORGE_SERVICE_KEY can read auth.users.
 */
import { createClient } from "@insforge/sdk";

const DEFAULT_EMAIL = "sample.admin@theninthedition.com";
const DEFAULT_PASSWORD = "SampleAdmin9th!";
const DEFAULT_NAME = "Sample Admin";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

async function resolveUserId(svc, email) {
  try {
    const { data: users, error } = await svc.database.from("auth.users").select("id").eq("email", email).limit(1);
    if (error) {
      console.warn("Could not read auth.users:", error.message);
      return null;
    }
    const row = Array.isArray(users) ? users[0] : null;
    return row?.id ? String(row.id) : null;
  } catch (e) {
    console.warn("auth.users lookup failed:", e?.message ?? e);
    return null;
  }
}

async function main() {
  const baseUrl = required("NEXT_PUBLIC_INSFORGE_URL");
  const anonKey = required("NEXT_PUBLIC_INSFORGE_ANON_KEY");
  const serviceKey = process.env.INSFORGE_SERVICE_KEY?.trim();
  if (!serviceKey) {
    throw new Error(
      "INSFORGE_SERVICE_KEY is required to upsert profiles and (if needed) read auth.users.\n" +
        "Add it to web/.env.local from the InsForge dashboard (server / service key), then re-run.",
    );
  }

  const email = process.env.SAMPLE_ADMIN_EMAIL?.trim() || DEFAULT_EMAIL;
  const password = process.env.SAMPLE_ADMIN_PASSWORD?.trim() || DEFAULT_PASSWORD;
  const displayName = process.env.SAMPLE_ADMIN_DISPLAY_NAME?.trim() || DEFAULT_NAME;

  if (!email.endsWith("@theninthedition.com")) {
    throw new Error("Email must end with @theninthedition.com (app admin policy).");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const origin = process.env.SAMPLE_ADMIN_ORIGIN?.trim() || "http://localhost:3000";
  const redirectTo = `${origin.replace(/\/$/, "")}/login?verify=link`;

  const publicClient = createClient({
    baseUrl,
    anonKey,
    isServerMode: true,
  });

  const svc = createClient({
    baseUrl,
    anonKey: serviceKey,
    isServerMode: true,
  });

  const { data: signData, error: signErr } = await publicClient.auth.signUp({
    email,
    password,
    name: displayName,
    redirectTo,
  });

  let userId = signData?.user?.id ?? null;

  if (signErr) {
    const msg = signErr.message ?? String(signErr);
    const exists =
      /already|exist|registered|duplicate/i.test(msg) || signErr.statusCode === 422 || signErr.statusCode === 400;
    if (!exists) {
      throw new Error(`signUp failed: ${msg}`);
    }
    console.log("User may already exist; resolving id and updating profile…");
    userId = await resolveUserId(svc, email);
    if (!userId) {
      throw new Error(
        `Could not create user and could not resolve existing id. Last error: ${msg}\n` +
          "Check InsForge Auth settings and that the service key can query auth.users.",
      );
    }
  }

  if (!userId) {
    userId = await resolveUserId(svc, email);
  }
  if (!userId) {
    throw new Error(
      "No user id after signUp. If email verification is required, copy the user id from the InsForge dashboard and run: npm run bootstrap:admin (ADMIN_BOOTSTRAP_USER_ID=…).",
    );
  }

  const { error: profileErr } = await svc.database.from("profiles").upsert(
    [
      {
        user_id: userId,
        role: "admin",
        display_name: displayName,
      },
    ],
    { onConflict: "user_id" },
  );

  if (profileErr) {
    throw new Error(`profiles upsert failed: ${profileErr.message}`);
  }

  console.log("");
  console.log("── Sample admin ready (local dev only) ──");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  User id:  ${userId}`);
  console.log("");
  console.log("Sign in at /login with password or magic link.");
  console.log("If InsForge requires email verification, confirm the address first (inbox or dashboard).");
  console.log("Change this password in production.");
  console.log("");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
