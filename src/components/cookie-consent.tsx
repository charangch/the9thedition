"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  STORAGE_COOKIE_CONSENT,
  type CookieConsentValue,
} from "@/lib/consent-storage";

/**
 * GDPR-style consent for cookies. Essential cookies (session) still required for sign-in;
 * "All" reserves future analytics/personalisation (no third-party scripts wired yet).
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const v = localStorage.getItem(STORAGE_COOKIE_CONSENT);
        setVisible(!v);
      } catch {
        setVisible(true);
      }
    });
  }, []);

  function save(choice: CookieConsentValue) {
    try {
      localStorage.setItem(STORAGE_COOKIE_CONSENT, choice);
      document.documentElement.dataset.cookieConsent = choice;
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-charcoal/10 bg-surface/95 p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] backdrop-blur-md md:p-5"
    >
      <div className="container-premium flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 id="cookie-consent-title" className="font-serif text-lg text-charcoal">
            Cookies & privacy
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-charcoal/80">
            We use essential cookies to keep you signed in and secure. With your consent we may
            enable optional analytics and preferences later to improve the experience. Read our{" "}
            <Link href="/cookies" className="font-medium text-primary underline-offset-2 hover:underline">
              Cookie policy
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
              Privacy policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
          <button
            type="button"
            onClick={() => save("essential")}
            className="rounded-full border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/90 hover:border-primary"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => save("all")}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-primary/90"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
