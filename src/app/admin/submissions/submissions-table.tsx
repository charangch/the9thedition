"use client";

import { useEffect, useRef, useState } from "react";
import { PublishingQueueEditFields } from "@/components/admin/publishing-queue-edit-fields";
import { LayoutBlockBuilder } from "@/components/admin/layout-block-builder";
import { type LayoutBlock, normalizeLayoutBlocks } from "@/lib/layout-blocks";
import type { SubmissionFormData } from "@/lib/submission-template";

const fieldInput =
  "w-full rounded-lg border border-primary/20 bg-white px-3 py-2.5 text-sm text-charcoal shadow-sm outline-none transition placeholder:text-muted/60 focus:border-primary/45 focus:ring-2 focus:ring-primary/15";

const INGEST_STEPS = [
  {
    step: 1 as const,
    title: "Build details",
    description: "Content type plus year, area, and location—mirrors the public project sidebar.",
  },
  {
    step: 2 as const,
    title: "Narrative & media",
    description: "Paste the email body, wire URLs, and bulk-upload imagery or PDFs.",
  },
  {
    step: 3 as const,
    title: "Taxonomy",
    description: "Pick architect or company; new names are created automatically on publish.",
  },
  {
    step: 4 as const,
    title: "Promotion",
    description: "Optional catalog PDF and homepage trending flag before you queue the item.",
  },
];

type QueueRow = {
  id: string;
  content_type: "project" | "student";
  source_text: string;
  source_pdf_url: string | null;
  title: string;
  status: "pending" | "review" | "published";
  created_at: string;
  updated_at?: string;
  form_data: Partial<SubmissionFormData>;
  image_urls: string[];
  video_links: string[];
  layout_blocks?: LayoutBlock[];
  taxonomy_name?: string | null;
  taxonomy_kind?: "professional" | "company" | null;
  is_trending?: boolean;
  published_slug?: string | null;
  published_url?: string | null;
};

type TaxonomyOption = { id: string; slug: string; name?: string; firm?: string };

const statuses: QueueRow["status"][] = ["pending", "review", "published"];

