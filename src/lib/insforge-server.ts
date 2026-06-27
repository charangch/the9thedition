import { NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

/** Shown in API JSON and thrown when the SDK client cannot be built. */
export const INSFORGE_NOT_CONFIGURED = {
  error:
    "Missing NEXT_PUBLIC_INSFORGE_URL or NEXT_PUBLIC_INSFORGE_ANON_KEY. Create web/.env.local (see web/.env.example), paste your InsForge API URL and anon key, then restart the dev server.",
  code: "insforge_not_configured" as const,
};

export class InsForgeConfigurationError extends Error {
  readonly code = INSFORGE_NOT_CONFIGURED.code;
  constructor(message: string = INSFORGE_NOT_CONFIGURED.error) {
    super(message);
    this.name = "InsForgeConfigurationError";
  }
}

export function insforgeNotConfiguredResponse() {
  return NextResponse.json(INSFORGE_NOT_CONFIGURED, { status: 503 });
}

/**
 * Public InsForge connection (URL + anon key). Used by the Next.js app and OAuth.
 * Values must be non-empty after trim.
 */
export function getInsForgePublicEnv(): { baseUrl: string; anonKey: string } | null {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY?.trim() ?? "";
  if (!baseUrl || !anonKey) {
    return null;
  }
  return { baseUrl, anonKey };
}

/**
 * InsForge client for Route Handlers / Server Actions.
 * Pass accessToken for user-scoped DB/auth calls (edgeFunctionToken).
 */
export function createInsForgeServerClient(accessToken?: string) {
  const env = getInsForgePublicEnv();
  if (!env) {
    throw new InsForgeConfigurationError();
  }
  return createClient({
    baseUrl: env.baseUrl,
    anonKey: env.anonKey,
    isServerMode: true,
    edgeFunctionToken: accessToken,
  });
}

/** OAuth start / public config — no user session */
export function createInsForgeServerClientPublic() {
  return createInsForgeServerClient(undefined);
}

/** Read-only server paths (SSG, sitemap) — skip DB when env is unset so `next build` can finish. */
export function createInsForgeServerClientPublicOrNull() {
  const env = getInsForgePublicEnv();
  if (!env) return null;
  return createClient({
    baseUrl: env.baseUrl,
    anonKey: env.anonKey,
    isServerMode: true,
  });
}

/** Optional: service-level operations (keep key server-only; use sparingly) */
export function createInsForgeServiceClient() {
  const baseUrl = getInsForgePublicEnv()?.baseUrl ?? requireEnv("NEXT_PUBLIC_INSFORGE_URL");
  const serviceKey = process.env.INSFORGE_SERVICE_KEY?.trim();
  if (!serviceKey) {
    throw new Error("INSFORGE_SERVICE_KEY is not set");
  }
  return createClient({
    baseUrl,
    anonKey: serviceKey,
    isServerMode: true,
  });
}
