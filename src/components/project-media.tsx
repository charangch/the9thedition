import Image from "next/image";

/**
 * Optional admin/client-supplied media for project detail pages.
 * YouTube / Vimeo / direct MP4 supported for video.
 */

function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const embed = u.pathname.match(/\/embed\/([^/]+)/);
      if (embed?.[1]) return `https://www.youtube.com/embed/${embed[1]}`;
      const short = u.pathname.match(/\/shorts\/([^/]+)/);
      if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}

function vimeoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (!u.hostname.includes("vimeo.com")) return null;
    const m = u.pathname.match(/\/(?:video\/)?(\d+)/);
    return m?.[1] ? `https://player.vimeo.com/video/${m[1]}` : null;
  } catch {
    return null;
  }
}

function isDirectVideo(url: string): boolean {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  return /\.(mp4|webm|ogg)$/i.test(path);
}

type VideoProps = {
  url: string;
  title: string;
  caption?: string;
};

export function ProjectVideoBlock({ url, title, caption }: VideoProps) {
  const trimmed = url.trim();
  const yt = youtubeEmbedUrl(trimmed);
  const vm = vimeoEmbedUrl(trimmed);
  const embedSrc = yt ?? vm;

  return (
    <section className="mt-12" aria-labelledby="project-video-heading">
      <h2 id="project-video-heading" className="font-serif text-2xl text-charcoal">
        Film & walkthrough
      </h2>
      {caption ? <p className="mt-2 text-sm text-muted">{caption}</p> : null}
      <div className="mt-4 overflow-hidden rounded-xl border border-charcoal/10 bg-charcoal/5 shadow-sm">
        {embedSrc ? (
          <div className="relative aspect-video w-full">
            <iframe
              title={title}
              src={embedSrc}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : isDirectVideo(trimmed) ? (
          <video className="w-full" controls playsInline preload="metadata">
            <source src={trimmed} />
            Your browser does not support embedded video.
          </video>
        ) : (
          <div className="p-6 text-sm text-muted">
            <p>Video URL could not be embedded. Open it directly:</p>
            <a
              href={trimmed}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-medium text-primary underline-offset-4 hover:underline"
            >
              {trimmed}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

type PdfProps = {
  url: string;
  label: string;
  projectTitle: string;
};

export function ProjectPdfBlock({ url, label, projectTitle }: PdfProps) {
  const trimmed = url.trim();
  return (
    <section className="mt-12" aria-labelledby="project-pdf-heading">
      <h2 id="project-pdf-heading" className="font-serif text-2xl text-charcoal">
        Documents
      </h2>
      <p className="mt-2 text-sm text-muted">
        Download or view the project PDF (drawings, press kit, or specifications).
      </p>
      <div className="mt-4 rounded-xl border border-charcoal/10 bg-cream/30 p-4">
        <a
          href={trimmed}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
        >
          {label}
          <span className="text-xs font-normal text-muted">(opens in new tab)</span>
        </a>
        <div className="mt-4 hidden min-h-[480px] w-full overflow-hidden rounded-lg border border-charcoal/10 bg-white md:block">
          <iframe
            title={`${projectTitle} — ${label}`}
            src={trimmed}
            className="h-[min(70vh,720px)] w-full"
          />
        </div>
        <p className="mt-3 text-xs text-muted md:hidden">
          PDF preview is available on larger screens; on mobile use the link above.
        </p>
      </div>
    </section>
  );
}

type GalleryImgProps = {
  src: string;
  alt: string;
  variant: "hero-wide" | "tile";
};

/** Default editorial images use Next/Image + Unsplash; client URLs use unoptimized to allow any CDN. */
export function ProjectGalleryImage({ src, alt, variant }: GalleryImgProps) {
  const unsplash = src.includes("images.unsplash.com");
  const className =
    variant === "hero-wide"
      ? "aspect-[16/9] sm:col-span-2 relative overflow-hidden rounded-lg bg-charcoal/5"
      : "aspect-[4/3] relative overflow-hidden rounded-lg bg-charcoal/5";

  if (unsplash) {
    return (
      <div className={className}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Image src={src} alt={alt} fill unoptimized className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
    </div>
  );
}
