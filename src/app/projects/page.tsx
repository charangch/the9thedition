import { ProjectCard } from "@/components/project-card";
import { SiteHeader } from "@/components/site-header";
import { getMergedProjectCards } from "@/lib/merged-project-cards";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const revalidate = 60;

export const metadata = buildPageMetadata({
  title: "Architecture & design projects",
  description:
    "Explore luxury architecture and interior design projects from The Ninth Edition — residential, hospitality, and cultural works with photography and editorial documentation.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const rows = await getMergedProjectCards(280);

  return (
    <>
      <SiteHeader />
      <main className="container-premium pb-16 pt-10">
        <div className="max-w-3xl">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">Projects</h1>
          <p className="mt-4 text-muted">
            The Ninth Edition project library — architecture and interior design with photography,
            build details, and full editorial pages.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </main>
    </>
  );
}
