import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Top100IndexJsonLd } from "@/components/top100-project-json-ld";
import { Top100Roadmap } from "@/components/top100-roadmap";
import { getAllTop100Projects } from "@/lib/top100-projects";
import { getSiteUrl } from "@/lib/site-url";

const PAGE_DESC =
  "The Top 100 is a ranked roadmap of benchmark architecture projects—each dossier is structured for search, geographic discovery, FAQs, and answer engines.";

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteUrl();
  return {
    title: "Top 100 | the9thedition",
    description: PAGE_DESC,
    keywords: [
      "top architecture projects",
      "architecture ranking",
      "design benchmark",
      "built environment",
      "regional architecture",
      "the9thedition",
    ],
    alternates: { canonical: `${site}/top-100` },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `${site}/top-100`,
      siteName: "The 9th Edition",
      title: "Top 100 | the9thedition",
      description: PAGE_DESC,
    },
    twitter: {
      card: "summary_large_image",
      title: "Top 100 | the9thedition",
      description: PAGE_DESC,
    },
    robots: { index: true, follow: true },
  };
}

export default function Top100Page() {
  const projects = getAllTop100Projects();
  return (
    <>
      <Top100IndexJsonLd total={projects.length} />
      <SiteHeader />
      <main className="bg-background-light pb-20">
        <section className="border-b border-border bg-card">
          <div className="container-premium py-6 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <nav aria-label="Breadcrumb" className="flex flex-wrap gap-x-2 gap-y-1">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <span aria-hidden className="text-charcoal/30">
                /
              </span>
              <span className="text-foreground">Top 100</span>
            </nav>
          </div>
        </section>

        <section className="border-b border-border bg-card">
          <div className="container-premium py-10 md:py-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Roadmap</p>
            <h1 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">Top 100</h1>
            <p className="article-lede mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {PAGE_DESC} Follow the timeline from #01–#
              {String(projects.length).padStart(2, "0")}; each stop opens a full dossier with imagery, narrative, and
              structured answers for AEO.
            </p>
          </div>
        </section>

        <div className="container-premium mt-10 md:mt-14">
          <Top100Roadmap projects={projects} />
        </div>
      </main>
    </>
  );
}
