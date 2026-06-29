import type { ArchitectureNewsItem } from "@/lib/architecture-news";
import { absoluteGeneratedImageUrl, GENERATED_GALLERY_COUNT } from "@/lib/generated-media";
import { getSiteUrl } from "@/lib/site-url";

function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function ArchitectureNewsArticleJsonLd({
  item,
  urlPath,
}: {
  item: ArchitectureNewsItem;
  urlPath: string;
}) {
  const SITE = getSiteUrl();
  const url = `${SITE}${urlPath}`;
  const published = item.published_at;
  const modified = item.date_modified;
  const images = Array.from({ length: GENERATED_GALLERY_COUNT }, (_, i) =>
    absoluteGeneratedImageUrl(SITE, "news", item.slug, i),
  );

  const newsArticle = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.seo_description,
    image: images,
    datePublished: published,
    dateModified: modified,
    author: {
      "@type": "Organization",
      name: item.author,
      url: SITE,
    },
    publisher: {
      "@type": "Organization",
      name: "the9thedition",
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/the9th-edition-logo.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: item.category,
    keywords: item.keywords.join(", "),
    inLanguage: "en",
    isAccessibleForFree: true,
    spatialCoverage: {
      "@type": "Place",
      name: item.geo_region,
    },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: item.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Architecture News",
        item: `${SITE}/architecture-news`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title,
        item: url,
      },
    ],
  };

  const speakable = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: item.title,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".article-lede", ".article-body", "h1"],
    },
    url,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(newsArticle) }} />
      {item.faq.length ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqPage) }} />
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(speakable) }} />
    </>
  );
}

export function ArchitectureNewsIndexJsonLd() {
  const SITE = getSiteUrl();
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "the9thedition",
    url: SITE,
    description: "Architecture news, construction industry updates, and building design analysis from the9thedition.",
    publisher: {
      "@type": "Organization",
      name: "the9thedition",
      url: SITE,
    },
    inLanguage: "en",
  };

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Architecture News",
    url: `${SITE}/architecture-news`,
    description:
      "Latest architecture and construction news: sustainability, urban development, materials, BIM, policy, and awards.",
    isPartOf: { "@type": "WebSite", name: "the9thedition", url: SITE },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(collection) }} />
    </>
  );
}