export function SubmissionsTable() {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<QueueRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [kindFilter, setKindFilter] = useState<"all" | "project" | "student">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | QueueRow["status"]>("all");
  const [query, setQuery] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [builderStep, setBuilderStep] = useState<1 | 2 | 3 | 4>(1);
  const [professionals, setProfessionals] = useState<TaxonomyOption[]>([]);
  const [companies, setCompanies] = useState<TaxonomyOption[]>([]);
  const [newEntry, setNewEntry] = useState({
    contentType: "project" as "project" | "student",
    sourceText: "",
    sourcePdfUrl: "",
    imageUrlsText: "",
    videoLinksText: "",
    projectYear: "",
    grossArea: "",
    projectLocation: "",
    taxonomyName: "",
    taxonomyKind: "professional" as "professional" | "company",
    isTrending: false,
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/submissions");
      const data = (await res.json()) as {
        queue?: QueueRow[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Failed to load publishing queue");
        setLoading(false);
        return;
      }
      setRows(data.queue ?? []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void (async () => {
        const res = await fetch("/api/admin/taxonomy");
        const data = (await res.json()) as {
          professionals?: TaxonomyOption[];
          companies?: TaxonomyOption[];
        };
        if (!res.ok) return;
        setProfessionals(data.professionals ?? []);
        setCompanies(data.companies ?? []);
      })();
    });
  }, []);

  async function createEntry() {
    setError(null);
    const metadataLines = [
      newEntry.projectYear ? `Completion Year: ${newEntry.projectYear}` : "",
      newEntry.grossArea ? `Gross Built Area: ${newEntry.grossArea}` : "",
      newEntry.projectLocation ? `Project location: ${newEntry.projectLocation}` : "",
    ].filter(Boolean);
    const payload = {
      contentType: newEntry.contentType,
      sourceText: [newEntry.sourceText, ...metadataLines].filter(Boolean).join("\n"),
      sourcePdfUrl: newEntry.sourcePdfUrl || undefined,
      imageUrls: newEntry.imageUrlsText
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
      videoLinks: newEntry.videoLinksText
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
      taxonomyName: newEntry.taxonomyName || undefined,
      taxonomyKind: newEntry.taxonomyKind,
      isTrending: newEntry.isTrending,
    };
    const res = await fetch("/api/admin/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not create publishing entry.");
      return;
    }
    setNewEntry({
      contentType: "project",
      sourceText: "",
      sourcePdfUrl: "",
      imageUrlsText: "",
      videoLinksText: "",
      projectYear: "",
      grossArea: "",
      projectLocation: "",
      taxonomyName: "",
      taxonomyKind: "professional",
      isTrending: false,
    });
    await load();
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingFiles(true);
    setError(null);
    try {
      const textChunks = await Promise.all(
        Array.from(files)
          .filter((file) => file.type === "text/plain")
          .map((file) => file.text().catch(() => "")),
      );
      if (textChunks.length) {
        setNewEntry((prev) => ({
          ...prev,
          sourceText: [prev.sourceText, ...textChunks.filter(Boolean)].filter(Boolean).join("\n\n"),
        }));
      }
      const form = new FormData();
      Array.from(files).forEach((file) => form.append("files", file));
      const res = await fetch("/api/admin/publishing/media", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { urls?: string[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not upload files.");
        return;
      }
      const urls = data.urls ?? [];
      const images = urls.filter((url) => !url.toLowerCase().endsWith(".mp4") && !url.toLowerCase().endsWith(".webm"));
      const videos = urls.filter((url) => url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".webm"));
      const firstPdf = urls.find((url) => url.toLowerCase().endsWith(".pdf"));
      setNewEntry((prev) => ({
        ...prev,
        sourcePdfUrl: firstPdf ? firstPdf : prev.sourcePdfUrl,
        imageUrlsText: [prev.imageUrlsText, ...images].filter(Boolean).join("\n"),
        videoLinksText: [prev.videoLinksText, ...videos].filter(Boolean).join("\n"),
      }));
    } finally {
      setUploadingFiles(false);
    }
  }

  async function updateStatus(id: string, status: QueueRow["status"]) {
    const res = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, action: "save" }),
    });
    if (res.ok) {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }
  }

  async function saveActive(action: "save" | "publish") {
    if (!active) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: active.id,
          status: active.status,
          contentType: active.content_type,
          title: active.title,
          sourceText: active.source_text,
          sourcePdfUrl: active.source_pdf_url ?? undefined,
          formData: active.form_data ?? {},
          imageUrls: active.image_urls ?? [],
          videoLinks: active.video_links ?? [],
          taxonomyName: active.taxonomy_name ?? undefined,
          taxonomyKind: active.taxonomy_kind ?? undefined,
          isTrending: active.is_trending ?? false,
          layoutBlocks: active.layout_blocks ?? [],
          action,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function featureOnHomepage() {
    if (!active?.published_slug || active.content_type !== "project") return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: active.published_slug,
          isFeaturedHome: true,
        }),
      });
      if (!res.ok) setError("Could not update homepage feature draft.");
      else setError(null);
    } finally {
      setSaving(false);
    }
  }

  function activeFormField(key: keyof SubmissionFormData): string {
    const value = active?.form_data?.[key];
    return typeof value === "string" ? value : "";
  }

  function setActiveFormField(key: keyof SubmissionFormData, value: string) {
    if (!active) return;
    setActive({
      ...active,
      form_data: { ...(active.form_data ?? {}), [key]: value },
    });
  }

  function activeFormValue<K extends keyof SubmissionFormData>(key: K): SubmissionFormData[K] | undefined {
    if (!active) return undefined;
    const v = active.form_data?.[key];
    return v as SubmissionFormData[K] | undefined;
  }

  function setActiveFormValue<K extends keyof SubmissionFormData>(key: K, value: SubmissionFormData[K]) {
    if (!active) return;
    setActive({
      ...active,
      form_data: { ...(active.form_data ?? {}), [key]: value },
    });
  }

  function projectNameDisplay(): string {
    if (!active) return "";
    const p = active.form_data?.projectName;
    if (typeof p === "string" && p.trim()) return p;
    return active.title;
  }

  function setProjectNameAndTitle(v: string) {
    if (!active) return;
    setActive({
      ...active,
      title: v,
      form_data: { ...(active.form_data ?? {}), projectName: v },
    });
  }

  function longTextDisplay(): string {
    if (!active) return "";
    const lt = active.form_data?.longText;
    if (typeof lt === "string" && lt.trim()) return lt;
    return active.source_text;
  }

  function setLongTextAndSource(v: string) {
    if (!active) return;
    setActive({
      ...active,
      source_text: v,
      form_data: { ...(active.form_data ?? {}), longText: v },
    });
  }

  const filteredRows = rows.filter((row) => {
    const matchesKind = kindFilter === "all" ? true : row.content_type === kindFilter;
    const matchesStatus = statusFilter === "all" ? true : row.status === statusFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q ? true : row.title.toLowerCase().includes(q) || row.id.toLowerCase().includes(q);
    return matchesKind && matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-5">
      {error ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900 shadow-sm"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            className="rounded-full border border-red-300/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-red-800 hover:bg-red-100/80"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-primary/12 bg-surface shadow-[0_24px_80px_-48px_rgba(28,28,28,0.35)]">
        <div className="border-b border-primary/10 bg-gradient-to-br from-white via-surface to-primary/[0.04] px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/90">Publishing intake</p>
          <h3 className="mt-2 font-serif text-2xl tracking-tight text-charcoal sm:text-3xl">Ingest from email package</h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Walk through metadata, media, taxonomy, and promotion. Each step maps to the live project layout and
            sidebar—nothing here is throwaway copy.
          </p>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INGEST_STEPS.map(({ step, title, description }) => {
              const active = builderStep === step;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => setBuilderStep(step)}
                  className={`group flex flex-col rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-primary/35 bg-white shadow-md ring-1 ring-primary/20"
                      : "border-primary/10 bg-white/70 hover:border-primary/25 hover:bg-white"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                      active ? "bg-primary text-white" : "bg-charcoal/[0.06] text-charcoal/55 group-hover:text-charcoal"
                    }`}
                  >
                    {step}
                  </span>
                  <span className="mt-3 font-serif text-[15px] leading-snug text-charcoal">{title}</span>
                  <span className="mt-1.5 text-[11px] leading-relaxed text-muted sm:text-xs">{description}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-primary/10 bg-white/80 p-5 shadow-inner shadow-primary/[0.03] sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-primary/8 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
                  Step {builderStep} of 4
                </p>
                <h4 className="mt-1 font-serif text-xl text-charcoal">
                  {INGEST_STEPS[builderStep - 1]?.title ?? "Intake"}
                </h4>
              </div>
              <p className="max-w-md text-xs leading-relaxed text-muted sm:text-sm">
                {INGEST_STEPS[builderStep - 1]?.description}
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {builderStep === 1 ? (
                <div className="grid gap-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Content type</label>
                    <select
                      value={newEntry.contentType}
                      onChange={(e) =>
                        setNewEntry((v) => ({
                          ...v,
                          contentType: e.target.value as "project" | "student",
                        }))
                      }
                      className={`${fieldInput} mt-2`}
                    >
                      <option value="project">Project</option>
                      <option value="student">Student (events & awards)</option>
                    </select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Year</label>
                      <input
                        value={newEntry.projectYear}
                        onChange={(e) => setNewEntry((v) => ({ ...v, projectYear: e.target.value }))}
                        placeholder="Completion year"
                        className={`${fieldInput} mt-2`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Gross area</label>
                      <input
                        value={newEntry.grossArea}
                        onChange={(e) => setNewEntry((v) => ({ ...v, grossArea: e.target.value }))}
                        placeholder="e.g. 12,400 sq ft"
                        className={`${fieldInput} mt-2`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Location</label>
                      <input
                        value={newEntry.projectLocation}
                        onChange={(e) => setNewEntry((v) => ({ ...v, projectLocation: e.target.value }))}
                        placeholder="City, region, country"
                        className={`${fieldInput} mt-2`}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {builderStep === 2 ? (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Description & credits</label>
                    <textarea
                      value={newEntry.sourceText}
                      onChange={(e) => setNewEntry((v) => ({ ...v, sourceText: e.target.value }))}
                      placeholder="Paste the full message received over email—headers, credits, and narrative."
                      className={`${fieldInput} mt-2 min-h-[160px] resize-y`}
                    />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Image URLs</label>
                      <textarea
                        value={newEntry.imageUrlsText}
                        onChange={(e) => setNewEntry((v) => ({ ...v, imageUrlsText: e.target.value }))}
                        placeholder="One URL per line · supports 20+ high-res frames"
                        className={`${fieldInput} mt-2 min-h-[120px] resize-y font-mono text-[13px]`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Video URLs</label>
                      <textarea
                        value={newEntry.videoLinksText}
                        onChange={(e) => setNewEntry((v) => ({ ...v, videoLinksText: e.target.value }))}
                        placeholder="YouTube, Vimeo, or direct MP4/WebM links—one per line"
                        className={`${fieldInput} mt-2 min-h-[120px] resize-y font-mono text-[13px]`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Bulk upload</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={(e) => void uploadFiles(e.currentTarget.files)}
                    />
                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(false);
                        void uploadFiles(e.dataTransfer.files);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${
                        dragActive
                          ? "border-primary/50 bg-primary/[0.06]"
                          : "border-primary/20 bg-primary/[0.02] hover:border-primary/35 hover:bg-primary/[0.04]"
                      }`}
                    >
                      <p className="font-serif text-base text-charcoal">Drop files or click to browse</p>
                      <p className="mt-2 max-w-md text-xs leading-relaxed text-muted">
                        Images, PDFs, and video files upload to InsForge Storage. URLs are appended to the lists above
                        automatically.
                      </p>
                      {uploadingFiles ? (
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-primary">Uploading…</p>
                      ) : (
                        <span className="mt-4 rounded-full border border-primary/25 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                          Choose files
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {builderStep === 3 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Link as</label>
                    <select
                      value={newEntry.taxonomyKind}
                      onChange={(e) =>
                        setNewEntry((v) => ({ ...v, taxonomyKind: e.target.value as "professional" | "company" }))
                      }
                      className={`${fieldInput} mt-2`}
                    >
                      <option value="professional">Architect / professional</option>
                      <option value="company">Brand / company</option>
                    </select>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      Professionals power portfolio pages and student attribution.
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Name</label>
                    <input
                      list={newEntry.taxonomyKind === "professional" ? "professionals-list" : "companies-list"}
                      value={newEntry.taxonomyName}
                      onChange={(e) => setNewEntry((v) => ({ ...v, taxonomyName: e.target.value }))}
                      placeholder="Search existing or type a new name"
                      className={`${fieldInput} mt-2`}
                    />
                    <datalist id="professionals-list">
                      {professionals.map((p) => (
                        <option key={p.id} value={p.firm ?? p.name ?? ""} />
                      ))}
                    </datalist>
                    <datalist id="companies-list">
                      {companies.map((c) => (
                        <option key={c.id} value={c.name ?? ""} />
                      ))}
                    </datalist>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      Matches hydrate from your database. Unmatched names become new records when you publish.
                    </p>
                  </div>
                </div>
              ) : null}

              {builderStep === 4 ? (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Catalog / PDF URL</label>
                    <input
                      value={newEntry.sourcePdfUrl}
                      onChange={(e) => setNewEntry((v) => ({ ...v, sourcePdfUrl: e.target.value }))}
                      placeholder="Optional direct link for source references"
                      className={`${fieldInput} mt-2 font-mono text-[13px]`}
                    />
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-primary/12 bg-primary/[0.03] p-4">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/30"
                      checked={newEntry.isTrending}
                      onChange={(e) => setNewEntry((v) => ({ ...v, isTrending: e.target.checked }))}
                    />
                    <span>
                      <span className="font-medium text-charcoal">Feature in Trending on the homepage</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted">
                        Surfaces alongside the top three curated projects when inventory allows.
                      </span>
                    </span>
                  </label>
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-primary/10 pt-6">
              <button
                type="button"
                disabled={builderStep === 1}
                onClick={() => setBuilderStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s))}
                className="rounded-full border border-primary/25 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <div className="flex flex-wrap gap-2">
                {builderStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setBuilderStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s))}
                    className="rounded-full bg-primary px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-primary/90"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void createEntry()}
                    className="rounded-full bg-charcoal px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-charcoal/90"
                  >
                    Create queue entry
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading && rows.length === 0 ? (
        <p className="rounded-xl border border-primary/12 bg-white/60 px-4 py-3 text-sm text-muted shadow-inner">
          Loading publishing queue…
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or ID"
          className={`${fieldInput} min-w-[240px]`}
        />
        <select
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value as "all" | "project" | "student")}
          className={`${fieldInput} min-w-[180px]`}
        >
          <option value="all">All content types</option>
          <option value="project">Project</option>
          <option value="student">Student</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | QueueRow["status"])}
          className={`${fieldInput} min-w-[160px]`}
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border border-primary/15 bg-surface">
        <table className="min-w-full">
          <thead className="border-b border-primary/10">
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-primary/10 text-sm">
                <td className="px-4 py-3">
                  <p className="font-medium text-charcoal">{row.title}</p>
                  <p className="text-xs text-muted">{row.id.slice(0, 8)}...</p>
                </td>
                <td className="px-4 py-3 capitalize">{row.content_type}</td>
                <td className="px-4 py-3 text-muted">{new Date(row.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-md border border-primary/20 bg-white px-2 py-1 text-sm"
                    value={row.status}
                    onChange={(e) => void updateStatus(row.id, e.currentTarget.value as QueueRow["status"])}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setActive(row)}
                    className="rounded-md border border-primary/25 px-3 py-1 text-xs uppercase tracking-[0.12em] text-primary"
                  >
                    Review / Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {active ? (
        <div className="overflow-hidden rounded-2xl border border-primary/12 bg-surface shadow-[0_24px_80px_-48px_rgba(28,28,28,0.35)]">
          <div className="border-b border-primary/10 bg-gradient-to-br from-white via-surface to-primary/[0.04] px-5 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/90">Review & refine</p>
            <h3 className="mt-2 font-serif text-2xl tracking-tight text-charcoal sm:text-3xl">Edit queue entry</h3>
            <p className="mt-2 text-sm text-muted">
              Publishing URL: <span className="font-medium text-charcoal">{active.published_url ?? "Not published yet"}</span>
            </p>
            <p className="mt-1 font-mono text-xs text-muted">ID · {active.id}</p>
          </div>

          <div className="space-y-4 px-5 py-6 sm:px-8">
            <PublishingQueueEditFields
              contentType={active.content_type}
              helpers={{
                fieldInput,
                str: activeFormField,
                setStr: setActiveFormField,
                val: activeFormValue,
                setVal: setActiveFormValue,
                projectName: projectNameDisplay(),
                setProjectName: setProjectNameAndTitle,
                longText: longTextDisplay(),
                setLongText: setLongTextAndSource,
              }}
            />

            <div className="rounded-2xl border border-primary/10 bg-white/85 p-5 shadow-inner shadow-primary/[0.03]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Publishing metadata</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Content type, catalog PDF, hero frame, taxonomy (auto-creates on publish), and homepage trending.
              </p>
              <select
                value={active.content_type}
                onChange={(e) => setActive({ ...active, content_type: e.target.value as QueueRow["content_type"] })}
                className={`${fieldInput} mt-4`}
              >
                <option value="project">Project</option>
                <option value="student">Student (events & awards)</option>
              </select>
              <input
                className={`${fieldInput} mt-3 font-mono text-[13px]`}
                value={active.source_pdf_url ?? ""}
                onChange={(e) => setActive({ ...active, source_pdf_url: e.target.value })}
                placeholder="Primary PDF / catalog URL (storage or public link)"
              />
              <input
                className={`${fieldInput} mt-3`}
                value={activeFormField("coverImageUrl")}
                onChange={(e) => setActiveFormField("coverImageUrl", e.target.value)}
                placeholder="Cover / hero image URL"
              />
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <select
                  value={active.taxonomy_kind ?? "professional"}
                  onChange={(e) =>
                    setActive({
                      ...active,
                      taxonomy_kind: e.target.value as "professional" | "company",
                    })
                  }
                  className={fieldInput}
                >
                  <option value="professional">Architect / professional</option>
                  <option value="company">Company / manufacturer</option>
                </select>
                <input
                  value={active.taxonomy_name ?? ""}
                  onChange={(e) => setActive({ ...active, taxonomy_name: e.target.value })}
                  placeholder="Search or create name"
                  className={fieldInput}
                />
              </div>
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-primary/12 bg-primary/[0.03] p-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/30"
                  checked={Boolean(active.is_trending)}
                  onChange={(e) => setActive({ ...active, is_trending: e.target.checked })}
                />
                <span>
                  <span className="font-medium text-charcoal">Mark as Trending</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">Surfaces on the homepage Trending rail for projects when enabled.</span>
                </span>
              </label>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-white/85 p-5 shadow-inner shadow-primary/[0.03]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Asset URLs</p>
              <p className="mt-1 text-xs text-muted">Gallery imagery and embeddable video URLs—one per line.</p>
              <textarea
                className={`${fieldInput} mt-4 min-h-[100px] resize-y font-mono text-[13px]`}
                value={(active.image_urls ?? []).join("\n")}
                onChange={(e) =>
                  setActive({
                    ...active,
                    image_urls: e.target.value
                      .split("\n")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Image URLs (one per line)"
              />
              <textarea
                className={`${fieldInput} mt-3 min-h-[88px] resize-y font-mono text-[13px]`}
                value={(active.video_links ?? []).join("\n")}
                onChange={(e) =>
                  setActive({
                    ...active,
                    video_links: e.target.value
                      .split("\n")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Video links (one per line)"
              />
            </div>

            <div className="rounded-2xl border border-primary/10 bg-white/85 p-5 shadow-inner shadow-primary/[0.03]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Visual layout</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Drag blocks to match the magazine layout. Hero, gallery, and enquiry modules map directly to the live
                page.
              </p>
              <div className="mt-4">
                <LayoutBlockBuilder
                  value={active.layout_blocks ?? []}
                  onChange={(blocks) =>
                    setActive({
                      ...active,
                      layout_blocks: normalizeLayoutBlocks(blocks),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-primary/10 bg-white/50 px-5 py-5 sm:px-8">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveActive("save")}
              className="rounded-full border border-primary/25 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:bg-primary/5"
            >
              Save entry
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveActive("publish")}
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-primary/90"
            >
              Publish now
            </button>
            {active.published_slug ? (
              <>
                <a
                  href={
                    active.content_type === "student"
                        ? "/awards"
                        : `/projects/${active.published_slug}`
                  }
                  className="rounded-full border border-primary/25 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:bg-primary/5"
                >
                  Open published page
                </a>
                {active.content_type === "project" ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void featureOnHomepage()}
                    className="rounded-full border border-primary/25 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:bg-primary/5"
                  >
                    Feature on homepage
                  </button>
                ) : null}
              </>
            ) : null}
            <button
              type="button"
              disabled={saving}
              onClick={() => setActive(null)}
              className="rounded-full border border-charcoal/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/80 transition hover:bg-charcoal/[0.04]"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
