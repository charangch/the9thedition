"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProjectCard, type ProjectCardModel } from "@/components/project-card";
import { cn } from "@/lib/utils";

type Props = {
  projects: ProjectCardModel[];
};

/** Horizontal Latest Projects rail — prev/next buttons + native scroll / trackpad. */
export function LatestProjectsCarousel({ projects }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [projects.length, updateArrows]);

  const scrollByPage = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(280, Math.floor(el.clientWidth * 0.85)) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (projects.length === 0) return null;

  return (
    <section className="pt-8" aria-labelledby="latest-projects-heading">
      <div className="container-premium mb-4 flex items-end justify-between gap-4 border-b border-primary/20 pb-2">
        <h2 id="latest-projects-heading" className="font-serif text-2xl md:text-3xl">
          Latest Projects
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous projects"
              disabled={!canPrev}
              onClick={() => scrollByPage(-1)}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border text-charcoal transition",
                canPrev
                  ? "border-charcoal/20 bg-[#faf8f4] hover:border-charcoal/40 hover:bg-white"
                  : "cursor-not-allowed border-charcoal/10 text-charcoal/30",
              )}
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              aria-label="Next projects"
              disabled={!canNext}
              onClick={() => scrollByPage(1)}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border text-charcoal transition",
                canNext
                  ? "border-charcoal/20 bg-[#faf8f4] hover:border-charcoal/40 hover:bg-white"
                  : "cursor-not-allowed border-charcoal/10 text-charcoal/30",
              )}
            >
              <Chevron dir="right" />
            </button>
          </div>
          <Link href="/projects" className="text-xs uppercase tracking-[0.18em] text-primary">
            View all
          </Link>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="container-premium-gutter-x flex gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:thin] md:gap-6"
      >
        {projects.map((project) => (
          <div
            key={project.slug}
            className="w-[min(82vw,22rem)] shrink-0 sm:w-[20rem] lg:w-[22rem]"
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
