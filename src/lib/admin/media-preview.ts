/** YouTube / Vimeo thumbnail for admin video preview. */
export function videoPreviewImage(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const yt =
    trimmed.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([\w-]{6,})/i) ??
    trimmed.match(/youtube\.com\/shorts\/([\w-]{6,})/i);
  if (yt?.[1]) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;

  const vimeo = trimmed.match(/vimeo\.com\/(\d+)/i);
  if (vimeo?.[1]) return `https://vumbnail.com/${vimeo[1]}.jpg`;

  return null;
}

export function isYoutubeOrVimeo(url: string): boolean {
  return Boolean(videoPreviewImage(url));
}
