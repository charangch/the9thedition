import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SUPPORT_EMAIL } from "@/lib/site-contact";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Use",
  description: "Terms governing use of The 9th Edition website and editorial services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-premium py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Legal</p>
        <h1 className="mt-3 font-serif text-4xl text-charcoal">Terms of Use</h1>
        <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted">Last updated: April 30, 2026</p>

        <div className="mt-8 max-w-4xl space-y-7 text-sm leading-relaxed text-charcoal/85">
          <section>
            <h2 className="font-serif text-2xl text-charcoal">1. Acceptance</h2>
            <p className="mt-2">
              By using The 9th Edition website and services, you agree to these Terms of Use and our Privacy and
              Cookies policies. If you do not agree, please discontinue use.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">2. Editorial Platform Use</h2>
            <p className="mt-2">
              The site provides architecture and design editorial content, project archives, professional profiles,
              newsletters, and enquiry/submission workflows. We may update, suspend, or remove features at any time.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">3. Accounts and Access</h2>
            <p className="mt-2">
              Certain areas are restricted to authorized users (including admins). You are responsible for keeping your
              credentials secure and for activity under your account. Unauthorized access attempts are prohibited.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">4. Submissions and Enquiries</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>You represent that submitted materials are accurate and lawfully provided.</li>
              <li>You must have rights and permissions for all submitted media and text.</li>
              <li>Submission does not guarantee publication, award consideration, or response timelines.</li>
              <li>We may edit, format, summarize, or decline content for editorial, legal, or quality reasons.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">5. Intellectual Property</h2>
            <p className="mt-2">
              Unless otherwise stated, site design, editorial copy, platform features, and branding are owned by The
              9th Edition or its licensors. Third-party project assets remain owned by their respective creators.
              Reuse beyond fair quotation and linking requires written permission.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">6. Prohibited Conduct</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Attempting to bypass authentication, authorization, or security controls.</li>
              <li>Scraping, bulk extraction, or automated abuse without permission.</li>
              <li>Uploading unlawful, infringing, malicious, or deceptive content.</li>
              <li>Impersonation, harassment, or interference with platform operations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">7. Third-Party Links and Services</h2>
            <p className="mt-2">
              Our pages may link to third-party websites and social platforms. We are not responsible for their content,
              terms, or privacy practices.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">8. Disclaimers and Liability Limits</h2>
            <p className="mt-2">
              Content is provided for general informational purposes and may evolve. To the maximum extent allowed by
              law, we disclaim implied warranties and limit liability for indirect or consequential losses resulting from
              use of the platform.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-charcoal/75">
              We may use technical monitoring (including error tracking) to keep the service reliable. Reports you
              submit via the bug form are stored securely and reviewed by our team; see the Privacy Policy for retention
              and contact details.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">9. Termination</h2>
            <p className="mt-2">
              We may suspend or terminate access where we reasonably believe these Terms were violated or where required
              for legal or security reasons.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">10. Changes to Terms</h2>
            <p className="mt-2">
              We may update these Terms from time to time. Continued use after updates means you accept the revised
              Terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">11. Contact</h2>
            <p className="mt-2">
              Questions about these Terms:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
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
