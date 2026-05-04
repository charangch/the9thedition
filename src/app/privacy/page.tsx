import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SUPPORT_EMAIL } from "@/lib/site-contact";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-premium py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Legal</p>
        <h1 className="mt-3 font-serif text-4xl text-charcoal">Privacy Policy</h1>
        <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted">Last updated: April 30, 2026</p>

        <div className="mt-8 max-w-4xl space-y-7 text-sm leading-relaxed text-charcoal/85">
          <section>
            <h2 className="font-serif text-2xl text-charcoal">1. Scope</h2>
            <p className="mt-2">
              This Privacy Policy explains how The 9th Edition collects, uses, stores, and protects personal data when
              you browse our website, subscribe to newsletters, submit project information, or interact with account
              features. This policy is written for a design and architecture publishing platform with editorial, lead,
              and subscriber workflows.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">2. Information We Collect</h2>
            <p className="mt-2">We collect data in the following categories:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Identity and contact details (name, email address) provided by you.</li>
              <li>Submission content (project details, descriptions, uploaded media links, enquiry messages).</li>
              <li>Account and authentication data (session metadata, login tokens, role assignments).</li>
              <li>Technical and security logs (IP-derived rate-limit keys, request metadata, error logs).</li>
              <li>Communication preferences (newsletter subscription status and source).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">3. How We Use Data</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To provide and improve editorial publishing, search, and account functionality.</li>
              <li>To process project enquiries and editorial submissions.</li>
              <li>To send newsletters where you have subscribed or requested communications.</li>
              <li>To prevent abuse, fraud, and unauthorized access through security controls.</li>
              <li>To maintain legal records, audit actions, and comply with applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">4. Legal Bases</h2>
            <p className="mt-2">
              Depending on your location, our processing relies on one or more of: consent, contract necessity,
              legitimate interests (such as service security and editorial operations), and legal obligations.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">5. Data Sharing</h2>
            <p className="mt-2">
              We do not sell personal data. We may share limited data with vetted service providers that help us run
              authentication, hosting, storage, email operations, and analytics/security tooling, subject to
              confidentiality and data protection obligations.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">6. Retention</h2>
            <p className="mt-2">
              We retain personal data only as long as necessary for the purpose collected, legal compliance, dispute
              resolution, and security. Retention windows vary by data class (for example, subscriber records, enquiry
              records, and admin audit logs).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">7. Your Rights</h2>
            <p className="mt-2">
              Subject to applicable law, you may request access, correction, deletion, portability, restriction, or
              objection to certain processing. You may also withdraw consent where processing is consent-based.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">8. Security</h2>
            <p className="mt-2">
              We implement technical and organizational controls designed to protect confidentiality, integrity, and
              availability of data, including authentication controls, role-restricted admin access, and rate-limiting
              for sensitive public endpoints.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">9. Cross-Border Processing</h2>
            <p className="mt-2">
              Our service providers may process data in multiple jurisdictions. Where required, we use appropriate
              safeguards for international transfers.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">10. Contact</h2>
            <p className="mt-2">
              For privacy requests, contact:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
              . We may need to verify your identity before
              processing requests.
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
