"use client";

import { useCallback, useEffect, useState } from "react";

type BugReport = {
  id: string;
  created_at: string;
  summary: string;
  steps: string | null;
  browser: string | null;
  page_url: string | null;
  screenshot_url: string | null;
  contact_email: string | null;
  user_agent: string | null;
  ip_prefix: string | null;
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function BugReportsTable() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/bug-reports");
    const data = (await res.json()) as { reports?: BugReport[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not load bug reports");
      setReports([]);
    } else {
      setReports(data.reports ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p className="text-sm text-muted">Loading bug reports…</p>;
  if (error) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{error}</p>
    );
  }
  if (!reports.length) {
    return <p className="text-sm text-muted">No bug reports yet. Submissions from /report-bug will appear here.</p>;
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => {
        const open = expanded === r.id;
        return (
          <article key={r.id} className="rounded-xl border border-primary/12 bg-white shadow-sm">
            <button
              type="button"
              className="flex w-full flex-wrap items-start justify-between gap-3 px-4 py-3 text-left"
              onClick={() => setExpanded(open ? null : r.id)}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-charcoal">{r.summary}</p>
                <p className="mt-1 text-[11px] text-muted">{formatWhen(r.created_at)}</p>
              </div>
              <span className="text-[10px] uppercase tracking-[0.12em] text-primary">{open ? "Hide" : "Details"}</span>
            </button>
            {open ? (
              <div className="space-y-3 border-t border-primary/10 px-4 py-4 text-sm text-charcoal/90">
                {r.page_url ? (
                  <p>
                    <span className="font-semibold text-muted">Page:</span>{" "}
                    <a href={r.page_url} className="text-primary underline" target="_blank" rel="noreferrer">
                      {r.page_url}
                    </a>
                  </p>
                ) : null}
                {r.contact_email ? (
                  <p>
                    <span className="font-semibold text-muted">Contact:</span> {r.contact_email}
                  </p>
                ) : null}
                {r.browser ? (
                  <p>
                    <span className="font-semibold text-muted">Browser:</span> {r.browser}
                  </p>
                ) : null}
                {r.steps ? (
                  <div>
                    <p className="font-semibold text-muted">Steps</p>
                    <p className="mt-1 whitespace-pre-wrap">{r.steps}</p>
                  </div>
                ) : null}
                {r.screenshot_url ? (
                  <p>
                    <a href={r.screenshot_url} className="text-primary underline" target="_blank" rel="noreferrer">
                      Screenshot
                    </a>
                  </p>
                ) : null}
                {r.user_agent ? (
                  <p className="break-all text-xs text-muted">
                    <span className="font-semibold">User agent:</span> {r.user_agent}
                  </p>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
