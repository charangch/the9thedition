"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  label: string;
  hint?: string;
  mode: "single" | "gallery";
  previewUrls: string[];
  maxCount?: number;
  uploading?: boolean;
  uploadError?: string | null;
  urlValue: string;
  onUrlChange: (value: string) => void;
  onAddUrl: () => void;
  onUpload: (files: FileList | null) => void;
  onRemove?: (index: number) => void;
  accept?: string;
};

export function MediaUploadPanel({
  label,
  hint,
  mode,
  previewUrls,
  maxCount = 25,
  uploading = false,
  uploadError = null,
  urlValue,
  onUrlChange,
  onAddUrl,
  onUpload,
  onRemove,
  accept = "image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,.jpg,.jpeg,.png,.webp,.gif,.avif",
}: Props) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [localUrls, setLocalUrls] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      localUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [localUrls]);

  useEffect(() => {
    if (!previewUrls.length) return;
    setLocalUrls((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return [];
    });
  }, [previewUrls]);

  const displayUrls = previewUrls.length > 0 ? previewUrls : localUrls;
  const atGalleryLimit = mode === "gallery" && displayUrls.length >= maxCount;

  function handlePick(files: FileList | null) {
    if (!files?.length) return;
    const picked = Array.from(files);
    const blobs = picked.map((f) => URL.createObjectURL(f));
    setLocalUrls((prev) => {
      if (mode === "single") {
        prev.forEach((u) => URL.revokeObjectURL(u));
        return [blobs[0]!];
      }
      return [...prev, ...blobs].slice(0, maxCount);
    });
    onUpload(files);
  }

  return (
    <div className="rounded-xl border border-dashed border-primary/25 bg-gradient-to-b from-white to-primary/[0.03] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal">{label}</p>
          {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
        </div>
        {mode === "gallery" ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
            {displayUrls.length} / {maxCount}
          </span>
        ) : null}
      </div>

      {uploadError ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{uploadError}</p>
      ) : null}

      {displayUrls.length > 0 ? (
        <div
          className={
            mode === "single"
              ? "relative mt-4 aspect-[16/10] max-w-lg overflow-hidden rounded-lg border border-emerald-600/35 bg-charcoal/5 shadow-sm"
              : "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
          }
        >
          {displayUrls.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className={
                mode === "single"
                  ? "relative h-full min-h-[200px] w-full"
                  : "relative aspect-[4/3] overflow-hidden rounded-lg border border-emerald-600/25 bg-charcoal/5"
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <span className="absolute left-2 top-2 rounded-full bg-emerald-700 px-2 py-0.5 text-[9px] font-semibold uppercase text-white">
                {uploading && !previewUrls.length ? "Uploading…" : "Ready"}
              </span>
              {onRemove ? (
                <button
                  type="button"
                  aria-label="Remove image"
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-sm text-charcoal shadow"
                  onClick={() => onRemove(i)}
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || atGalleryLimit}
          className="mt-4 flex w-full flex-col items-center justify-center rounded-lg border border-primary/15 bg-white py-10 text-center transition hover:border-primary/35 hover:bg-primary/[0.02] disabled:opacity-60"
        >
          <span className="text-2xl text-primary/70">↑</span>
          <span className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal">
            {uploading ? "Uploading…" : "Choose files"}
          </span>
          <span className="mt-1 max-w-xs text-[11px] text-muted">JPEG, PNG, WebP, GIF, AVIF · max 25 MB</span>
        </button>
      )}

      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={mode === "gallery"}
        className="sr-only"
        disabled={uploading || atGalleryLimit}
        onChange={(e) => handlePick(e.target.files)}
      />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          className="min-w-0 flex-1 rounded-lg border border-primary/20 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
          placeholder="Or paste image URL (https://…)"
          value={urlValue}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddUrl();
            }
          }}
        />
        <button
          type="button"
          disabled={uploading || !urlValue.trim() || atGalleryLimit}
          onClick={onAddUrl}
          className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50"
        >
          {uploading ? "…" : "Add from URL"}
        </button>
      </div>

      {displayUrls.length > 0 ? (
        <button
          type="button"
          className="mt-3 text-[11px] uppercase tracking-[0.12em] text-primary"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || atGalleryLimit}
        >
          + Add more files
        </button>
      ) : null}
    </div>
  );
}
