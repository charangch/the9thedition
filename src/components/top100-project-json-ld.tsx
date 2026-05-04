import type { Top100Project } from "@/lib/top100-projects";
import { absoluteGeneratedImageUrl, GENERATED_GALLERY_COUNT } from "@/lib/generated-media";
import { getSiteUrl } from "@/lib/site-url";

function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function Top100ProjectJsonLd({ item, urlPath }: { item: Top100Project; urlPath: string }) {
  const SITE = getSiteUrl();
  const url = `${SITE}${urlPath}`;
  const images = Array.from({ length: GENERATED_GALLERY_COUNT }, (_, i) =>
    absoluteGeneratedImageUrl(SITE, "top100", item.slug, i),
  );

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.seo_description,
    image: images,
    datePublished: item.published_at,
    dateModified: item.date_modified,
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
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: "Top 100",
    keywords: item.keywords.join(", "),
    inLanguage: "en",
    isAccessibleForFree: true,
    about: [
      { "@type": "Thing", name: item.typology },
      { "@type": "Place", name: item.location, containedInPlace: { "@type": "Place", name: item.geo_region } },
    ],
    spatialCoverage: { "@type": "Place", name: item.geo_region },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: item.faq.map((f) => ({
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
      { "@type": "ListItem", position: 2, name: "Top 100", item: `${SITE}/top-100` },
      { "@type": "ListItem", position: 3, name: item.title, item: url },
    ],
  };

  const speakable = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: item.title,
    url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".article-lede", ".article-body", "h1"],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(speakable) }} />
    </>
  );
}

export function Top100IndexJsonLd({ total }: { total: number }) {
  const SITE = getSiteUrl();
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "the9thedition",
    url: SITE,
    description:
      "The Top 100 is a ranked editorial roadmap of benchmark architecture and design projects—structured for SEO, geographic discovery, and answer engines.",
    publisher: { "@type": "Organization", name: "the9thedition", url: SITE },
    inLanguage: "en",
  };

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Top 100",
    url: `${SITE}/top-100`,
    description: `A roadmap through ${total} influential projects with dossiers, FAQs, and structured metadata.`,
    isPartOf: { "@type": "WebSite", name: "the9thedition", url: SITE },
    numberOfItems: total,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(collection) }} />
    </>
  );
}
