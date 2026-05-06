"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SUPPORT_EMAIL } from "@/lib/site-contact";

export default function ReportBugPage() {
  const [summary, setSummary] = useState("");
  const [steps, setSteps] = useState("");
  const [browser, setBrowser] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/report-bug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          steps: steps.trim() || undefined,
          browser: browser.trim() || undefined,
          pageUrl: pageUrl.trim() || "",
          screenshotUrl: screenshotUrl.trim() || "",
          contactEmail: contactEmail.trim() || "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setStatus("err");
        setMessage(data.error ?? "Something went wrong.");
        return;
      }
      setStatus("ok");
      setMessage(data.message ?? "Thanks — we received your report.");
      setSummary("");
      setSteps("");
      setBrowser("");
      setPageUrl("");
      setScreenshotUrl("");
      setContactEmail("");
    } catch {
      setStatus("err");
      setMessage("Network error. Try again or email support.");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="container-premium py-12 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Help</p>
        <h1 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">Report a bug</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/80">
          Tell us what broke, what you expected, and how to reproduce it. For account or privacy issues, email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>

        <form onSubmit={onSubmit} className="mt-10 max-w-xl space-y-5">
          <div>
            <label htmlFor="bug-summary" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Summary <span className="text-primary">*</span>
            </label>
            <textarea
              id="bug-summary"
              required
              minLength={10}
              maxLength={4000}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-charcoal outline-none ring-primary/30 focus:ring-2"
              placeholder="Short description of the problem"
            />
          </div>
          <div>
            <label htmlFor="bug-steps" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Steps to reproduce
            </label>
            <textarea
              id="bug-steps"
              maxLength={8000}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              rows={5}
              className="mt-2 w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-charcoal outline-none ring-primary/30 focus:ring-2"
              placeholder="1. Go to… 2. Click… 3. See error…"
            />
          </div>
          <div>
            <label htmlFor="bug-browser" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Browser / device
            </label>
            <input
              id="bug-browser"
              maxLength={200}
              value={browser}
              onChange={(e) => setBrowser(e.target.value)}
              className="mt-2 w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-charcoal outline-none ring-primary/30 focus:ring-2"
              placeholder="e.g. Safari 17 on iPhone, Chrome desktop"
            />
          </div>
          <div>
            <label htmlFor="bug-page" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Page URL
            </label>
            <input
              id="bug-page"
              type="url"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              className="mt-2 w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-charcoal outline-none ring-primary/30 focus:ring-2"
              placeholder="https://…"
            />
          </div>
          <div>
            <label htmlFor="bug-shot" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Screenshot link (optional)
            </label>
            <input
              id="bug-shot"
              type="url"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              className="mt-2 w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-charcoal outline-none ring-primary/30 focus:ring-2"
              placeholder="https://…"
            />
          </div>
          <div>
            <label htmlFor="bug-email" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Your email (optional — if we need to follow up)
            </label>
            <input
              id="bug-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-charcoal outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          {message ? (
            <p
              className={`text-sm ${status === "ok" ? "text-emerald-800" : status === "err" ? "text-red-700" : "text-charcoal"}`}
              role="status"
            >
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60"
          >
            {status === "loading" ? "Sending…" : "Submit report"}
          </button>
        </form>

        <p className="mt-10 text-sm">
          <Link href="/" className="text-primary hover:underline">
            ← Home
          </Link>
        </p>
      </main>
    </>
  );
}
