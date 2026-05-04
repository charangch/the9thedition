import type { ProjectArticle } from "@/lib/project-detail-content";
import type { ProjectEntry } from "@/lib/project-catalog";
import { absoluteGeneratedImageUrl, GENERATED_GALLERY_COUNT } from "@/lib/generated-media";
import { getSiteUrl } from "@/lib/site-url";

function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function ProjectPageJsonLd({
  project,
  article,
  urlPath,
}: {
  project: ProjectEntry;
  article: ProjectArticle;
  urlPath: string;
}) {
  const SITE = getSiteUrl();
  const url = `${SITE}${urlPath}`;
  const images = Array.from({ length: GENERATED_GALLERY_COUNT }, (_, i) =>
    absoluteGeneratedImageUrl(SITE, "projects", project.slug, i),
  );

  const seo = article.seo;
  const headline = seo?.title ?? `${project.title} | the9thedition`;

  const creative = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline,
    description: seo?.description ?? project.excerpt,
    image: images,
    dateModified: new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "the9thedition",
      url: SITE,
    },
    publisher: {
      "@type": "Organization",
      name: "the9thedition",
      logo: { "@type": "ImageObject", url: `${SITE}/the9th-edition-logo.png` },
    },
    keywords: seo?.keywords?.join(", ") ?? project.category,
    inLanguage: "en",
    ...(seo?.geo_region || project.location
      ? { spatialCoverage: { "@type": "Place", name: seo?.geo_region ?? project.location ?? "" } }
      : {}),
    about: [{ "@type": "Thing", name: project.category }, { "@type": "Thing", name: project.projectType }],
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE}/projects` },
      { "@type": "ListItem", position: 3, name: project.title, item: url },
    ],
  };

  const speakable = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: project.title,
    url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".article-lede", ".article-body", "h1"],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(creative) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(speakable) }} />
    </>
  );
}
