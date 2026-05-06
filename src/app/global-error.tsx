"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background-light px-6 py-16 text-charcoal">
        <h1 className="font-serif text-2xl">Something went wrong</h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          An unexpected error occurred. You can try again or contact support if it continues.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-md border border-primary/30 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
