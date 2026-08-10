import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { EDITORIAL_EMAIL, LETTERS_EMAIL } from "@/lib/site-contact";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = buildPageMetadata({
  title: "Submit a Project",
  description:
    "Submit architecture and interior projects to The 9th Edition for editorial review and publication consideration.",
  path: "/submit",
});

export default function SubmitPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-premium py-12 md:py-16">
        <div className="rounded-2xl border border-primary/15 bg-surface p-7 md:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Submissions</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">Submit a project</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
            Share your project for editorial review. Complete the form below, or email a full package to{" "}
            <a href={`mailto:${LETTERS_EMAIL}`} className="text-charcoal underline hover:text-primary">
              {LETTERS_EMAIL}
            </a>
            . See{" "}
            <Link href="/submission-guidelines" className="text-charcoal underline hover:text-primary">
              submission guidelines
            </Link>{" "}
            for required materials.
          </p>
          <SubmitForm />
          <div className="mt-10 border-t border-primary/10 pt-6 text-sm text-muted">
            General editorial:{" "}
            <a href={`mailto:${EDITORIAL_EMAIL}`} className="text-charcoal hover:text-primary">
              {EDITORIAL_EMAIL}
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
