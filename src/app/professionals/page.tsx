import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { architects } from "@/lib/architects";
import { getProjectsByArchitectSlug } from "@/lib/project-catalog";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata = buildPageMetadata({
  title: "Professionals & architecture studios",
  description:
    "Directory of architecture practices linked to The Ninth Edition project library on The 9th Edition.",
  path: "/professionals",
});

export default function ProfessionalsPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-premium pb-16 pt-10">
        <div className="max-w-3xl">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">Professionals</h1>
          <p className="mt-4 text-muted">
            Architects and studios behind The Ninth Edition projects. Open a profile to see all of
            their published work in one place.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {architects.map((a) => {
            const count = getProjectsByArchitectSlug(a.slug).length;
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
          })}
        </div>
      </main>
    </>
  );
}
