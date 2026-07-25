import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCard, publishedToProjectCard } from "@/components/project-card";
import { SiteHeader } from "@/components/site-header";
import { getAllArchitectSlugs, getArchitectBySlug } from "@/lib/architects";
import { getProfessionalBySlug, getProfessionals } from "@/lib/professionals-db";
import {
  getPublishedProjectsByArchitectureFirm,
  getPublishedProjectsByProfessionalId,
} from "@/lib/published-projects";
import { getProjectsByArchitectSlug, resolveProjectHeroImage } from "@/lib/project-catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const db = await getProfessionals(200);
  const slugs = new Set([...getAllArchitectSlugs(), ...db.map((p) => p.slug)]);
  return [...slugs].map((slug) => ({ slug }));
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

  const catalogProjects = getProjectsByArchitectSlug(slug);
  const publishedProjects = dbProfessional
    ? await getPublishedProjectsByProfessionalId(dbProfessional.id, 48)
    : await getPublishedProjectsByArchitectureFirm(architect.firm, 48);

  const catalogSlugs = new Set(catalogProjects.map((p) => p.slug));
  const publishedExtra = publishedProjects.filter((p) => !catalogSlugs.has(p.slug));

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
            Catalog and admin-published work credited to this studio.
          </p>
          {catalogProjects.length === 0 && publishedExtra.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No projects linked yet.</p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {catalogProjects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={{
                    slug: project.slug,
                    title: project.title,
                    category: project.category,
                    location: project.location,
                    image: resolveProjectHeroImage(project.slug),
                    meta: project.byline ?? null,
                  }}
                />
              ))}
              {publishedExtra.map((project) => (
                <ProjectCard key={project.slug} project={publishedToProjectCard(project)} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
