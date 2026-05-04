"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { countWords, type SubmissionFormData } from "@/lib/submission-template";

type ImageItem = {
  id: string;
  url: string;
  caption: string;
  progress: number;
  uploading: boolean;
};

const SUBMIT_DRAFT_KEY = "t9e_submit_form_draft_v1";

export function SubmitForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SubmissionFormData>({
    projectName: "",
    architectureFirm: "",
    website: "",
    contactEmail: "",
    firmLocation: "",
    isCompetitionEntry: false,
    competitionName: "",
    competitionWebsite: "",
    willBeRealized: "unknown",
    completionYear: "",
    grossBuiltArea: "",
    projectLocation: "",
    leadArchitects: "",
    leadArchitectsEmail: "",
    renderCredits: "",
    videoLink: "",
    designTeam: "",
    clients: "",
    engineering: "",
    landscape: "",
    consultants: "",
    collaborators: "",
    additionalCreditsEtc: "",
    shortText: "",
    longText: "",
    coverImageUrl: "",
  });
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [videoLinksText, setVideoLinksText] = useState("");
  const [externalLinksText, setExternalLinksText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isDropActive, setIsDropActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(SUBMIT_DRAFT_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as {
          formData?: Partial<SubmissionFormData>;
          images?: ImageItem[];
          videoLinksText?: string;
          externalLinksText?: string;
        };
        if (parsed.formData) {
          setFormData((prev) => ({ ...prev, ...parsed.formData }));
        }
        if (Array.isArray(parsed.images)) {
          setImageItems(
            parsed.images.map((img, i) => ({
              id: img.id || `restored-${i}`,
              url: img.url,
              caption: img.caption ?? "",
              progress: 100,
              uploading: false,
            })),
          );
        }
        if (typeof parsed.videoLinksText === "string") setVideoLinksText(parsed.videoLinksText);
        if (typeof parsed.externalLinksText === "string") setExternalLinksText(parsed.externalLinksText);
      } catch {
        /* ignore */
      }
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        SUBMIT_DRAFT_KEY,
        JSON.stringify({
          formData,
          images: imageItems.map((x) => ({
            id: x.id,
            url: x.url,
            caption: x.caption,
          })),
          videoLinksText,
          externalLinksText,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [formData, imageItems, videoLinksText, externalLinksText]);

  function set<K extends keyof SubmissionFormData>(key: K, value: SubmissionFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    const selected = Array.from(files);
    if (selected.length + imageItems.length > 25) {
      setMessage("Upload up to 25 images at once.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setMessage("Uploading images...");

    const pending = selected.map((_, i) => ({
      id: `upload-${Date.now()}-${i}`,
      url: "",
      caption: "",
      progress: 5,
      uploading: true,
    }));
    setImageItems((prev) => [...prev, ...pending]);

    try {
      const created: ImageItem[] = [];
      for (let i = 0; i < selected.length; i += 1) {
        const file = selected[i]!;
        const id = pending[i]!.id;
        setImageItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, progress: 20 } : item)),
        );

        const fd = new FormData();
        fd.append("files", file);
        const res = await fetch("/api/submissions/media", { method: "POST", body: fd });
        const data = (await res.json()) as { error?: string; urls?: string[] };
        if (!res.ok || !data.urls?.[0]) {
          setStatus("error");
          setMessage(data.error ?? "Image upload failed.");
          setImageItems((prev) => prev.filter((it) => !pending.some((p) => p.id === it.id)));
          return;
        }
        const url = data.urls[0];
        created.push({
          id,
          url,
          caption: "",
          progress: 100,
          uploading: false,
        });
        setImageItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, url, progress: 100, uploading: false }
              : item,
          ),
        );
      }

      if (!formData.coverImageUrl && created[0]?.url) {
        set("coverImageUrl", created[0].url);
      }
      setStatus("idle");
      setMessage(`Uploaded ${created.length} image(s).`);
    } catch {
      setStatus("error");
      setMessage("Network error while uploading images.");
      setImageItems((prev) => prev.filter((it) => !pending.some((p) => p.id === it.id)));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const shortWords = countWords(formData.shortText);
    const longWords = countWords(formData.longText);
    if (shortWords > 80) {
      setStatus("error");
      setMessage("Short text must be 80 words or fewer.");
      return;
    }
    if (longWords < 200 || longWords > 500) {
      setStatus("error");
      setMessage("Long text must be between 200 and 500 words.");
      return;
    }

    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "project",
          formData,
          imageUrls: imageItems.map((img) => img.url).filter(Boolean),
          imageCaptions: imageItems.map((img) => img.caption),
          videoLinks: videoLinksText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          externalLinks: externalLinksText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(typeof data.error === "string" ? data.error : "Submit failed");
        return;
      }
      setStatus("done");
      setMessage("Submitted for review. An editor will see it in the admin queue.");
      setImageItems([]);
      setVideoLinksText("");
      setExternalLinksText("");
      setFormData((prev) => ({ ...prev, coverImageUrl: "" }));
      try {
        localStorage.removeItem(SUBMIT_DRAFT_KEY);
      } catch {
        /* ignore */
      }
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Network error.");
    }
  }

  function removeImage(id: string) {
    setImageItems((prev) => {
      const next = prev.filter((u) => u.id !== id);
      const removed = prev.find((x) => x.id === id);
      if (removed && formData.coverImageUrl === removed.url) {
        set("coverImageUrl", next[0]?.url ?? "");
      }
      return next;
    });
  }

  function moveImage(from: number, to: number) {
    setImageItems((prev) => {
      if (from < 0 || from >= prev.length || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function onDropUpload(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDropActive(false);
    void uploadImages(e.dataTransfer.files);
  }

  const shortWords = countWords(formData.shortText);
  const longWords = countWords(formData.longText);
  const shortWordsOk = shortWords <= 80;
  const longWordsOk = longWords >= 200 && longWords <= 500;
  const canSubmitWordRules = shortWordsOk && longWordsOk;
  const orderedImages = useMemo(() => imageItems, [imageItems]);

  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmit}>
      <h2 className="font-serif text-2xl text-charcoal">Project Submission Form</h2>
      <p className="text-sm text-muted">
        Thanks for submitting your project. Please complete each section carefully for editorial review.
      </p>

      <div className="rounded-xl border border-primary/15 bg-surface p-4 space-y-3">
        <h3 className="font-semibold text-charcoal">General Information</h3>
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Project Name" value={formData.projectName} onChange={(e)=>set("projectName", e.target.value)} required />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Architecture Firm" value={formData.architectureFirm} onChange={(e)=>set("architectureFirm", e.target.value)} required />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Website" value={formData.website ?? ""} onChange={(e)=>set("website", e.target.value)} />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Contact e-mail" type="email" value={formData.contactEmail} onChange={(e)=>set("contactEmail", e.target.value)} required />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Firm Location" value={formData.firmLocation} onChange={(e)=>set("firmLocation", e.target.value)} required />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.isCompetitionEntry} onChange={(e)=>set("isCompetitionEntry", e.target.checked)} /> Is your project a competition entry?</label>
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Competition name" value={formData.competitionName ?? ""} onChange={(e)=>set("competitionName", e.target.value)} />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Competition website" value={formData.competitionWebsite ?? ""} onChange={(e)=>set("competitionWebsite", e.target.value)} />
        <select className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" value={formData.willBeRealized} onChange={(e)=>set("willBeRealized", e.target.value as "yes"|"no"|"unknown")}>
          <option value="unknown">Will your project be realized?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="unknown">Unknown</option>
        </select>
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Completion Year (if applies)" value={formData.completionYear ?? ""} onChange={(e)=>set("completionYear", e.target.value)} />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Gross Built Area" value={formData.grossBuiltArea ?? ""} onChange={(e)=>set("grossBuiltArea", e.target.value)} />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Project location" value={formData.projectLocation} onChange={(e)=>set("projectLocation", e.target.value)} required />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Lead Architects" value={formData.leadArchitects} onChange={(e)=>set("leadArchitects", e.target.value)} required />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Lead Architects e-mail" type="email" value={formData.leadArchitectsEmail} onChange={(e)=>set("leadArchitectsEmail", e.target.value)} required />
      </div>

      <div className="rounded-xl border border-primary/15 bg-surface p-4 space-y-3">
        <h3 className="font-semibold text-charcoal">Media Provider</h3>
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Renderings credits" value={formData.renderCredits ?? ""} onChange={(e)=>set("renderCredits", e.target.value)} />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Video link" value={formData.videoLink ?? ""} onChange={(e)=>set("videoLink", e.target.value)} />
        <label className="block text-sm text-charcoal/80">Upload up to 25 images</label>
        <div
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDropActive(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDropActive(false);
          }}
          onDrop={onDropUpload}
          className={`rounded-xl border-2 border-dashed p-5 transition ${
            isDropActive ? "border-primary bg-primary/10" : "border-primary/35 bg-white"
          }`}
        >
          <p className="text-sm font-medium text-charcoal">Drop images here</p>
          <p className="mt-1 text-xs text-muted">JPG, PNG, WebP, GIF · Max 25 files · 10MB each</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
            >
              Browse files
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal"
            >
              Add more
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void uploadImages(e.target.files)}
          />
        </div>
        {orderedImages.length ? (
          <div className="space-y-2">
            <p className="text-xs text-muted">
              {orderedImages.length} image(s) uploaded. Drag cards to reorder the sequence.
            </p>
            <ul className="columns-1 gap-3 sm:columns-2 lg:columns-3">
              {orderedImages.map((item, i) => (
                <li
                  key={item.id}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null) moveImage(dragIndex, i);
                    setDragIndex(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.altKey && e.key === "ArrowUp") {
                      e.preventDefault();
                      moveImage(i, Math.max(0, i - 1));
                    }
                    if (e.altKey && e.key === "ArrowDown") {
                      e.preventDefault();
                      moveImage(i, Math.min(orderedImages.length - 1, i + 1));
                    }
                  }}
                  tabIndex={0}
                  className="mb-3 break-inside-avoid rounded-lg border border-primary/20 bg-white p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url || "/favicon.ico"}
                    alt={`Submission image ${i + 1}`}
                    className="h-auto w-full rounded object-cover"
                  />
                  <div className="mt-2 h-1.5 w-full rounded bg-charcoal/10">
                    <div
                      className="h-1.5 rounded bg-primary transition-all"
                      style={{ width: `${Math.max(5, item.progress)}%` }}
                    />
                  </div>
                  <input
                    type="text"
                    value={item.caption}
                    onChange={(e) =>
                      setImageItems((prev) =>
                        prev.map((it) => (it.id === item.id ? { ...it, caption: e.target.value } : it)),
                      )
                    }
                    placeholder="Image caption (optional)"
                    className="mt-2 w-full rounded border border-primary/20 px-2 py-1.5 text-xs"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-charcoal/5 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                      #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => set("coverImageUrl", item.url)}
                      className={`rounded px-2 py-1 text-xs ${
                        formData.coverImageUrl === item.url
                          ? "bg-primary text-white"
                          : "border border-primary/25 text-primary"
                      }`}
                    >
                      {formData.coverImageUrl === item.url ? "Cover image" : "Set as cover"}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(i, Math.max(0, i - 1))}
                      className="rounded border border-primary/25 px-2 py-1 text-xs text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      aria-label={`Move image ${i + 1} up`}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(i, Math.min(orderedImages.length - 1, i + 1))}
                      className="rounded border border-primary/25 px-2 py-1 text-xs text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      aria-label={`Move image ${i + 1} down`}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-primary/15 bg-surface p-4 space-y-3">
        <h3 className="font-semibold text-charcoal">Additional Credits</h3>
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Design Team" value={formData.designTeam ?? ""} onChange={(e)=>set("designTeam", e.target.value)} />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Clients" value={formData.clients ?? ""} onChange={(e)=>set("clients", e.target.value)} />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Engineering" value={formData.engineering ?? ""} onChange={(e)=>set("engineering", e.target.value)} />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Landscape" value={formData.landscape ?? ""} onChange={(e)=>set("landscape", e.target.value)} />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Consultants" value={formData.consultants ?? ""} onChange={(e)=>set("consultants", e.target.value)} />
        <input className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Collaborators" value={formData.collaborators ?? ""} onChange={(e)=>set("collaborators", e.target.value)} />
        <textarea className="h-20 w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Etc..." value={formData.additionalCreditsEtc ?? ""} onChange={(e)=>set("additionalCreditsEtc", e.target.value)} />
      </div>

      <div className="rounded-xl border border-primary/15 bg-surface p-4 space-y-3">
        <h3 className="font-semibold text-charcoal">Project Description</h3>
        <textarea className="h-24 w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Short text (up to 80 words)" value={formData.shortText} onChange={(e)=>set("shortText", e.target.value)} required />
        <p className={`text-xs ${shortWordsOk ? "text-muted" : "text-red-700"}`}>Short text words: {shortWords}/80</p>
        <textarea className="h-40 w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm" placeholder="Long text (200 - 500 words)" value={formData.longText} onChange={(e)=>set("longText", e.target.value)} required />
        <p className={`text-xs ${longWordsOk ? "text-muted" : "text-red-700"}`}>Long text words: {longWords}/200-500</p>
      </div>

      <div className="rounded-xl border border-primary/15 bg-surface p-4 space-y-3">
        <h3 className="font-semibold text-charcoal">Links</h3>
        <textarea
          className="h-24 w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm"
          placeholder="Video links (one per line)"
          value={videoLinksText}
          onChange={(e) => setVideoLinksText(e.target.value)}
        />
        <textarea
          className="h-24 w-full rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm"
          placeholder="External links (one per line)"
          value={externalLinksText}
          onChange={(e) => setExternalLinksText(e.target.value)}
        />
      </div>

      {message && (
        <p
          className={`text-sm ${status === "error" ? "text-red-700" : "text-primary"}`}
        >
          {message}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(
                SUBMIT_DRAFT_KEY,
                JSON.stringify({
                  formData,
                  images: imageItems.map((x) => ({ id: x.id, url: x.url, caption: x.caption })),
                  videoLinksText,
                  externalLinksText,
                }),
              );
              setMessage("Draft saved locally on this device.");
              setStatus("idle");
            } catch {
              setMessage("Could not save draft locally.");
              setStatus("error");
            }
          }}
          className="rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.removeItem(SUBMIT_DRAFT_KEY);
            } catch {
              /* ignore */
            }
            setImageItems([]);
            setVideoLinksText("");
            setExternalLinksText("");
            setFormData({
              projectName: "",
              architectureFirm: "",
              website: "",
              contactEmail: "",
              firmLocation: "",
              isCompetitionEntry: false,
              competitionName: "",
              competitionWebsite: "",
              willBeRealized: "unknown",
              completionYear: "",
              grossBuiltArea: "",
              projectLocation: "",
              leadArchitects: "",
              leadArchitectsEmail: "",
              renderCredits: "",
              videoLink: "",
              designTeam: "",
              clients: "",
              engineering: "",
              landscape: "",
              consultants: "",
              collaborators: "",
              additionalCreditsEtc: "",
              shortText: "",
              longText: "",
              coverImageUrl: "",
            });
            setStatus("idle");
            setMessage("Draft cleared.");
          }}
          className="rounded-full border border-red-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-700"
        >
          Clear Draft
        </button>
      </div>
      <button
        type="submit"
        disabled={status === "loading" || !canSubmitWordRules}
        className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60"
      >
        {status === "loading" ? "Submitting…" : "Submit for Review"}
      </button>
    </form>
  );
}
