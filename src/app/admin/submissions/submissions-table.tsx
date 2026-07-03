"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ArchitectOption,
  architectOptionValue,
  buildArchitectOptions,
  parseArchitectOptionValue,
} from "@/lib/admin/architect-options";
import { videoPreviewImage } from "@/lib/admin/media-preview";
import { formatApiError } from "@/lib/admin/format-api-error";
import {
  emptyProjectPublishForm,
  formFromPublishedRow,
  formFromQueueRow,
  PROJECT_CATEGORIES,
  PROJECT_TYPES,
  validatePublishForm,
  type ProjectPublishDraft,
} from "@/lib/admin/project-publish-schema";
import { MediaUploadPanel } from "@/components/admin/media-upload-panel";
import { PublishedProjectsPanel } from "@/components/admin/published-projects-panel";
import { ArchitectPicker } from "@/components/admin/architect-picker";
import { LocationCombobox } from "@/components/admin/location-combobox";
import type { ProfessionalRow } from "@/lib/professionals-db";
import { getArchitectBySlug } from "@/lib/architects";
import { slugifyProject } from "@/lib/submission-template";

const PRODUCTION_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://theninthedition.com").replace(
  /\/$/,
  "",
);

const input =
  "w-full rounded-lg border border-primary/20 bg-white px-3 py-2.5 text-sm text-charcoal shadow-sm outline-none transition placeholder:text-muted/60 focus:border-primary/45 focus:ring-2 focus:ring-primary/15";

type QueueRow = {
  id: string;
  title: string;
  status: string;
  form_data: Record<string, unknown> | null;
  image_urls: string[];
  video_links: string[];
  published_slug?: string | null;
  published_url?: string | null;
};

