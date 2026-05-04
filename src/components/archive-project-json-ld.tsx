import type { ArchiveProject } from "@/lib/archive-projects";
import { absoluteGeneratedImageUrl, GENERATED_GALLERY_COUNT } from "@/lib/generated-media";
import { getSiteUrl } from "@/lib/site-url";

function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function ArchiveProjectJsonLd({ item, path }: { item: ArchiveProject; path: string }) {
  const SITE = getSiteUrl();
  const url = `${SITE}${path}`;
  const images = Array.from({ length: GENERATED_GALLERY_COUNT }, (_, i) =>
    absoluteGeneratedImageUrl(SITE, "archive", item.slug, i),
  );

  const project = {
    "@context": "https://schema.org",
    "@type": "Project",
    name: item.title,
    description: item.seo_description,
    url,
    image: images,
    dateCreated: item.published_at,
    dateModified: item.date_modified,
    keywords: item.keywords.join(", "),
    spatialCoverage: {
      "@type": "Place",
      name: item.location,
      containedInPlace: { "@type": "Place", name: item.geo_region },
    },
    about: {
      "@type": "Thing",
      name: item.category,
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Archive", item: `${SITE}/archive` },
      { "@type": "ListItem", position: 3, name: item.title, item: url },
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: item.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const speakable = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: item.title,
    url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".archive-lede", ".article-body", "h1"],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(project) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(speakable) }} />
    </>
  );
}

export function ArchiveIndexJsonLd() {
  const SITE = getSiteUrl();
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Project Archive",
    url: `${SITE}/archive`,
    description:
      "Searchable architecture project archive: cultural, residential, educational, and civic works with editorial metadata for SEO, GEO, and answer engines.",
    isPartOf: { "@type": "WebSite", name: "the9thedition", url: SITE },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(collection) }} />;
}
