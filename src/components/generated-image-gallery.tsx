"use client";

import Image from "next/image";
import { generatedImagePath, type GeneratedCollection, GENERATED_GALLERY_COUNT } from "@/lib/generated-media";

type Props = {
  collection: GeneratedCollection;
  itemKey: string;
  title: string;
  /** When set, renders these URLs instead of procedural generated frames. */
  imageUrls?: string[];
  /** Inclusive start index (default 0). */
  from?: number;
  /** Number of frames to render (default: full gallery length). */
  count?: number;
  alts?: string[];
  className?: string;
};

function isGeneratedSrc(src: string) {
  return src.startsWith("/api/generated-image");
}

export function GeneratedImageGallery({
  collection,
  itemKey,
  title,
  imageUrls,
  from = 0,
  count = GENERATED_GALLERY_COUNT,
  alts,
  className,
}: Props) {
  const start = Math.max(0, from);
  const uploaded = imageUrls?.filter(Boolean) ?? [];
  const useUploaded = uploaded.length > 0;
  const end = useUploaded
    ? uploaded.length
    : Math.min(GENERATED_GALLERY_COUNT, start + Math.max(1, count));
  const indices = useUploaded
    ? uploaded.map((_, i) => i)
    : Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <section className={className} aria-label="Image gallery">
      <h2 className="font-serif text-2xl text-charcoal">Visual study</h2>
      <p className="mt-2 text-sm text-muted">
        {useUploaded
          ? "Project photography and studies supplied by the design team."
          : "On-site generated graphics for layout and image SEO—no third-party stock URLs."}
      </p>
      <ul className="mt-8 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {indices.map((i) => {
          const src = useUploaded ? uploaded[i]! : generatedImagePath(collection, itemKey, i);
          const alt = alts?.[i] ?? `${title} — editorial frame ${i + 1}`;
          return (
            <li key={i}>
              <figure className="relative aspect-[4/3] overflow-hidden rounded-lg border border-charcoal/10 bg-charcoal/5">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  unoptimized={isGeneratedSrc(src)}
                />
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function GeneratedImageHero({
  collection,
  itemKey,
  index,
  title,
  alt,
  priority,
}: {
  collection: GeneratedCollection;
  itemKey: string;
  index: number;
  title: string;
  alt?: string;
  priority?: boolean;
}) {
  const src = generatedImagePath(collection, itemKey, index);
  const resolvedAlt = alt ?? `${title} — lead visual`;
  return (
    <div className="relative aspect-[21/9] w-full max-h-[min(72vh,720px)] bg-charcoal/5 md:aspect-[2.4/1]">
      <Image
        src={src}
        alt={resolvedAlt}
        fill
        className="object-cover"
        priority={priority}
        sizes="100vw"
        unoptimized={isGeneratedSrc(src)}
      />
    </div>
  );
}
