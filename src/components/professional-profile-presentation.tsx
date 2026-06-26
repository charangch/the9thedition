"use client";

import Image from "next/image";
import Link from "next/link";
import { ArchitectSocialLinks } from "@/components/architect-social-links";
import {
  ProjectCard,
  catalogEntryToProjectCard,
  publishedToProjectCard,
} from "@/components/project-card";
import type { ProfessionalProfileViewModel } from "@/lib/builder/professional-profile-view-model";
import { shouldUseUnoptimizedImage } from "@/lib/media/remote-image";

export function ProfessionalProfilePresentation({ model }: { model: ProfessionalProfileViewModel }) {
  const { firm, name, bio, image, catalogProjects, publishedProjects } = model;

  return (
    <main className="container-premium pb-16 pt-10">
      <nav className="text-xs uppercase tracking-[0.16em] text-muted">
        <Link href="/professionals" className="hover:text-primary">
          Professionals
        </Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal/80">{firm}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl border border-primary/15 bg-charcoal/5">
            {image ? (
              <Image
                src={image}
                alt={firm}
                fill
                className="object-cover"
                sizes="280px"
                unoptimized={shouldUseUnoptimizedImage(image)}
              />
            ) : null}
          </div>
        </div>
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">{firm}</h1>
          <p className="mt-2 text-lg text-muted">{name}</p>
          <p className="mt-6 max-w-2xl leading-relaxed text-charcoal/85">{bio}</p>
          <ArchitectSocialLinks
            className="mt-6"
            socials={{
              website: model.website,
              instagram: model.instagram,
              facebook: model.facebook,
              youtube: model.youtube,
            }}
          />
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-serif text-3xl">Projects</h2>
        <p className="mt-2 text-sm text-muted">
          Work on the9thedition that credits this studio (same projects as on the homepage and directory).
        </p>
        {catalogProjects.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No projects linked yet.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {catalogProjects.map((project) => (
              <ProjectCard key={project.slug} project={catalogEntryToProjectCard(project)} />
            ))}
          </div>
        )}
      </section>

      {publishedProjects.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-serif text-3xl">Published work</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publishedProjects.map((project) => (
              <ProjectCard key={project.slug} project={publishedToProjectCard(project)} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
