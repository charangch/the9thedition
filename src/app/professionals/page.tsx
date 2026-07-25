import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { architects } from "@/lib/architects";
import { getProjectsByArchitectSlug } from "@/lib/project-catalog";
import {
  countPublishedProjectsByProfessionalId,
  getPublishedProjectsByArchitectureFirm,
} from "@/lib/published-projects";
import { getProfessionals } from "@/lib/professionals-db";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const revalidate = 60;

export const metadata = buildPageMetadata({
  title: "Professionals & architecture studios",
  description:
    "Directory of architecture practices linked to The Ninth Edition project library and admin-published work.",
  path: "/professionals",
});

type DirectoryRow = {
  slug: string;
  firm: string;
  name: string;
  image?: string;
  count: number;
};

export default async function ProfessionalsPage() {
  const dbProfessionals = await getProfessionals(200);
  const catalogBySlug = new Map(architects.map((a) => [a.slug, a]));

  const rows: DirectoryRow[] = [];
  const seen = new Set<string>();

  for (const p of dbProfessionals) {
    const catalog = catalogBySlug.get(p.slug);
    const catalogCount = getProjectsByArchitectSlug(p.slug).length;
    const publishedCount = await countPublishedProjectsByProfessionalId(p.id);
    const count = catalogCount + publishedCount;
    if (count === 0 && !catalog) continue;
    rows.push({
      slug: p.slug,
      firm: p.firm || catalog?.firm || p.name,
      name: p.name || catalog?.name || p.firm,
      image: p.image_url ?? catalog?.image,
      count: count || catalogCount,
    });
    seen.add(p.slug);
  }

  for (const a of architects) {
    if (seen.has(a.slug)) continue;
    const catalogCount = getProjectsByArchitectSlug(a.slug).length;
    const published = await getPublishedProjectsByArchitectureFirm(a.firm, 80);
    const publishedExtra = published.filter(
      (p) => !getProjectsByArchitectSlug(a.slug).some((c) => c.slug === p.slug),
    ).length;
    rows.push({
      slug: a.slug,
      firm: a.firm,
      name: a.name,
      image: a.image,
      count: catalogCount + publishedExtra,
    });
    seen.add(a.slug);
  }

  rows.sort((x, y) => x.firm.localeCompare(y.firm));

  return (
    <>
      <SiteHeader />
      <main className="container-premium pb-16 pt-10">
        <div className="max-w-3xl">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">Professionals</h1>
          <p className="mt-4 text-muted">
            Architects and studios behind The Ninth Edition projects and admin-published work. Open a
            profile to see their projects in one place.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((a) => (
            <Link
              key={a.slug}
              href={`/professionals/${a.slug}`}
              className="group overflow-hidden rounded-xl border border-primary/15 bg-surface transition hover:border-primary/35"
            >
              <div className="relative aspect-[16/10] bg-charcoal/5">
                {a.image ? (
                  <Image
                    src={a.image}
                    alt={a.firm}
                    fill
                    className="object-cover transition group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                ) : null}
              </div>
              <div className="p-5">
                <h2 className="font-serif text-2xl group-hover:text-primary">{a.firm}</h2>
                <p className="mt-1 text-sm text-muted">{a.name}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-primary">
                  {a.count} project{a.count === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
