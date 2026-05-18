const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
};

export function extensionFromFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? name;
  const idx = base.lastIndexOf(".");
  return idx >= 0 ? base.slice(idx + 1).toLowerCase() : "";
}

/** Browsers often send an empty type for AVIF/HEIC — infer from filename. */
export function resolveImageMime(file: Blob, filename?: string): string {
  const type = (file.type ?? "").trim().toLowerCase();
  if (type && type !== "application/octet-stream") return type;
  const name = filename ?? (file instanceof File ? file.name : "");
  const ext = extensionFromFilename(name);
  return EXT_TO_MIME[ext] ?? type ?? "application/octet-stream";
}

export function isAllowedImageUpload(file: Blob, filename?: string): boolean {
  const mime = resolveImageMime(file, filename);
  if (mime.startsWith("image/")) return true;
  const ext = extensionFromFilename(filename ?? (file instanceof File ? file.name : ""));
  return ext in EXT_TO_MIME;
}

export function extensionForImageMime(mime: string, filename?: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/gif") return "gif";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  if (mime === "image/heic" || mime === "image/heif") return "heic";
  const ext = extensionFromFilename(filename ?? "");
  if (ext) return ext === "jpeg" ? "jpg" : ext;
  return "jpg";
}
