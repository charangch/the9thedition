"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ImageLightbox, type LightboxSlide } from "@/components/image-lightbox";
import { generatedImagePath, type GeneratedCollection, GENERATED_GALLERY_COUNT } from "@/lib/generated-media";

type Props = {
  collection: GeneratedCollection;
  itemKey: string;
  title: string;
  /** When set, renders these URLs instead of procedural generated frames. */
  imageUrls?: string[];
  /** Single hero URL override (local editorial JPEGs). */
  imageSrc?: string;
  /** Inclusive start index (default 0). */
  from?: number;
  /** Number of frames to render (default: full gallery length). */
  count?: number;
  alts?: string[];
  className?: string;
};

function useUnoptimized(src: string) {
  return src.startsWith("/api/");
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const start = Math.max(0, from);
  const uploaded = imageUrls?.filter(Boolean) ?? [];
  const useUploaded = uploaded.length > 0;
  const end = useUploaded
    ? uploaded.length
    : Math.min(GENERATED_GALLERY_COUNT, start + Math.max(1, count));
  const indices = useUploaded
    ? uploaded.map((_, i) => i)
    : Array.from({ length: end - start }, (_, i) => start + i);

  const slides: LightboxSlide[] = useMemo(
    () =>
      indices.map((i) => {
        const src = useUploaded ? uploaded[i]! : generatedImagePath(collection, itemKey, i);
        const alt = alts?.[i] ?? `${title} — editorial frame ${i + 1}`;
        return { src, alt };
      }),
    [alts, collection, indices, itemKey, title, uploaded, useUploaded],
  );

  return (
    <section className={className} aria-label="Image gallery">
      <h2 className="font-serif text-2xl text-charcoal">Visual study</h2>
      <p className="mt-2 text-sm text-muted">Click any image to view full size.</p>
      <ul className="mt-8 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {slides.map((slide, listIndex) => (
          <li key={listIndex}>
            <button
              type="button"
              className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-charcoal/10 bg-charcoal/5 text-left transition hover:border-primary/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => setLightboxIndex(listIndex)}
              aria-label={`View larger: ${slide.alt}`}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                unoptimized={useUnoptimized(slide.src)}
              />
            </button>
          </li>
        ))}
      </ul>
      <ImageLightbox slides={slides} activeIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
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
  imageSrc,
}: {
  collection: GeneratedCollection;
  itemKey: string;
  index: number;
  title: string;
  alt?: string;
  priority?: boolean;
  imageSrc?: string;
}) {
  const src = imageSrc ?? generatedImagePath(collection, itemKey, index);
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
        unoptimized={useUnoptimized(src)}
      />
    </div>
  );
}
