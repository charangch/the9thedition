import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { architects } from "@/lib/architects";
import { getProfessionals } from "@/lib/professionals-db";
import { countPublishedProjectsByProfessionalId } from "@/lib/published-projects";
import { getProjectsByArchitectSlug } from "@/lib/project-catalog";

export default async function ProfessionalsPage() {
  const dbProfessionals = await getProfessionals(180);
  const merged = [
    ...dbProfessionals.map((p) => ({
      slug: p.slug,
      firm: p.firm,
      name: p.name,
      image: p.image_url ?? undefined,
      fromDb: true,
      id: p.id,
    })),
    ...architects
      .filter((a) => !dbProfessionals.some((p) => p.slug === a.slug))
      .map((a) => ({ slug: a.slug, firm: a.firm, name: a.name, image: a.image, fromDb: false, id: "" })),
  ];

  return (
    <>
      <SiteHeader />
      <main className="container-premium pb-16 pt-10">
        <div className="max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl">Professionals</h1>
          <p className="mt-4 text-muted">
            Architects and studios behind projects on the9thedition. Open a profile to see all of
            their published work in one place.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {await Promise.all(merged.map(async (a) => {
            const count = a.fromDb
              ? await countPublishedProjectsByProfessionalId(a.id)
              : getProjectsByArchitectSlug(a.slug).length;
            return (
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
                    {count} project{count === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            );
          }))}
        </div>
      </main>
    </>
  );
}
