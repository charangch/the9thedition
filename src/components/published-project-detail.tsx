import Image from "next/image";
import Link from "next/link";
import { GeneratedImageGallery } from "@/components/generated-image-gallery";
import { ProjectEnquiryForm } from "@/components/project-enquiry-form";
import { ProjectVideoBlock } from "@/components/project-media";
import { LikeShareBar } from "@/components/like-share-bar";
import { RelatedProjectsRail, type RelatedProjectRailItem } from "@/components/related-projects-rail";
import { SaveProjectButton } from "@/components/save-project-button";
import { ArchitectSocialLinks } from "@/components/architect-social-links";
import { getPublishedProjectArticle } from "@/lib/published-project-article";
import { getProfessionalBySlug } from "@/lib/professionals-db";
import type { PublishedProject } from "@/lib/published-projects";
import { generatedImagePath } from "@/lib/generated-media";

function LeadParagraph({ text }: { text: string }) {
  const lead = /^_([^_]+)_\s*/.exec(text);
  if (lead) {
    return (
      <p className="text-base leading-[1.75] text-charcoal/90 md:text-[17px]">
        <em className="text-charcoal/80">{lead[1]}</em> {text.slice(lead[0].length)}
      </p>
    );
  }
  return <p className="text-base leading-[1.75] text-charcoal/90 md:text-[17px]">{text}</p>;
}

function toRailItems(projects: PublishedProject[]): RelatedProjectRailItem[] {
  return projects.map((p) => {
    const form = (p.form_data ?? {}) as Record<string, unknown>;
    const firm = String(form.architectureFirm ?? p.byline?.replace(/^By\s+/i, "") ?? "");
    return {
      slug: p.slug,
      title: p.title,
      category: p.category,
      image: p.hero_image_url ?? p.image_urls[0] ?? generatedImagePath("projects", p.slug, 0),
      line2: firm || undefined,
    };
  });
}

function pickRelated(current: PublishedProject, all: PublishedProject[], max = 24): PublishedProject[] {
  const others = all.filter((p) => p.slug !== current.slug);
  const firm = String((current.form_data as Record<string, unknown> | null)?.architectureFirm ?? "");
  const ordered: PublishedProject[] = [];
  const push = (pred: (p: PublishedProject) => boolean) => {
    for (const p of others) {
      if (ordered.length >= max) return;
      if (ordered.some((x) => x.slug === p.slug)) continue;
      if (pred(p)) ordered.push(p);
    }
  };
  if (current.professional_id) push((p) => p.professional_id === current.professional_id);
  push((p) => p.category === current.category);
  push(() => true);
  return ordered.slice(0, max);
}

type Props = {
  published: PublishedProject;
  allPublished: PublishedProject[];
};

