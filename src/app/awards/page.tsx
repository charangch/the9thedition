import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LikeShareBar } from "@/components/like-share-bar";
import { SiteHeader } from "@/components/site-header";
import { AWARDS_EDITION_YEAR, awardWinners, studentAwardSpotlights } from "@/lib/awards-data";
import { getArchitectBySlug } from "@/lib/architects";
import { generatedImagePath } from "@/lib/generated-media";
import { getProjectBySlug } from "@/lib/project-catalog";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = buildPageMetadata({
  title: `Awards ${AWARDS_EDITION_YEAR}`,
  description:
    "Building of the Year — curated winners across housing, culture, interiors, and landscape, with a dedicated student stream.",
  path: "/awards",
});

const editionYears = [2024, 2025, 2026];

export default function AwardsPage() {
  const site = getSiteUrl();
  const resolved = awardWinners
    .map((row) => {
      const p = getProjectBySlug(row.slug);
      if (!p) return null;
      const architect = getArchitectBySlug(p.architectSlug);
      return {
        ...row,
        project: p,
        studio: architect?.firm ?? p.byline ?? "Editorial",
      };
    })
    .filter(Boolean) as Array<{
    slug: string;
    awardCategory: string;
    project: NonNullable<ReturnType<typeof getProjectBySlug>>;
    studio: string;
  }>;

  return (
    <>
      <SiteHeader />
      <main className="pb-24">
        <section className="relative overflow-hidden bg-charcoal text-[#f4f1ea]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="container-premium relative py-16 md:py-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c9a227]">
              The 9th Edition Awards
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-[1.08] md:text-6xl md:leading-[1.05]">
              Building of the Year {AWARDS_EDITION_YEAR}
            </h1>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-white/55">Presented by the9thedition editorial</p>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/78 md:text-lg">
              From the editorial catalog, we spotlight work that advances craft, climate sense, and public life — the
              buildings and interiors our readers return to again and again. Here are the winners for this edition.
            </p>
            <div className="mt-10 flex flex-wrap gap-2">
              {editionYears.map((y) => (
                <span
                  key={y}
                  className={`rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                    y === AWARDS_EDITION_YEAR
                      ? "border-[#c9a227] bg-[#c9a227]/15 text-[#f4e4bc]"
                      : "border-white/20 text-white/45"
                  }`}
                >
                  {y}
                </span>
              ))}
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#c9a227]/60 to-transparent" />
        </section>

        <section className="container-premium -mt-6 relative z-[1] rounded-2xl border border-primary/12 bg-surface p-8 shadow-lg md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-3xl text-charcoal md:text-4xl">The winners</h2>
              <p className="mt-2 max-w-xl text-sm text-muted">
                Tweet-style energy, editorial depth — open any project for the full dossier, specifications, and
                enquiry flow.
              </p>
            </div>
            <LikeShareBar
              storageId="page:awards"
              sharePath="/awards"
              title={`Building of the Year ${AWARDS_EDITION_YEAR} | the9thedition`}
              className="shrink-0"
            />
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {resolved.map(({ slug, awardCategory, project, studio }) => {
              const img = project.image;
              const path = `/projects/${slug}`;
              return (
                <article
                  key={slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-background-light shadow-sm transition hover:border-primary/25 hover:shadow-md"
                >
                  <Link href={path} className="relative block aspect-[16/11] overflow-hidden bg-charcoal/10">
                    <Image
                      src={img}
                      alt={project.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      unoptimized={img.startsWith("/api/")}
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-charcoal/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                      {awardCategory}
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-serif text-xl leading-snug text-charcoal md:text-2xl">
                      <Link href={path} className="hover:text-primary">
                        {project.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-muted">
                      <span className="text-charcoal/80">{studio}</span>
                    </p>
                    <div className="mt-4 flex flex-1 flex-col justify-end gap-3 border-t border-primary/10 pt-4">
                      <Link
                        href={path}
                        className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary underline-offset-4 hover:underline"
                      >
                        See project →
                      </Link>
                      <LikeShareBar
                        storageId={`project:${slug}`}
                        sharePath={path}
                        title={project.title}
                        compact
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="container-premium mt-16">
          <div className="rounded-2xl border border-primary/12 bg-surface p-8 md:p-10">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Student awards</p>
              <h2 className="mt-2 font-serif text-3xl md:text-4xl">Emerging voices</h2>
              <p className="mt-3 text-sm text-muted">
                A parallel stream for schools and studios — nominate through your programme office; publication on the
                main map follows editorial review.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {studentAwardSpotlights.map((item) => {
                const img = generatedImagePath("projects", item.id, 0);
                const sharePath = `/awards#${item.id}`;
                return (
                  <article
                    key={item.id}
                    id={item.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-primary/10 bg-background-light"
                  >
                    <Link href={sharePath} className="relative aspect-[4/3] bg-charcoal/5">
                      <Image
                        src={img}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px)100vw,33vw"
                        unoptimized
                      />
                    </Link>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">{item.category}</p>
                      <h3 className="mt-1 font-serif text-xl">{item.title}</h3>
                      <p className="mt-2 text-xs text-muted">{item.school}</p>
                      <div className="mt-4 border-t border-primary/10 pt-3">
                        <LikeShareBar
                          storageId={`student:${item.id}`}
                          sharePath={sharePath}
                          title={item.title}
                          compact
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container-premium mt-12 text-center">
          <p className="text-xs text-muted">
            Reference inspiration:{" "}
            <a
              href="https://boty.archdaily.com/us/2026"
              className="text-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              ArchDaily Building of the Year
            </a>
            . Ours is an independent editorial selection on {site}.
          </p>
        </section>
      </main>
    </>
  );
}
