import type { UserSchema } from "@insforge/shared-schemas";
export type OAuthAvatarProvider = "google" | "linkedin" | "apple" | "unknown";

const HTTP = /^https?:\/\//i;

function isHttpUrlString(s: string): boolean {
  return HTTP.test(s.trim());
}

function firstHttpUrl(value: unknown): string | null {
  if (typeof value === "string" && isHttpUrlString(value)) return value.trim();
  return null;
}

/**
 * Walk provider-specific OAuth payloads (nested JSON varies by Google / LinkedIn / Apple).
 * Stops at a reasonable depth to avoid scanning huge trees.
 */
function findOAuthPictureInObject(obj: unknown, depth: number): string | null {
  if (depth > 8 || obj == null) return null;
  const direct = firstHttpUrl(obj);
  if (direct) return direct;
  if (typeof obj !== "object") return null;
  const record = obj as Record<string, unknown>;

  const priorityKeys = [
    "picture",
    "avatar_url",
    "photo",
    "profilePicture",
    "displayImage",
    "imageUrl",
    "profile_picture",
    "pictureUrl",
    "thumbnail_url",
    "image_url",
    "url",
  ];

  for (const key of priorityKeys) {
    if (!(key in record)) continue;
    const v = record[key];
    const found = firstHttpUrl(v);
    if (found) return found;
    if (v && typeof v === "object") {
      const nested = findOAuthPictureInObject(v, depth + 1);
      if (nested) return nested;
    }
  }

  for (const v of Object.values(record)) {
    if (v && typeof v === "object") {
      const nested = findOAuthPictureInObject(v, depth + 1);
      if (nested) return nested;
    }
  }
  return null;
}

/**
 * Avatar URL from the identity / OAuth payload (Google, Apple, LinkedIn, etc.).
 * InsForge stores normalized data on `profile` and raw provider fields in `metadata`.
 */
export function getOAuthAvatarUrlFromUser(user: UserSchema): string | null {
  const profile = user.profile;
  if (profile && typeof profile === "object") {
    const p = profile as Record<string, unknown>;
    const url = firstHttpUrl(p.avatar_url);
    if (url) return url;
    for (const [k, v] of Object.entries(p)) {
      if (typeof v === "string" && isHttpUrlString(v) && /(photo|avatar|picture|image)/i.test(k)) {
        return v.trim();
      }
    }
  }

  const meta = user.metadata;
  if (meta && typeof meta === "object") {
    const m = meta as Record<string, unknown>;
    const top = firstHttpUrl(m.picture) ?? firstHttpUrl(m.avatar_url);
    if (top) return top;
    const nested = findOAuthPictureInObject(m, 0);
    if (nested) return nested;
  }

  return null;
}

export function getOAuthAvatarProviderFromUser(user: UserSchema): OAuthAvatarProvider {
  const providers = Array.isArray(user.providers) ? user.providers.map((p) => p.toLowerCase()) : [];
  if (providers.includes("google")) return "google";
  if (providers.includes("linkedin")) return "linkedin";
  if (providers.includes("apple")) return "apple";

  const meta = user.metadata;
  if (meta && typeof meta === "object") {
    const m = meta as Record<string, unknown>;
    if ("google" in m || "google_data" in m) return "google";
    if ("linkedin" in m || "linkedin_data" in m) return "linkedin";
    if ("apple" in m || "apple_data" in m) return "apple";
  }
  return "unknown";
}

export function getOAuthAvatarProviderLabel(provider: OAuthAvatarProvider): string {
  if (provider === "google") return "Google";
  if (provider === "linkedin") return "LinkedIn";
  if (provider === "apple") return "Apple";
  return "OAuth provider";
}

/** @deprecated Use getOAuthAvatarUrlFromUser or resolveProfileAvatarUrl for display. */
export function getAvatarUrlFromUser(user: UserSchema): string | null {
  return getOAuthAvatarUrlFromUser(user);
}

export function getDisplayNameFromUser(user: UserSchema): string {
  const profile = user.profile;
  if (profile && typeof profile === "object") {
    const name = (profile as { name?: string }).name;
    if (name && name.trim()) return name.trim();
  }
  const email = user.email?.split("@")[0] ?? "Member";
  return email;
}
