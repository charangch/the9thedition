"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export type LightboxSlide = {
  src: string;
  alt: string;
};

function useUnoptimized(src: string) {
  return src.startsWith("/api/");
}

export function ImageLightbox({
  slides,
  activeIndex,
  onClose,
}: {
  slides: LightboxSlide[];
  activeIndex: number | null;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (activeIndex !== null) setIndex(activeIndex);
  }, [activeIndex]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : slides.length - 1));
  }, [slides.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < slides.length - 1 ? i + 1 : 0));
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeIndex, onClose, goPrev, goNext]);

  if (activeIndex === null || !slides.length) return null;

  const slide = slides[index];
  if (!slide) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-charcoal/95 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged image"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-2xl leading-none text-white transition hover:bg-white/10"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
      >
        ×
      </button>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 px-3 py-2 text-sm text-white transition hover:bg-white/10 sm:left-6"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
          >
            ←
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 px-3 py-2 text-sm text-white transition hover:bg-white/10 sm:right-6"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
          >
            →
          </button>
        </>
      ) : null}

      <figure
        className="relative h-[min(85vh,900px)] w-full max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={slide.src}
          alt={slide.alt}
          fill
          className="object-contain"
          sizes="100vw"
          priority
          unoptimized={useUnoptimized(slide.src)}
        />
        <figcaption className="mt-3 text-center text-sm text-white/80">
          {slide.alt}
          {slides.length > 1 ? (
            <span className="ml-2 text-white/50">
              {index + 1} / {slides.length}
            </span>
          ) : null}
        </figcaption>
      </figure>
    </div>
  );
}