/** Published admin projects — same structure as static catalog detail pages. */
export async function PublishedProjectDetail({ published, allPublished }: Props) {
  const article = getPublishedProjectArticle(published);
  const form = (published.form_data ?? {}) as Record<string, unknown>;
  const projectType = String(form.projectType ?? "");
  const heroSrc =
    published.hero_image_url ?? published.image_urls[0] ?? generatedImagePath("projects", published.slug, 0);
  const galleryForStudy = published.image_urls.filter((u) => u && u !== heroSrc).slice(0, 25);
  const dbProfessional = published.professional_slug
    ? await getProfessionalBySlug(published.professional_slug)
    : null;
  const socials = {
    website: dbProfessional?.website ?? (form.professionalSocials as { website?: string })?.website,
    instagram: dbProfessional?.instagram_url ?? (form.professionalSocials as { instagram?: string })?.instagram,
    facebook: dbProfessional?.facebook_url ?? (form.professionalSocials as { facebook?: string })?.facebook,
    youtube: dbProfessional?.youtube_url ?? (form.professionalSocials as { youtube?: string })?.youtube,
  };
  const relatedRail = toRailItems(pickRelated(published, allPublished));
  const urlPath = `/projects/${published.slug}`;

  return (
    <article className="pb-20">
      <div className="container-premium pt-8">
        <nav className="text-xs uppercase tracking-[0.16em] text-muted">
          <Link href="/projects" className="hover:text-primary">
            Projects
          </Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/80">{published.category}</span>
        </nav>
        <h1 className="article-lede mt-4 max-w-4xl font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
          {published.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
          <span className="uppercase tracking-[0.12em] text-primary">{published.category}</span>
          {projectType ? <span className="text-charcoal/70">· {projectType}</span> : null}
          {published.location ? <span>{published.location}</span> : null}
          {published.byline ? <span>{published.byline}</span> : null}
        </div>
        {published.professional_slug ? (
          <p className="mt-4 text-sm text-charcoal/85">
            <span className="text-muted">Architects:</span>{" "}
            <Link
              href={`/professionals/${published.professional_slug}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {String(form.architectureFirm ?? published.byline?.replace(/^By\s+/i, "") ?? "View profile")}
            </Link>
          </p>
        ) : null}
        <ArchitectSocialLinks socials={socials} className="mt-4" />
        <div className="mt-5">
          <LikeShareBar storageId={`project:${published.slug}`} sharePath={urlPath} title={published.title} />
        </div>
      </div>

      <div className="relative aspect-[21/9] w-full max-h-[min(72vh,720px)] bg-charcoal/5 md:aspect-[2.4/1]">
        <Image
          src={heroSrc}
          alt={published.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          unoptimized={!heroSrc.startsWith("/api/generated-image")}
        />
      </div>

      <div className="container-premium mt-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
            <section aria-labelledby="build-details-heading">
              <h2
                id="build-details-heading"
                className="border-b border-charcoal/10 pb-2 font-serif text-xl text-charcoal"
              >
                Build details
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                {article.specs.map((row) => (
                  <div key={row.label} className="border-b border-charcoal/5 pb-3 last:border-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{row.label}</dt>
                    <dd className="mt-1 leading-snug text-charcoal/90">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <ProjectEnquiryForm projectSlug={published.slug} projectTitle={published.title} />
          </aside>

          <div className="article-body min-w-0">
            {article.dek ? (
              <p className="font-serif text-xl italic leading-snug text-charcoal/85 md:text-2xl">{article.dek}</p>
            ) : null}

            <div className="mt-8 space-y-6">
              {article.paragraphs.map((p, i) => (
                <LeadParagraph key={i} text={p} />
              ))}
            </div>

            <GeneratedImageGallery
              className="mt-12 border-t border-charcoal/10 pt-10"
              collection="projects"
              itemKey={published.slug}
              title={published.title}
              imageUrls={galleryForStudy.length ? galleryForStudy : article.gallery}
              alts={article.imageAlts}
            />

            {article.media.videoUrl ? (
              <ProjectVideoBlock
                url={article.media.videoUrl}
                title={`${published.title} — video`}
                caption="Editorial film selection; supplied by the design team when available."
              />
            ) : null}

            <section className="mt-14 border-t border-charcoal/10 pt-10" aria-labelledby="project-faq-heading">
              <h2 id="project-faq-heading" className="font-serif text-2xl text-charcoal">
                Questions &amp; answers
              </h2>
              <p className="mt-2 text-sm text-muted">
                Structured for answer engines—verify facts with the design team for specification work.
              </p>
              <dl className="mt-8 space-y-6">
                {article.faq.map((f, i) => (
                  <div key={i} className="rounded-xl border border-charcoal/10 bg-surface p-5">
                    <dt className="font-medium text-charcoal">{f.question}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-charcoal/80">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <div className="mt-10 border-t border-charcoal/10 pt-8">
              <SaveProjectButton
                slug={published.slug}
                title={published.title}
                imageUrl={heroSrc}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex rounded-full border border-primary/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal hover:border-primary"
              >
                All projects
              </Link>
              {published.professional_slug ? (
                <Link
                  href={`/professionals/${published.professional_slug}`}
                  className="inline-flex rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                >
                  More from {String(form.architectureFirm ?? "studio")}
                </Link>
              ) : null}
            </div>

            {relatedRail.length ? (
              <RelatedProjectsRail
                items={relatedRail}
                subheading="Same category or architect—up to 24 projects. Use the arrows to scroll horizontally."
              />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
