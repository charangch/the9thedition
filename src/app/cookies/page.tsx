import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function CookiesPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-premium py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Legal</p>
        <h1 className="mt-3 font-serif text-4xl text-charcoal">Cookies Policy</h1>
        <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted">Last updated: April 30, 2026</p>

        <div className="mt-8 max-w-4xl space-y-7 text-sm leading-relaxed text-charcoal/85">
          <section>
            <h2 className="font-serif text-2xl text-charcoal">1. What Are Cookies</h2>
            <p className="mt-2">
              Cookies are small text files placed on your device to support core platform functionality, security, and
              performance. Similar technologies may include local storage and pixel-based analytics.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">2. Cookie Categories We Use</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Strictly necessary:</strong> session, authentication, security, and core navigation.
              </li>
              <li>
                <strong>Functional:</strong> preferences and interface continuity.
              </li>
              <li>
                <strong>Analytics/performance:</strong> aggregate usage insights to improve editorial UX.
              </li>
            </ul>
            <p className="mt-2">
              We do not enable non-essential tracking categories where consent is required unless you have opted in.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">3. Why We Use Cookies</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Maintain secure sign-in sessions and prevent abuse.</li>
              <li>Remember core preferences and improve performance.</li>
              <li>Measure aggregate page behavior to improve content architecture and navigation quality.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">4. Managing Cookies</h2>
            <p className="mt-2">
              You can control cookies through browser settings. Blocking strictly necessary cookies may break sign-in or
              other core features. Where required by law, our consent controls allow you to manage non-essential
              categories.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">5. Third-Party Cookies</h2>
            <p className="mt-2">
              Some service providers may set cookies on our behalf to support hosting, security, analytics, and media
              delivery. Their processing is governed by contractual and legal controls.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-charcoal/75">
              For example, our hosting provider (Vercel) and reliability tooling (such as Sentry, when enabled) may use
              strictly necessary or diagnostic technologies to deliver pages and capture anonymized error signals. You
              can review subprocessors in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">6. Updates</h2>
            <p className="mt-2">
              We may update this policy as our technology stack or legal obligations evolve. Material updates will be
              reflected by revising the date at the top of this page.
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm">
          <Link href="/" className="text-primary hover:underline">
            ← Home
          </Link>
        </p>
      </main>
    </>
  );
}
