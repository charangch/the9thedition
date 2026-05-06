import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/block-renderer";
import { GeneratedImageGallery, GeneratedImageHero } from "@/components/generated-image-gallery";
import { ProjectGalleryPremium } from "@/components/project-gallery-premium";
import { ProjectEnquiryForm } from "@/components/project-enquiry-form";
import { ProjectPdfBlock, ProjectVideoBlock } from "@/components/project-media";
import { ProjectPageJsonLd } from "@/components/project-json-ld";
import { LikeShareBar } from "@/components/like-share-bar";
import { RelatedProjectsRail, type RelatedProjectRailItem } from "@/components/related-projects-rail";
import { SaveProjectButton } from "@/components/save-project-button";
import { SiteHeader } from "@/components/site-header";
import { type LayoutBlock, normalizeLayoutBlocks } from "@/lib/layout-blocks";
import { getArchitectBySlug } from "@/lib/architects";
import type { PublishedProject } from "@/lib/published-projects";
import { getPublishedProjectBySlug, getPublishedProjects } from "@/lib/published-projects";
import { getAllProjectSlugs, getProjectBySlug, getRelatedProjects } from "@/lib/project-catalog";
import { getProjectArticle } from "@/lib/project-detail-content";
import { GENERATED_GALLERY_COUNT } from "@/lib/generated-media";
import { generatedGalleryPaths } from "@/lib/generated-media";
import { generatedImagePath } from "@/lib/generated-media";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ slug: string }> };

const DEFAULT_YOUTUBE = "https://www.youtube.com/watch?v=lOJO1osi9po";

export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

function pickRelatedPublished(
  current: PublishedProject,
  all: PublishedProject[],
  maxItems = 24,
): PublishedProject[] {
  const others = all.filter((p) => p.slug !== current.slug);
  const ordered: PublishedProject[] = [];
  const push = (predicate: (p: PublishedProject) => boolean) => {
    for (const p of others) {
      if (ordered.length >= maxItems) return;
      if (ordered.some((x) => x.slug === p.slug)) continue;
      if (predicate(p)) ordered.push(p);
    }
  };

  if (current.professional_slug) {
    push((p) => p.professional_slug === current.professional_slug);
  }
  if (current.professional_id) {
    push((p) => Boolean(p.professional_id && p.professional_id === current.professional_id));
  }

  const raw = (current.form_data as Record<string, unknown> | null)?.projectType;
  const pt = typeof raw === "string" ? raw : null;
  if (pt) {
    push(
      (p) =>
        p.category === current.category &&
        (p.form_data as Record<string, unknown> | null)?.projectType === pt,
    );
  }

  push((p) => p.category === current.category);
  push((_p) => true);

  return ordered.slice(0, maxItems);
}

function toPublishedRailItems(projects: PublishedProject[]): RelatedProjectRailItem[] {
  return projects.map((p) => {
    const thumb = p.hero_image_url ?? p.image_urls[0] ?? generatedImagePath("projects", p.slug, 0);
    const firm = (p.form_data as Record<string, unknown> | null)?.architectureFirm;
    const line2 =
      typeof firm === "string" && firm.trim()
        ? firm.trim()
        : p.byline?.trim() || undefined;
    return {
      slug: p.slug,
      title: p.title,
      category: p.category,
      image: thumb,
      line2,
    };
  });
}

