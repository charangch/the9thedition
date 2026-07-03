"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatApiError } from "@/lib/admin/format-api-error";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://theninthedition.com").replace(/\/$/, "");

type PublishedItem = {
  slug: string;
  title: string;
  category: string;
  hero_image_url?: string | null;
  professional_slug?: string | null;
  published_at?: string | null;
  editorial_status?: string;
  source: "database" | "catalog";
};

export function PublishedProjectsPanel({
  draftRows,
  onEditDraft,
  onEditPublished,
}: {
  draftRows: { id: string; published_slug?: string | null }[];
  onEditDraft: (id: string) => void;
  onEditPublished: (slug: string) => void;
}) {
  const [published, setPublished] = useState<PublishedItem[]>([]);
  const [catalog, setCatalog] = useState<PublishedItem[]>([]);
  const [archived, setArchived] = useState<PublishedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/published-projects");
    const data = (await res.json()) as {
      published?: PublishedItem[];
      catalog?: PublishedItem[];
      archived?: PublishedItem[];
      error?: string;
    };
    if (!res.ok) {
      setError(data.error ?? "Could not load published projects");
      setPublished([]);
      setCatalog([]);
      setArchived([]);
    } else {
      setPublished((data.published ?? []).map((p) => ({ ...p, source: "database" as const })));
      setCatalog((data.catalog ?? []).map((p) => ({ ...p, source: "catalog" as const })));
      setArchived((data.archived ?? []).map((p) => ({ ...p, source: "database" as const })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const allLive = useMemo(() => [...published, ...catalog], [published, catalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = showArchived ? archived : allLive;
    if (!q) return list;
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [allLive, archived, query, showArchived]);

  async function runAction(slug: string, action: "archive" | "unarchive" | "delete") {
    const label = action === "delete" ? "delete" : action;
    if (!confirm(`${label.charAt(0).toUpperCase()}${label.slice(1)} “${slug}”?`)) return;
    setBusy(slug);
    setError(null);
    const res = await fetch("/api/admin/published-projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action }),
    });
    const data = (await res.json()) as { error?: string };
    setBusy(null);
    if (!res.ok) {
      setError(formatApiError(data) || `Could not ${label} project`);
      return;
    }
    await load();
  }

  function linkedDraftId(slug: string) {
    return draftRows.find((r) => r.published_slug === slug)?.id ?? null;
  }

  if (loading) return <p className="text-sm text-muted">Loading published projects…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {published.length} admin-published · {catalog.length} built-in catalog · {archived.length} archived
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowArchived(false)}
            className={`rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
              !showArchived ? "bg-primary text-white" : "border border-primary/25 text-primary"
            }`}
          >
            Live
          </button>
          <button
            type="button"
            onClick={() => setShowArchived(true)}
            className={`rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
              showArchived ? "bg-primary text-white" : "border border-primary/25 text-primary"
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search title, slug, or category…"
        className="w-full max-w-md rounded-lg border border-primary/20 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
      />

      {error ? (
        <p className="whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">{showArchived ? "No archived projects." : "No published projects match your search."}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const draftId = linkedDraftId(p.slug);
            const thumb = p.hero_image_url;
            const isCatalog = p.source === "catalog";
            return (
              <article
                key={`${p.source}-${p.slug}`}
                className="flex flex-col overflow-hidden rounded-xl border border-primary/12 bg-white shadow-sm"
              >
                {thumb ? (
                  <div className="relative aspect-[16/10] bg-charcoal/5">
                    <Image src={thumb} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" unoptimized={thumb.startsWith("http")} />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-primary/5" />
                )}
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-primary">
                    {p.category}
                    {isCatalog ? " · catalog" : showArchived ? " · archived" : " · live"}
                  </p>
                  <h3 className="mt-1 font-serif text-lg leading-snug">{p.title}</h3>
                  <p className="mt-1 break-all font-mono text-[10px] text-muted">/projects/{p.slug}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <a
                      href={`${SITE}/projects/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-primary/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary"
                    >
                      View
                    </a>
                    {draftId ? (
                      <button
                        type="button"
                        className="rounded-full border border-primary/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-charcoal"
                        onClick={() => onEditDraft(draftId)}
                      >
                        Edit
                      </button>
                    ) : !isCatalog ? (
                      <button
                        type="button"
                        className="rounded-full border border-primary/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-charcoal"
                        onClick={() => onEditPublished(p.slug)}
                      >
                        Edit
                      </button>
                    ) : null}
                    {!isCatalog ? (
                      showArchived ? (
                        <button
                          type="button"
                          disabled={busy === p.slug}
                          className="rounded-full border border-primary/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary"
                          onClick={() => void runAction(p.slug, "unarchive")}
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy === p.slug}
                          className="rounded-full border border-amber-300 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-900"
                          onClick={() => void runAction(p.slug, "archive")}
                        >
                          Archive
                        </button>
                      )
                    ) : null}
                    {!isCatalog ? (
                      <button
                        type="button"
                        disabled={busy === p.slug}
                        className="rounded-full border border-red-300 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-red-800"
                        onClick={() => void runAction(p.slug, "delete")}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
