import { Suspense } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { LoginForm } from "./login-form";

export const metadata = buildPageMetadata({
  title: "Admin sign-in",
  description: "Restricted sign-in for The 9th Edition publishing administrators.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-background-light via-surface to-background-light">
        <div className="container-premium py-10 md:py-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center lg:gap-16">
            <div className="relative hidden overflow-hidden rounded-2xl border border-primary/15 bg-charcoal/[0.03] p-10 lg:block">
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Admin Only</p>
              <h1 className="mt-4 font-serif text-3xl leading-tight text-charcoal sm:text-4xl md:text-5xl">
                Publishing operations for the9thedition.
              </h1>
              <p className="mt-6 text-base leading-relaxed text-charcoal/75">
                Restricted dashboard for editorial admins. Manage publishing intake, project rollout,
                student features, and newsletter operations.
              </p>
              <p className="mt-8 border-l-2 border-primary/40 pl-4 text-sm italic text-charcoal/70">
                &quot;Edit, validate, and publish from one console.&quot;
              </p>
              <Link
                href="/"
                className="mt-10 inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-primary hover:underline"
              >
                Return to website home →
              </Link>
            </div>

            <div className="lg:pl-2">
              <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