function mergePublishedImages(published: PublishedProject): string[] {
  const gen = generatedGalleryPaths("projects", published.slug);
  const merged = [...published.image_urls];
  for (let i = merged.length; i < GENERATED_GALLERY_COUNT && i < gen.length; i++) {
    merged.push(gen[i]!);
  }
  return merged.slice(0, GENERATED_GALLERY_COUNT);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const published = await getPublishedProjectBySlug(slug);
  const site = getSiteUrl();
  if (published) {
    const url = `${site}/projects/${published.slug}`;
    const og = published.hero_image_url ?? published.image_urls[0] ?? absoluteOgForProject(site, published.slug);
    return {
      title: `${published.title} | Projects | the9thedition`,
      description: published.excerpt ?? undefined,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        url,
        title: published.title,
        description: published.excerpt ?? undefined,
        images: [{ url: og }],
      },
      robots: { index: true, follow: true },
    };
  }
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Projects | the9thedition" };
  const article = getProjectArticle(project, getArchitectBySlug(project.architectSlug));
  const seo = article.seo;
  const url = `${site}/projects/${project.slug}`;
  const og = absoluteOgForProject(site, project.slug);
  return {
    title: seo?.title ?? `${project.title} | Projects | the9thedition`,
    description: seo?.description ?? project.excerpt,
    keywords: seo?.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: project.title,
      description: seo?.description ?? project.excerpt,
      images: [{ url: og, width: 1600, height: 900, alt: project.title }],
    },
    twitter: { card: "summary_large_image", title: project.title, description: seo?.description, images: [og] },
    robots: { index: true, follow: true },
    other: seo?.geo_region ? { "geo.region": seo.geo_region } : {},
  };
}

function absoluteOgForProject(site: string, slug: string) {
  const path = generatedImagePath("projects", slug, 0);
  return `${site.replace(/\/$/, "")}${path}`;
}

