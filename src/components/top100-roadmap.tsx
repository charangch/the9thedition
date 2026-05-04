"use client";

import Image from "next/image";
import Link from "next/link";
import { LikeShareBar } from "@/components/like-share-bar";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { generatedImagePath } from "@/lib/generated-media";
import type { Top100Project } from "@/lib/top100-projects";

function statusForRank(rank: number): NonNullable<TimelineItem["status"]> {
  if (rank <= 35) return "completed";
  if (rank <= 60) return "active";
  return "pending";
}

export function Top100Roadmap({ projects }: { projects: Top100Project[] }) {
  const items: TimelineItem[] = projects.map((p) => ({
    id: p.slug,
    title: `#${String(p.rank).padStart(2, "0")} — ${p.title}`,
    description: p.excerpt,
    timestamp: p.published_at,
    status: statusForRank(p.rank),
    content: (
      <div className="grid gap-4 rounded-xl border border-border/80 bg-background p-3 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
        <Link href={`/top-100/${p.slug}`} className="group relative block overflow-hidden rounded-lg border border-border/80">
          <div className="relative aspect-[4/3] w-full bg-muted/20">
            <Image
              src={generatedImagePath("top100", p.slug, 0)}
              alt={p.image_alts[0] ?? p.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 220px"
              unoptimized
            />
          </div>
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {p.typology} · {p.geo_region}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/top-100/${p.slug}`}
              className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition hover:border-primary/50 hover:bg-primary/15"
            >
              Open dossier →
            </Link>
            <LikeShareBar
              storageId={`top100:${p.slug}`}
              sharePath={`/top-100/${p.slug}`}
              title={p.title}
              compact
            />
          </div>
        </div>
      </div>
    ),
  }));

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-10">
      <Timeline items={items} variant="spacious" timestampPosition="top" />
    </div>
  );
}
