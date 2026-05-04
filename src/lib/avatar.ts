import type { UserSchema } from "@insforge/shared-schemas";
import type { ProfileRow } from "@/lib/profile";
import {
  getOAuthAvatarProviderLabel,
  getOAuthAvatarProviderFromUser,
  getOAuthAvatarUrlFromUser,
} from "@/lib/user-display";

const HTTP = /^https?:\/\//i;

function isHttpUrl(s: string): boolean {
  return HTTP.test(s.trim());
}

/**
 * Final avatar for UI: user-uploaded URL wins; otherwise OAuth provider photo (Google / LinkedIn / Apple, etc.).
 */
export function resolveProfileAvatarUrl(user: UserSchema, profile: ProfileRow | null): string | null {
  const custom = profile?.custom_avatar_url?.trim();
  if (custom && isHttpUrl(custom)) return custom;
  return getOAuthAvatarUrlFromUser(user);
}

export function resolveAvatarSource(
  user: UserSchema,
  profile: ProfileRow | null,
): { kind: "uploaded" | "oauth" | "none"; label: string } {
  const custom = profile?.custom_avatar_url?.trim();
  if (custom && isHttpUrl(custom)) return { kind: "uploaded", label: "Uploaded photo" };
  if (getOAuthAvatarUrlFromUser(user)) {
    return {
      kind: "oauth",
      label: `${getOAuthAvatarProviderLabel(getOAuthAvatarProviderFromUser(user))} profile photo`,
    };
  }
  return { kind: "none", label: "No profile photo" };
}