function LeadParagraph({ text }: { text: string }) {
  const lead = /^_([^_]+)_\s*/.exec(text);
  if (lead) {
    return (
      <p className="text-base leading-[1.75] text-charcoal/90 md:text-[17px]">
        <em className="text-charcoal/80">{lead[1]}</em> {text.slice(lead[0].length)}
      </p>
    );
  }
  return (
    <p className="text-base leading-[1.75] text-charcoal/90 md:text-[17px]">{text}</p>
  );
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const allPublished = await getPublishedProjects(280);
  const project = getProjectBySlug(slug);
  const published = project ? null : await getPublishedProjectBySlug(slug);
  if (!project && !published) {
    notFound();
  }

  if (published) {
    const parsedBlocks = normalizeLayoutBlocks(published.layout_blocks);
    const hasLead = parsedBlocks.some((b) => b.type === "LeadInquiryForm");
    const blocksWithLead: LayoutBlock[] = hasLead
      ? parsedBlocks
      : [...parsedBlocks, { id: "lead-default", type: "LeadInquiryForm", heading: "Enquire about this project" }];
    const form = (published.form_data ?? {}) as Record<string, string>;
    const imageCaptions = Array.isArray((published.form_data as Record<string, unknown> | null)?.imageCaptions)
      ? ((published.form_data as Record<string, unknown>).imageCaptions as string[])
      : [];
    const galleryImages = mergePublishedImages(published);
    const gen = generatedGalleryPaths("projects", published.slug);
    const heroSrc = published.hero_image_url ?? galleryImages[0] ?? gen[0]!;
    const videoUrl = published.video_links[0] ?? DEFAULT_YOUTUBE;
    const relatedPublished = pickRelatedPublished(published, allPublished);

    return (
      <>
        <SiteHeader />
        <article className="pb-20">
          <div className="container-premium pt-8">
            <nav className="text-xs uppercase tracking-[0.16em] text-muted">
              <Link href="/projects" className="hover:text-primary">
                Projects
              </Link>
              <span className="mx-2">/</span>
              <span className="text-charcoal/80">{published.category}</span>
            </nav>
            <h1 className="mt-4 max-w-4xl font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">{published.title}</h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
              <span className="uppercase tracking-[0.12em] text-primary">{published.category}</span>
              {published.location ? <span>{published.location}</span> : null}
              {published.byline ? <span>{published.byline}</span> : null}
            </div>
            {published.professional_slug ? (
              <p className="mt-2 text-sm text-charcoal/80">
                Professional profile:{" "}
                <Link href={`/professionals/${published.professional_slug}`} className="font-medium text-primary hover:underline">
                  Open profile
                </Link>
              </p>
            ) : null}
            <div className="mt-5">
              <LikeShareBar
                storageId={`project:${published.slug}`}
                sharePath={`/projects/${published.slug}`}
                title={published.title}
              />
            </div>
          </div>
          <div className="container-premium mt-8">
            <div className="relative aspect-[21/9] overflow-hidden rounded-xl bg-charcoal/5">
              <Image
                src={heroSrc}
                alt={published.title}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
                priority
                unoptimized={heroSrc.startsWith("/api/generated-image")}
              />
            </div>
          </div>
          <div className="container-premium mt-12 grid gap-12 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
              <section className="rounded-xl border border-primary/15 bg-surface p-4 text-sm">
                <h2 className="font-serif text-xl text-charcoal">Submission details</h2>
                <dl className="mt-3 space-y-2">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.12em] text-muted">Category</dt>
                    <dd>{published.category || "Project"}</dd>
                  </div>
                  {(published.form_data as Record<string, unknown> | null)?.projectType ? (
                    <div>
                      <dt className="text-xs uppercase tracking-[0.12em] text-muted">Type</dt>
                      <dd>{String((published.form_data as Record<string, unknown>).projectType)}</dd>
                    </div>
                  ) : null}
                  {published.location || form.projectLocation ? (
                    <div>
                      <dt className="text-xs uppercase tracking-[0.12em] text-muted">Location</dt>
                      <dd>{published.location || form.projectLocation}</dd>
                    </div>
                  ) : null}
                  {form.grossBuiltArea ? (
                    <div>
                      <dt className="text-xs uppercase tracking-[0.12em] text-muted">Area</dt>
                      <dd>{form.grossBuiltArea}</dd>
                    </div>
                  ) : null}
                  {form.completionYear ? (
                    <div>
                      <dt className="text-xs uppercase tracking-[0.12em] text-muted">Year</dt>
                      <dd>{form.completionYear}</dd>
                    </div>
                  ) : null}
                  {form.renderCredits ? (
                    <div>
                      <dt className="text-xs uppercase tracking-[0.12em] text-muted">Photographer Credits</dt>
                      <dd>{form.renderCredits}</dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            </aside>
            <div>
              {published.excerpt ? (
                <p className="font-serif text-xl italic leading-snug text-charcoal/85 md:text-2xl">{published.excerpt}</p>
              ) : null}
              <div className="mt-8">
                <BlockRenderer
                  blocks={blocksWithLead}
                  context={{ pageType: "project", slug: published.slug, title: published.title }}
                />
              </div>
              <div className="mt-6 space-y-6">
                <p className="text-base leading-[1.75] text-charcoal/90 md:text-[17px]">{published.content ?? ""}</p>
              </div>
              <ProjectGalleryPremium title={published.title} images={galleryImages} />
              {galleryImages.length ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {galleryImages.slice(0, 8).map((src, i) =>
                    imageCaptions[i] ? (
                      <p key={`${src}-${i}`} className="text-xs text-muted">
                        {imageCaptions[i]}
                      </p>
                    ) : null,
                  )}
                </div>
              ) : null}
              <ProjectVideoBlock url={videoUrl} title={`${published.title} — video`} />
              {published.external_links.length ? (
                <div className="mt-8 rounded-xl border border-primary/15 bg-surface p-4">
                  <h3 className="font-serif text-xl text-charcoal">Reference links</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {published.external_links.map((link) => (
                      <li key={link}>
                        <a href={link} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="mt-10 border-t border-charcoal/10 pt-8">
                <SaveProjectButton
                  slug={published.slug}
                  title={published.title}
                  imageUrl={published.hero_image_url ?? galleryImages[0] ?? generatedImagePath("projects", published.slug, 0)}
                />
              </div>
              {relatedPublished.length ? (
                <RelatedProjectsRail
                  items={toPublishedRailItems(relatedPublished)}
                  subheading="Same practice, category, or editorial family—scroll for more. We list up to 24 picks."
                />
              ) : null}
            </div>
          </div>
        </article>
      </>
    );
  }

  const staticProject = project;
  if (!staticProject) {
    notFound();
  }
  const architect = getArchitectBySlug(staticProject.architectSlug);
  const article = getProjectArticle(staticProject, architect);
  const related = getRelatedProjects(staticProject, 24);
  const relatedRailItems: RelatedProjectRailItem[] = related.map((p) => {
    const arch = getArchitectBySlug(p.architectSlug);
    return {
      slug: p.slug,
      title: p.title,
      category: p.category,
      image: generatedImagePath("projects", p.slug, 0),
      line2: arch ? `${arch.firm} · ${p.projectType}` : p.projectType,
    };
  });
  const urlPath = `/projects/${staticProject.slug}`;

  return (
    <>
      <ProjectPageJsonLd project={staticProject} article={article} urlPath={urlPath} />
      <SiteHeader />
      <article className="pb-20">
        <div className="container-premium pt-8">
          <nav className="text-xs uppercase tracking-[0.16em] text-muted">
            <Link href="/projects" className="hover:text-primary">
              Projects
            </Link>
            <span className="mx-2">/</span>
            <span className="text-charcoal/80">{staticProject.category}</span>
          </nav>
          <h1 className="article-lede mt-4 max-w-4xl font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">{staticProject.title}</h1>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
            <span className="uppercase tracking-[0.12em] text-primary">{staticProject.category}</span>
            <span className="text-charcoal/70">· {staticProject.projectType}</span>
            {staticProject.location ? <span>{staticProject.location}</span> : null}
            {staticProject.byline ? <span>{staticProject.byline}</span> : null}
          </div>
          {architect ? (
            <p className="mt-4 text-sm text-charcoal/85">
              <span className="text-muted">Architects:</span>{" "}
              <Link
                href={`/professionals/${architect.slug}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {architect.firm}
              </Link>
            </p>
          ) : null}
          <div className="mt-5">
            <LikeShareBar
              storageId={`project:${staticProject.slug}`}
              sharePath={urlPath}
              title={staticProject.title}
            />
          </div>
        </div>

        <GeneratedImageHero
          collection="projects"
          itemKey={staticProject.slug}
          index={0}
          title={staticProject.title}
          alt={article.imageAlts[0]}
          priority
        />

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
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                        {row.label}
                      </dt>
                      <dd className="mt-1 leading-snug text-charcoal/90">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <ProjectEnquiryForm projectSlug={staticProject.slug} projectTitle={staticProject.title} />
            </aside>

            <div className="article-body min-w-0">
              <p className="font-serif text-xl italic leading-snug text-charcoal/85 md:text-2xl">{article.dek}</p>

              <div className="mt-8 space-y-6">
                {article.paragraphs.map((p, i) => (
                  <LeadParagraph key={i} text={p} />
                ))}
              </div>

              <GeneratedImageGallery
                className="mt-12 border-t border-charcoal/10 pt-10"
                collection="projects"
                itemKey={staticProject.slug}
                title={staticProject.title}
                from={1}
                count={GENERATED_GALLERY_COUNT - 1}
                alts={article.imageAlts}
              />

              {article.media.videoUrl ? (
                <ProjectVideoBlock
                  url={article.media.videoUrl}
                  title={`${staticProject.title} — video`}
                  caption={article.media.videoCaption ?? "Editorial film selection (YouTube); replace with project-specific media when available."}
                />
              ) : null}

              {article.media.pdfUrl ? (
                <ProjectPdfBlock
                  url={article.media.pdfUrl}
                  label={article.media.pdfLabel?.trim() || "Project PDF"}
                  projectTitle={staticProject.title}
                />
              ) : null}

              <section className="mt-14 border-t border-charcoal/10 pt-10" aria-labelledby="project-faq-heading">
                <h2 id="project-faq-heading" className="font-serif text-2xl text-charcoal">
                  Questions & answers
                </h2>
                <p className="mt-2 text-sm text-muted">Structured for answer engines—verify facts with the design team for specification work.</p>
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
                  slug={staticProject.slug}
                  title={staticProject.title}
                  imageUrl={staticProject.image}
                />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="inline-flex rounded-full border border-primary/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal hover:border-primary"
                >
                  All projects
                </Link>
                {architect ? (
                  <Link
                    href={`/professionals/${architect.slug}`}
                    className="inline-flex rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                  >
                    More from {architect.firm}
                  </Link>
                ) : null}
              </div>

              {relatedRailItems.length ? (
                <RelatedProjectsRail
                  items={relatedRailItems}
                  subheading="Same category, typology, or architect—up to 24 projects. Use the arrows to scroll horizontally."
                />
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
