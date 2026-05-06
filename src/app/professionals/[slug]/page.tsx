import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LikeShareBar } from "@/components/like-share-bar";
import { SiteHeader } from "@/components/site-header";
import { getAllArchitectSlugs, getArchitectBySlug } from "@/lib/architects";
import { getProfessionalBySlug } from "@/lib/professionals-db";
import { getPublishedProjectsByArchitectureFirm, getPublishedProjectsByProfessionalId } from "@/lib/published-projects";
import { getProjectsByArchitectSlug } from "@/lib/project-catalog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllArchitectSlugs().map((slug) => ({ slug }));
}

export default async function ProfessionalDetailPage({ params }: Props) {
  const { slug } = await params;
  const dbProfessional = await getProfessionalBySlug(slug);
  const architect = dbProfessional
    ? {
        slug: dbProfessional.slug,
        name: dbProfessional.name,
        firm: dbProfessional.firm,
        bio: dbProfessional.bio ?? "",
        image: dbProfessional.image_url ?? undefined,
      }
    : getArchitectBySlug(slug);
  if (!architect) {
    notFound();
  }

  const projects = getProjectsByArchitectSlug(slug);
  const publishedProjects = dbProfessional
    ? await getPublishedProjectsByProfessionalId(dbProfessional.id, 24)
    : await getPublishedProjectsByArchitectureFirm(architect.firm, 12);

  return (
    <>
      <SiteHeader />
      <main className="container-premium pb-16 pt-10">
        <nav className="text-xs uppercase tracking-[0.16em] text-muted">
          <Link href="/professionals" className="hover:text-primary">
            Professionals
          </Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/80">{architect.firm}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl border border-primary/15 bg-charcoal/5">
              {architect.image ? (
                <Image
                  src={architect.image}
                  alt={architect.firm}
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              ) : null}
            </div>
          </div>
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">{architect.firm}</h1>
            <p className="mt-2 text-lg text-muted">{architect.name}</p>
            <p className="mt-6 max-w-2xl leading-relaxed text-charcoal/85">{architect.bio}</p>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="font-serif text-3xl">Projects</h2>
          <p className="mt-2 text-sm text-muted">
            Work on the9thedition that credits this studio (same projects as on the homepage and
            directory).
          </p>
          {projects.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No projects linked yet.</p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project.slug}
                  className="flex flex-col overflow-hidden rounded-xl border border-primary/15 bg-surface transition hover:border-primary/35"
                >
                  <Link href={`/projects/${project.slug}`} className="group block flex-1">
                    <div className="relative aspect-[16/10] bg-charcoal/5">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-primary">
                        {project.category}
                      </p>
                      <h3 className="mt-1 font-serif text-xl leading-snug group-hover:text-primary">
                        {project.title}
                      </h3>
                    </div>
                  </Link>
                  <div className="border-t border-primary/10 px-4 py-3">
                    <LikeShareBar
                      storageId={`project:${project.slug}`}
                      sharePath={`/projects/${project.slug}`}
                      title={project.title}
                      compact
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl">Approved submissions</h2>
          <p className="mt-2 text-sm text-muted">
            Submitted projects approved by admin for this architecture firm.
          </p>
          {publishedProjects.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No approved submissions linked yet.</p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {publishedProjects.map((project) => (
                <article
                  key={project.slug}
                  className="flex flex-col rounded-xl border border-primary/15 bg-surface transition hover:border-primary/35"
                >
                  <Link href={`/projects/${project.slug}`} className="group block flex-1 p-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-primary">
                      {project.category || "Project"}
                    </p>
                    <h3 className="mt-1 font-serif text-xl leading-snug group-hover:text-primary">
                      {project.title}
                    </h3>
                    {project.excerpt ? (
                      <p className="mt-2 text-sm text-charcoal/80">{project.excerpt}</p>
                    ) : null}
                  </Link>
                  <div className="border-t border-primary/10 px-4 py-3">
                    <LikeShareBar
                      storageId={`project:${project.slug}`}
                      sharePath={`/projects/${project.slug}`}
                      title={project.title}
                      compact
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
