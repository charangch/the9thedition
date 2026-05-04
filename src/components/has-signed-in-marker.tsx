"use client";

import { useEffect } from "react";
import { markHasSignedIn } from "@/lib/consent-storage";

/** After OAuth or any session, persist "returning user" so /login defaults to Sign in. */
export function HasSignedInMarker() {
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((r) => r.json() as Promise<{ user: unknown }>)
      .then((data) => {
        if (!cancelled && data.user) markHasSignedIn();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
