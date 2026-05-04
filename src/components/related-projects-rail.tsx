"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LikeShareBar } from "@/components/like-share-bar";
import { cn } from "@/lib/utils";

export type RelatedProjectRailItem = {
  slug: string;
  title: string;
  category: string;
  image: string;
  line2?: string;
};

type Props = {
  items: RelatedProjectRailItem[];
  heading?: string;
  subheading?: string;
};

export function RelatedProjectsRail({ items, heading = "Related projects", subheading }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 6);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [items, updateArrows]);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(260, Math.floor(el.clientWidth * 0.72));
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className="mt-12 border-t border-primary/10 pt-10" aria-labelledby="related-projects-rail-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 id="related-projects-rail-heading" className="font-serif text-2xl text-charcoal md:text-3xl">
            {heading}
          </h2>
          {subheading ? <p className="mt-1 max-w-2xl text-sm text-muted">{subheading}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            disabled={!canPrev}
            aria-label="Scroll related projects left"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-surface text-charcoal transition",
              canPrev ? "hover:border-primary/40 hover:bg-background-light" : "cursor-not-allowed opacity-40",
            )}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            disabled={!canNext}
            aria-label="Scroll related projects right"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-surface text-charcoal transition",
              canNext ? "hover:border-primary/40 hover:bg-background-light" : "cursor-not-allowed opacity-40",
            )}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="relative -mx-1">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const imgUnopt = item.image.startsWith("/api/");
            return (
              <article
                key={item.slug}
                className="snap-start shrink-0 overflow-hidden rounded-xl border border-primary/12 bg-surface shadow-sm transition hover:border-primary/25 hover:shadow-md"
                style={{ width: "min(85vw, 300px)" }}
              >
                <Link href={`/projects/${item.slug}`} className="group block">
                  <div className="relative aspect-[16/10] w-full bg-charcoal/5">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="300px"
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      unoptimized={imgUnopt}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-primary">{item.category}</p>
                    {item.line2 ? (
                      <p className="mt-0.5 text-[11px] text-muted line-clamp-1">{item.line2}</p>
                    ) : null}
                    <p className="mt-1 font-serif text-lg leading-snug text-charcoal group-hover:text-primary">
                      {item.title}
                    </p>
                  </div>
                </Link>
                <div className="border-t border-primary/10 px-3 py-2">
                  <LikeShareBar
                    storageId={`project:${item.slug}`}
                    sharePath={`/projects/${item.slug}`}
                    title={item.title}
                    compact
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
