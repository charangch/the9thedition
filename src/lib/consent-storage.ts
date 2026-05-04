/** Client-only keys for consent and first-visit auth UX. */

export const STORAGE_COOKIE_CONSENT = "t9e_cookie_consent_v1";
export const STORAGE_HAS_EVER_SIGNED_IN = "t9e_has_ever_signed_in";

export type CookieConsentValue = "essential" | "all";

/** Mark this browser as having signed in before (signup-first vs sign-in-first on /login). */
export function markHasSignedIn() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_HAS_EVER_SIGNED_IN, "1");
  } catch {
    /* quota / private mode */
  }
}
