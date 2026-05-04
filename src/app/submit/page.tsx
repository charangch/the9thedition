import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { EDITORIAL_EMAIL, LETTERS_EMAIL } from "@/lib/site-contact";

export default function SubmitPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-premium py-12 md:py-16">
        <div className="rounded-2xl border border-primary/15 bg-surface p-7 md:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Submission Policy</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">Project submissions by email</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
            Public form submission has been retired. Please send your project package by email with the checklist PDF,
            descriptions, credits, and image/video files (or a single cloud folder link). Editorial admins ingest packages
            in FIFO order.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/submission-guidelines"
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:opacity-95"
            >
              Full guidelines &amp; PDF
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-primary/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal hover:border-primary"
            >
              View projects
            </Link>
          </div>
          <div className="mt-8 rounded-xl border border-primary/15 bg-background-light p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-primary">Publication intake (attachments)</p>
            <p className="mt-2 font-serif text-2xl">
              <a href={`mailto:${LETTERS_EMAIL}`} className="hover:text-primary">
                {LETTERS_EMAIL}
              </a>
            </p>
            <p className="mt-3 text-sm text-charcoal/80">
              Subject: <code className="rounded bg-white/80 px-1.5 py-0.5 text-xs">SUBMISSION — [Project title] — [City, Country]</code>
            </p>
          </div>
          <div className="mt-6 rounded-xl border border-primary/10 bg-background-light/80 p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-primary">General editorial</p>
            <p className="mt-2 text-sm text-muted">
              <a href={`mailto:${EDITORIAL_EMAIL}`} className="font-medium text-charcoal hover:text-primary">
                {EDITORIAL_EMAIL}
              </a>{" "}
              — pitches, partnerships, and non-attachment queries.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
