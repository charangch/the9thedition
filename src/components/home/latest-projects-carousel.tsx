"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ProjectCard, type ProjectCardModel } from "@/components/project-card";

type Props = {
  projects: ProjectCardModel[];
};

/** Slow continuous right→left carousel of latest catalog projects. */
export function LatestProjectsCarousel({ projects }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || projects.length === 0) return;

    let offset = 0;
    const speed = 0.35; // px per frame ≈ slow editorial drift

    const tick = () => {
      if (!pausedRef.current && track) {
        offset += speed;
        const half = track.scrollWidth / 2;
        if (half > 0 && offset >= half) offset -= half;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current != null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [projects.length]);

  const loop = [...projects, ...projects];

  return (
    <section className="pt-8" aria-labelledby="latest-projects-heading">
      <div className="container-premium mb-4 flex items-end justify-between border-b border-primary/20 pb-2">
        <h2 id="latest-projects-heading" className="font-serif text-2xl md:text-3xl">
          Latest Projects
        </h2>
        <Link href="/projects" className="text-xs uppercase tracking-[0.18em] text-primary">
          View all
        </Link>
      </div>

      <div
        className="relative overflow-hidden"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        onFocusCapture={() => {
          pausedRef.current = true;
        }}
        onBlurCapture={() => {
          pausedRef.current = false;
        }}
      >
        <div
          ref={trackRef}
          className="flex w-max gap-5 px-4 will-change-transform md:gap-6 md:px-6"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          {loop.map((project, i) => (
            <div
              key={`${project.slug}-${i}`}
              className="w-[min(82vw,22rem)] shrink-0 sm:w-[20rem] lg:w-[22rem]"
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
