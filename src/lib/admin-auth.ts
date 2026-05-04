import { getProfileForUser } from "@/lib/profile";

export const ADMIN_EMAIL_DOMAIN = "theninthedition.com";

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function isAllowedAdminEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return normalized.endsWith(`@${ADMIN_EMAIL_DOMAIN}`);
}

export async function isAdminSession(accessToken: string, userId: string): Promise<boolean> {
  const profile = await getProfileForUser(userId, accessToken);
  return profile?.role === "admin";
}