type PublishedRow = {
  slug: string;
  title: string;
  category: string;
  hero_image_url?: string | null;
};

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-primary/12 bg-white/90 p-5 shadow-sm">
      <h3 className="font-serif text-lg text-charcoal">{title}</h3>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</label>
      {hint ? <p className="mt-0.5 text-[11px] text-muted/90">{hint}</p> : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function SubmissionsTable() {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [published, setPublished] = useState<PublishedRow[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalRow[]>([]);
  const [architectOptions, setArchitectOptions] = useState<ArchitectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | "new">("new");
  const [form, setForm] = useState<ProjectPublishDraft>(emptyProjectPublishForm());
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [heroUrlInput, setHeroUrlInput] = useState("");
  const [heroReady, setHeroReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [faqDraft, setFaqDraft] = useState([{ question: "", answer: "" }]);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingProfessionalImage, setUploadingProfessionalImage] = useState(false);
  const [professionalImageUrlInput, setProfessionalImageUrlInput] = useState("");
  const [professionalImageUploadError, setProfessionalImageUploadError] = useState<string | null>(null);
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);
  const [importingVideo, setImportingVideo] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<"drafts" | "published">("drafts");

  const architectSelectOptions = useMemo(
    () => [
      { value: "__new__", label: "+ Create new architect / firm", hint: "New profile with optional social links" },
      ...architectOptions.map((opt) => ({
        value: architectOptionValue(opt),
        label: `${opt.firm} (${opt.name})`,
        hint: opt.kind === "static" ? "Site directory" : "Database profile",
      })),
    ],
    [architectOptions],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [subRes, taxRes, pubRes] = await Promise.all([
      fetch("/api/admin/submissions"),
      fetch("/api/admin/taxonomy"),
      fetch("/api/admin/published-projects"),
    ]);
    const subData = (await subRes.json()) as {
      queue?: QueueRow[];
      published?: PublishedRow[];
      publishedWarning?: string | null;
      error?: string;
    };
    const taxData = (await taxRes.json()) as {
      professionals?: ProfessionalRow[];
      architectOptions?: ArchitectOption[];
    };
    const pubData = (await pubRes.json()) as { published?: PublishedRow[]; error?: string };

    if (taxRes.ok) {
      const pros = taxData.professionals ?? [];
      setProfessionals(pros);
      setArchitectOptions(taxData.architectOptions ?? buildArchitectOptions(pros));
    }
    if (!subRes.ok) {
      setError(subData.error ?? "Could not load submissions");
      setRows([]);
    } else {
      setRows(subData.queue ?? []);
    }
    if (pubRes.ok) {
      setPublished(pubData.published ?? subData.published ?? []);
    } else if (subRes.ok) {
      setPublished(subData.published ?? []);
      if (pubData.error) setError(pubData.error);
    } else {
      setPublished([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const slugPreview = useMemo(() => {
    const custom = form.slug?.trim();
    if (custom) return slugifyProject(custom);
    return slugifyProject(form.projectName || "project-title");
  }, [form.slug, form.projectName]);

  const publishUrl = `${PRODUCTION_SITE_URL}/projects/${slugPreview || "project-title"}`;

  const activeQueueRow = useMemo(
    () => (activeId === "new" ? null : rows.find((r) => r.id === activeId) ?? null),
    [activeId, rows],
  );

  const editingPublishedSlug = activeQueueRow?.published_slug ?? null;

  const architectSelectValue = useMemo(() => {
    if (form.architectMode === "new") return "__new__";
    if (form.professionalId) return `db:${form.professionalId}`;
    if (form.architectStaticSlug) return `static:${form.architectStaticSlug}`;
    return "__new__";
  }, [form.architectMode, form.professionalId, form.architectStaticSlug]);

  const videoThumb = useMemo(() => videoPreviewImage(form.videoUrl ?? ""), [form.videoUrl]);

  function patch<K extends keyof ProjectPublishDraft>(key: K, value: ProjectPublishDraft[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function patchSocial(key: keyof NonNullable<ProjectPublishDraft["professionalSocials"]>, value: string) {
    setForm((prev) => ({
      ...prev,
      professionalSocials: { ...(prev.professionalSocials ?? {}), [key]: value },
    }));
  }

  function selectRow(row: QueueRow | null) {
    if (!row) {
      setActiveId("new");
      setForm(emptyProjectPublishForm());
      setGalleryUrls([]);
      setHeroUrlInput("");
      setHeroReady(false);
      setVideoReady(false);
      setFaqDraft([{ question: "", answer: "" }]);
      return;
    }
    setActiveId(row.id);
    const mapped = formFromQueueRow({
      title: row.title,
      form_data: row.form_data,
      image_urls: row.image_urls,
      video_links: row.video_links,
      published_slug: row.published_slug,
    });
    setForm(mapped);
    const hero = mapped.coverImageUrl;
    setGalleryUrls((mapped.galleryUrls ?? []).filter((u) => u !== hero));
    setHeroReady(Boolean(hero));
    setVideoReady(Boolean(mapped.videoUrl));
    setFaqDraft(mapped.faq?.length ? mapped.faq : [{ question: "", answer: "" }]);
  }

  function selectArchitect(value: string) {
    if (value === "__new__") {
      setForm((prev) => ({
        ...prev,
        architectMode: "new",
        professionalId: "",
        architectStaticSlug: "",
      }));
      return;
    }
    const parsed = parseArchitectOptionValue(value);
    if (!parsed) return;
    if (parsed.kind === "db") {
      const pro = professionals.find((p) => p.id === parsed.id);
      if (!pro) return;
      setForm((prev) => ({
        ...prev,
        architectMode: "existing",
        professionalId: pro.id,
        architectStaticSlug: "",
        architectureFirm: pro.firm,
        leadArchitect: pro.name,
        professionalImageUrl: pro.image_url ?? "",
      }));
      return;
    }
    const opt = architectOptions.find((o) => o.kind === "static" && o.slug === parsed.slug);
    if (!opt || opt.kind !== "static") return;
    const catalog = getArchitectBySlug(opt.slug);
    setForm((prev) => ({
      ...prev,
      architectMode: "existing",
      professionalId: "",
      architectStaticSlug: opt.slug,
      architectureFirm: opt.firm,
      leadArchitect: opt.name,
      professionalImageUrl: catalog?.image ?? "",
    }));
  }

  function buildPayload(): ProjectPublishDraft {
    const faq = faqDraft.filter((f) => f.question.trim() && f.answer.trim());
    return {
      ...form,
      slug: slugPreview,
      galleryUrls: galleryUrls.slice(0, 25),
      faq: faq.length ? faq : form.faq,
    };
  }

  async function uploadFiles(files: FileList | null, target: "hero" | "gallery" | "professional") {
    if (!files?.length) return;
    const setBusy =
      target === "hero"
        ? setUploadingHero
        : target === "gallery"
          ? setUploadingGallery
          : setUploadingProfessionalImage;
    const setUploadErr =
      target === "hero"
        ? setHeroUploadError
        : target === "gallery"
          ? setGalleryUploadError
          : setProfessionalImageUploadError;
    setBusy(true);
    setUploadErr(null);
    setError(null);
    try {
      const body = new FormData();
      Array.from(files).forEach((f) => body.append("files", f));
      const res = await fetch("/api/admin/publishing/media", {
        method: "POST",
        body,
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => ({}))) as { urls?: string[]; error?: string };
      if (!res.ok) {
        const msg = formatApiError(data) || "Upload failed";
        setUploadErr(msg);
        setError(msg);
        return;
      }
      const urls = data.urls ?? [];
      if (!urls.length) {
        const msg = "Upload returned no image URL. Check that the submission-media bucket exists and is public.";
        setUploadErr(msg);
        setError(msg);
        return;
      }
      if (target === "hero" && urls[0]) {
        patch("coverImageUrl", urls[0]);
        setHeroReady(true);
        setHeroUrlInput("");
        setSaveMessage("Hero image uploaded.");
      }
      if (target === "gallery") {
        setGalleryUrls((prev) => [...prev, ...urls].slice(0, 25));
        setSaveMessage(`${urls.length} image(s) added to gallery.`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadErr(msg);
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function importUrl(url: string, target: "hero" | "gallery" | "professional") {
    const trimmed = url.trim();
    if (!trimmed) return;
    setError(null);
    const res = await fetch("/api/admin/media/import-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: trimmed, kind: "image" }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not use URL");
      return;
    }
    const resolved = data.url ?? trimmed;
    if (target === "hero") {
      patch("coverImageUrl", resolved);
      setHeroReady(true);
      setHeroUrlInput("");
    } else if (target === "gallery") {
      setGalleryUrls((prev) => [...prev, resolved].slice(0, 25));
      setGalleryUrlInput("");
    } else {
      patch("professionalImageUrl", resolved);
      setProfessionalImageUrlInput("");
    }
  }

  async function importVideoUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    setImportingVideo(true);
    setError(null);
    const res = await fetch("/api/admin/media/import-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: trimmed, kind: "video" }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    setImportingVideo(false);
    if (!res.ok) {
      setError(data.error ?? "Could not use video URL");
      setVideoReady(false);
      return;
    }
    patch("videoUrl", data.url ?? trimmed);
    setVideoReady(true);
  }

  async function saveDraft() {
    if (!form.projectName.trim()) {
      setError("Add a project title before saving.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    const res = await fetch("/api/admin/submissions", {
      method: activeId === "new" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: activeId === "new" ? undefined : activeId, form: buildPayload(), action: "save" }),
    });
    const data = (await res.json()) as { error?: string; id?: string };
    setSaving(false);
    if (!res.ok) {
      setError(formatApiError(data));
      return;
    }
    if (activeId === "new" && data.id) setActiveId(data.id);
    setSaveMessage("Draft saved. You can continue editing and publish when ready.");
    await load();
  }

  async function publish() {
    const payload = buildPayload();
    const check = validatePublishForm(payload);
    if (!check.ok) {
      setError(`Complete these before publishing:\n${check.message}`);
      return;
    }
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    let id = activeId;
    if (id === "new") {
      const draftRes = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form: payload, action: "save" }),
      });
      const draftData = (await draftRes.json()) as { id?: string; error?: string };
      if (!draftRes.ok || !draftData.id) {
        setSaving(false);
        setError(formatApiError(draftData) || "Save before publishing");
        return;
      }
      id = draftData.id;
      setActiveId(id);
    }
    const res = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, form: payload, action: "publish" }),
    });
    const data = (await res.json()) as { publishedUrl?: string; error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(formatApiError(data) || "Publish failed");
      return;
    }
    setSaveMessage("Published successfully.");
    await load();
    if (data.publishedUrl) {
      const path = data.publishedUrl.startsWith("/") ? data.publishedUrl : `/${data.publishedUrl}`;
      window.open(`${PRODUCTION_SITE_URL}${path}`, "_blank");
    }
  }

  async function deletePublished(slug: string) {
    if (
      !confirm(
        `Remove "${slug}" from the live site?\n\nThis deletes the published page from /projects, homepage Latest Projects, and architect portfolios. Built-in catalog projects (static) are not affected.`,
      )
    ) {
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/published-projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const data = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not delete project");
      return;
    }
    if (editingPublishedSlug === slug || slugPreview === slug) {
      if (activeId !== "new") selectRow(null);
      else setForm(emptyProjectPublishForm());
    }
    await load();
  }

  async function deleteDraft() {
    if (activeId === "new") return;
    const row = rows.find((r) => r.id === activeId);
    const label = row?.title ?? "this draft";
    if (row?.published_slug) {
      await deletePublished(row.published_slug);
      return;
    }
    if (!confirm(`Delete draft "${label}"? This cannot be undone.`)) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: activeId, action: "delete" }),
    });
    const data = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not delete draft");
      return;
    }
    selectRow(null);
    await load();
  }

  async function loadPublishedForEdit(slug: string) {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/published-projects?slug=${encodeURIComponent(slug)}`);
    const data = (await res.json()) as { project?: Record<string, unknown>; error?: string };
    setSaving(false);
    if (!res.ok || !data.project) {
      setError(data.error ?? "Could not load published project");
      return;
    }
    const row = data.project;
    const mapped = formFromPublishedRow({
      slug: String(row.slug),
      title: String(row.title),
      form_data: (row.form_data as Record<string, unknown>) ?? {},
      image_urls: Array.isArray(row.image_urls) ? (row.image_urls as string[]) : [],
      video_links: Array.isArray(row.video_links) ? (row.video_links as string[]) : [],
      hero_image_url: (row.hero_image_url as string | null) ?? null,
      location: (row.location as string | null) ?? null,
      category: (row.category as string | null) ?? null,
      excerpt: (row.excerpt as string | null) ?? null,
      content: (row.content as string | null) ?? null,
    });
    const linked = rows.find((r) => r.published_slug === slug);
    if (linked) {
      selectRow(linked);
    } else {
      setActiveId("new");
      setForm(mapped);
      const hero = mapped.coverImageUrl;
      setGalleryUrls((mapped.galleryUrls ?? []).filter((u) => u !== hero));
      setHeroReady(Boolean(hero));
      setVideoReady(Boolean(mapped.videoUrl));
      setFaqDraft(mapped.faq?.length ? mapped.faq : [{ question: "", answer: "" }]);
    }
    setWorkspaceTab("drafts");
    setSaveMessage(`Editing published project “${slug}”. Save draft, then publish to update the live page.`);
  }

  async function deleteArchitect(id: string) {
    if (!confirm("Remove this architect profile? Linked projects will be unlinked.")) return;
    setSaving(true);
    const res = await fetch("/api/admin/professionals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSaving(false);
    if (res.ok) {
      if (form.professionalId === id) {
        patch("architectMode", "new");
        patch("professionalId", "");
      }
      await load();
    } else setError("Could not remove architect");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-primary/15 pb-4">
        <button
          type="button"
          onClick={() => setWorkspaceTab("drafts")}
          className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
            workspaceTab === "drafts" ? "bg-primary text-white" : "border border-primary/25 text-primary"
          }`}
        >
          Drafts
        </button>
        <button
          type="button"
          onClick={() => setWorkspaceTab("published")}
          className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
            workspaceTab === "published" ? "bg-primary text-white" : "border border-primary/25 text-primary"
          }`}
        >
          Published projects
        </button>
      </div>

      {workspaceTab === "published" ? (
        <PublishedProjectsPanel
          draftRows={rows}
          onEditDraft={(id) => {
            const row = rows.find((r) => r.id === id);
            if (row) {
              setWorkspaceTab("drafts");
              selectRow(row);
            }
          }}
          onEditPublished={(slug) => void loadPublishedForEdit(slug)}
        />
      ) : null}

      {workspaceTab === "drafts" ? (
    <div className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <button
          type="button"
          onClick={() => selectRow(null)}
          className="w-full rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary"
        >
          + New project
        </button>
        {loading ? <p className="text-sm text-muted">Loading…</p> : null}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Drafts</p>
          {rows.map((row) => (
            <div
              key={row.id}
              className={`mb-2 rounded-lg border ${
                activeId === row.id ? "border-primary/40 bg-primary/5" : "border-primary/12 bg-white"
              }`}
            >
              <button type="button" onClick={() => selectRow(row)} className="w-full px-3 py-2 text-left text-sm">
                <p className="font-medium">{row.title}</p>
                <p className="text-[10px] uppercase text-muted">
                  {row.status === "pending" ? "draft" : row.status}
                  {row.published_slug ? " · live" : ""}
                </p>
              </button>
              {row.published_slug ? (
                <button
                  type="button"
                  className="w-full border-t border-primary/8 px-3 py-1.5 text-left text-[10px] uppercase tracking-[0.1em] text-red-700"
                  onClick={() => void deletePublished(row.published_slug!)}
                >
                  Unpublish
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </aside>

      <div className="space-y-6">
        {error ? (
          <p className="whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </p>
        ) : null}
        {saveMessage ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {saveMessage}
          </p>
        ) : null}

        <Section
          title="Publish URL"
          hint="Matches production: /projects/designer-directory-hospitality-interiors — used on Projects grid, Latest Projects, and architect profile."
        >
          <p className="rounded-lg bg-primary/5 px-4 py-3 font-mono text-sm text-primary break-all">{publishUrl}</p>
          <Field label="Custom slug (optional)" hint="Leave blank to auto-generate from project name.">
            <input className={input} value={form.slug ?? ""} onChange={(e) => patch("slug", e.target.value)} placeholder={slugPreview} />
          </Field>
        </Section>

        <Section title="Architect" hint="Maps to Professionals — search existing studios or create a new firm profile.">
          <ArchitectPicker
            label="Studio"
            hint={`${architectOptions.length} profiles (database + site directory).`}
            value={architectSelectValue}
            options={architectSelectOptions}
            onChange={selectArchitect}
          />
          <MediaUploadPanel
            label="Architect profile photo"
            hint="Square image on /professionals/[slug] — upload or paste URL; saved when you publish."
            mode="single"
            previewUrls={form.professionalImageUrl ? [form.professionalImageUrl] : []}
            uploading={uploadingProfessionalImage}
            uploadError={professionalImageUploadError}
            urlValue={professionalImageUrlInput}
            onUrlChange={setProfessionalImageUrlInput}
            onAddUrl={() => void importUrl(professionalImageUrlInput, "professional")}
            onUpload={(files) => void uploadFiles(files, "professional")}
            onRemove={() => patch("professionalImageUrl", "")}
          />
          {form.architectMode === "new" ? (
            <>
              <Field label="Firm name">
                <input className={input} value={form.architectureFirm} onChange={(e) => patch("architectureFirm", e.target.value)} />
              </Field>
              <Field label="Lead architect">
                <input className={input} value={form.leadArchitect} onChange={(e) => patch("leadArchitect", e.target.value)} />
              </Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Website">
                  <input className={input} value={form.professionalSocials?.website ?? ""} onChange={(e) => patchSocial("website", e.target.value)} />
                </Field>
                <Field label="Instagram">
                  <input className={input} value={form.professionalSocials?.instagram ?? ""} onChange={(e) => patchSocial("instagram", e.target.value)} />
                </Field>
                <Field label="Facebook">
                  <input className={input} value={form.professionalSocials?.facebook ?? ""} onChange={(e) => patchSocial("facebook", e.target.value)} />
                </Field>
                <Field label="YouTube">
                  <input className={input} value={form.professionalSocials?.youtube ?? ""} onChange={(e) => patchSocial("youtube", e.target.value)} />
                </Field>
              </div>
            </>
          ) : (
            <>
              <Field label="Firm (from profile)">
                <input className={input} value={form.architectureFirm} readOnly />
              </Field>
              <Field label="Lead">
                <input className={input} value={form.leadArchitect} onChange={(e) => patch("leadArchitect", e.target.value)} />
              </Field>
              {form.professionalId ? (
                <button
                  type="button"
                  className="text-xs uppercase tracking-[0.12em] text-red-700"
                  onClick={() => void deleteArchitect(form.professionalId!)}
                >
                  Remove architect profile
                </button>
              ) : null}
            </>
          )}
        </Section>

        <Section title="Page header" hint="Top of project page — breadcrumb category, title, meta line.">
          <Field label="Project title (H1)">
            <input className={input} value={form.projectName} onChange={(e) => patch("projectName", e.target.value)} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Category">
              <select className={input} value={form.category} onChange={(e) => patch("category", e.target.value)}>
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Project type">
              <select className={input} value={form.projectType} onChange={(e) => patch("projectType", e.target.value)}>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Build details sidebar" hint="Left column on the live page.">
          <div className="grid gap-4 md:grid-cols-2">
            <LocationCombobox
              label="Location"
              hint="Search city, state, or country from the site geo map."
              value={form.projectLocation ?? ""}
              onChange={(v) => patch("projectLocation", v)}
            />
            <Field label="Area">
              <input className={input} value={form.grossBuiltArea ?? ""} onChange={(e) => patch("grossBuiltArea", e.target.value)} placeholder="Approx. 1,174 m²" />
            </Field>
            <Field label="Year">
              <input className={input} value={form.completionYear ?? ""} onChange={(e) => patch("completionYear", e.target.value)} />
            </Field>
          </div>
          <Field label="Manufacturers">
            <textarea className={`${input} min-h-[72px]`} value={form.manufacturers ?? ""} onChange={(e) => patch("manufacturers", e.target.value)} />
          </Field>
          <Field label="Climate strategy">
            <input className={input} value={form.climateStrategy ?? ""} onChange={(e) => patch("climateStrategy", e.target.value)} />
          </Field>
          <Field label="Primary materials">
            <input className={input} value={form.primaryMaterials ?? ""} onChange={(e) => patch("primaryMaterials", e.target.value)} />
          </Field>
          <Field label="Imagery note">
            <input className={input} value={form.imageryNote ?? ""} onChange={(e) => patch("imageryNote", e.target.value)} />
          </Field>
        </Section>

        <Section title="Editorial body" hint="Italic dek + narrative paragraphs (blank line = new paragraph).">
          <Field label="Lead paragraph (dek)">
            <textarea className={`${input} min-h-[80px] font-serif italic`} value={form.dek} onChange={(e) => patch("dek", e.target.value)} />
          </Field>
          <Field label="Full narrative">
            <textarea className={`${input} min-h-[220px]`} value={form.narrative} onChange={(e) => patch("narrative", e.target.value)} />
          </Field>
        </Section>

        <Section title="Media" hint="Hero appears on the project page and grid card. Gallery fills Visual study (up to 25).">
          <MediaUploadPanel
            label="Hero image"
            hint="Required before publish · full-width on detail page + thumbnail on /projects"
            mode="single"
            previewUrls={form.coverImageUrl ? [form.coverImageUrl] : []}
            uploading={uploadingHero}
            uploadError={heroUploadError}
            urlValue={heroUrlInput}
            onUrlChange={setHeroUrlInput}
            onAddUrl={() => void importUrl(heroUrlInput, "hero")}
            onUpload={(files) => void uploadFiles(files, "hero")}
            onRemove={() => {
              patch("coverImageUrl", "");
              setHeroReady(false);
            }}
          />
          <MediaUploadPanel
            label="Visual study gallery"
            hint="Optional · up to 25 images on the project page"
            mode="gallery"
            maxCount={25}
            previewUrls={galleryUrls}
            uploading={uploadingGallery}
            uploadError={galleryUploadError}
            urlValue={galleryUrlInput}
            onUrlChange={setGalleryUrlInput}
            onAddUrl={() => void importUrl(galleryUrlInput, "gallery")}
            onUpload={(files) => void uploadFiles(files, "gallery")}
            onRemove={(i) => setGalleryUrls((prev) => prev.filter((_, j) => j !== i))}
          />
        </Section>

        <Section title="Film & walkthrough (optional)">
          <Field label="YouTube or video URL">
            <div className="flex gap-2">
              <input
                className={input}
                value={form.videoUrl ?? ""}
                onChange={(e) => {
                  patch("videoUrl", e.target.value);
                  setVideoReady(false);
                }}
                placeholder="https://www.youtube.com/watch?v=…"
              />
              <button
                type="button"
                className="shrink-0 rounded-full border border-primary/25 px-4 py-2 text-xs uppercase tracking-[0.1em]"
                disabled={importingVideo || !(form.videoUrl ?? "").trim()}
                onClick={() => void importVideoUrl(form.videoUrl ?? "")}
              >
                {importingVideo ? "…" : "Add URL"}
              </button>
            </div>
          </Field>
          {form.videoUrl && (videoThumb || videoReady) ? (
            <div className="relative aspect-video max-w-lg overflow-hidden rounded-lg border border-emerald-600/30">
              {videoThumb ? (
                <Image src={videoThumb} alt="Video preview" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full min-h-[180px] items-center justify-center bg-charcoal/5 text-sm text-muted">
                  Video URL saved
                </div>
              )}
              {videoReady ? (
                <span className="absolute left-2 top-2 rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                  Linked
                </span>
              ) : null}
            </div>
          ) : null}
        </Section>

        <Section title="Questions & answers">
          {faqDraft.map((item, i) => (
            <div key={i} className="space-y-2 border-t border-primary/8 pt-3 first:border-0 first:pt-0">
              <input
                className={input}
                placeholder="Question"
                value={item.question}
                onChange={(e) => setFaqDraft((prev) => prev.map((f, j) => (j === i ? { ...f, question: e.target.value } : f)))}
              />
              <textarea
                className={`${input} min-h-[72px]`}
                placeholder="Answer"
                value={item.answer}
                onChange={(e) => setFaqDraft((prev) => prev.map((f, j) => (j === i ? { ...f, answer: e.target.value } : f)))}
              />
            </div>
          ))}
          <button type="button" className="text-xs uppercase tracking-[0.12em] text-primary" onClick={() => setFaqDraft((p) => [...p, { question: "", answer: "" }])}>
            + Add Q&amp;A
          </button>
        </Section>

        <section className="rounded-xl border border-primary/12 bg-primary/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Workflow</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-charcoal/85">
            <li>Save draft (project title is enough to start)</li>
            <li>Upload hero — wait for green &quot;Ready&quot; preview (AVIF, PNG, JPEG)</li>
            <li>Complete copy, architect, and build details</li>
            <li>Publish — live on /projects, homepage Latest Projects, and architect profile</li>
          </ol>
          {(() => {
            const check = validatePublishForm(buildPayload());
            return check.ok ? (
              <p className="mt-3 text-xs font-medium text-emerald-800">Ready to publish.</p>
            ) : (
              <p className="mt-3 whitespace-pre-wrap text-xs text-muted">Before publish: {check.message}</p>
            );
          })()}
        </section>

        <div className="flex flex-wrap gap-2 border-t border-primary/10 pt-6">
          <button type="button" disabled={saving} onClick={() => void saveDraft()} className="rounded-full border border-primary/25 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em]">
            Save draft
          </button>
          <button type="button" disabled={saving} onClick={() => void publish()} className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
            Publish to projects
          </button>
          {editingPublishedSlug ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void deletePublished(editingPublishedSlug)}
              className="rounded-full border border-red-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-800"
            >
              Unpublish & delete
            </button>
          ) : null}
          {activeId !== "new" && !editingPublishedSlug ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void deleteDraft()}
              className="rounded-full border border-red-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-800"
            >
              Delete draft
            </button>
          ) : null}
          {published.some((p) => p.slug === slugPreview) && !editingPublishedSlug ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void deletePublished(slugPreview)}
              className="rounded-full border border-red-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-800"
            >
              Delete published slug
            </button>
          ) : null}
          {activeId !== "new" ? (
            <a href={`/admin/submissions/preview?id=${activeId}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-primary/25 px-5 py-2 text-xs uppercase tracking-[0.12em]">
              Preview
            </a>
          ) : null}
        </div>
      </div>
    </div>
      ) : null}
    </div>
  );
}
