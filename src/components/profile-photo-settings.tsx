"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";

type Props = {
  displayName: string;
  resolvedAvatarUrl: string | null;
  oauthAvatarUrl: string | null;
  oauthAvatarProviderLabel: string;
  hasCustomAvatar: boolean;
};

export function ProfilePhotoSettings({
  displayName,
  resolvedAvatarUrl,
  oauthAvatarUrl,
  oauthAvatarProviderLabel,
  hasCustomAvatar,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function preprocessAvatar(file: File): Promise<File> {
    const srcUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Could not read image."));
        el.src = srcUrl;
      });
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = Math.max(0, Math.floor((img.naturalWidth - side) / 2));
      const sy = Math.max(0, Math.floor((img.naturalHeight - side) / 2));
      const target = 512;
      const canvas = document.createElement("canvas");
      canvas.width = target;
      canvas.height = target;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, target, target);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.88),
      );
      if (!blob) return file;
      return new File([blob], `avatar-${Date.now()}.webp`, { type: "image/webp" });
    } finally {
      URL.revokeObjectURL(srcUrl);
    }
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPending(true);
    setMessage(null);
    try {
      const processed = await preprocessAvatar(file);
      const fd = new FormData();
      fd.set("file", processed);
      const res = await fetch("/api/me/avatar", { method: "POST", body: fd });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Upload failed.");
        return;
      }
      router.refresh();
    } catch {
      setMessage("Network error while uploading.");
    } finally {
      setPending(false);
    }
  }

  async function removeCustom() {
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/me/avatar", { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Could not remove photo.");
        return;
      }
      router.refresh();
    } catch {
      setMessage("Network error.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8 max-w-lg rounded-xl border border-primary/15 bg-white p-5">
      <h3 className="font-serif text-lg text-charcoal">Profile photo</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        We show your photo from Google, Apple, or LinkedIn when you sign in with that provider. You can
        also upload an image from your device—it replaces what we show until you remove it.
      </p>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="shrink-0">
          {resolvedAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedAvatarUrl}
              alt=""
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/15"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 font-serif text-2xl font-semibold text-primary ring-2 ring-primary/15">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            aria-label="Upload profile photo"
            disabled={pending}
            onChange={(ev) => void onFile(ev)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Working…" : "Upload from device"}
            </button>
            {hasCustomAvatar ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => void removeCustom()}
                className="rounded-lg border border-charcoal/20 px-4 py-2 text-sm font-medium text-charcoal/90 hover:bg-charcoal/[0.04] disabled:opacity-60"
              >
                Remove uploaded photo
              </button>
            ) : null}
          </div>
          {oauthAvatarUrl && !hasCustomAvatar ? (
            <p className="text-xs text-muted">
              Currently using your {oauthAvatarProviderLabel} profile photo.
            </p>
          ) : null}
          {hasCustomAvatar && oauthAvatarUrl ? (
            <p className="text-xs text-muted">Showing your uploaded image instead of your provider photo.</p>
          ) : null}
          {message ? <p className="text-sm text-amber-900">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
