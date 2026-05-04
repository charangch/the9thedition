import type { EditorialArticle } from "@/lib/editorial-articles";
import { absoluteGeneratedImageUrl, GENERATED_GALLERY_COUNT } from "@/lib/generated-media";
import { getSiteUrl } from "@/lib/site-url";

function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function EditorialArticleJsonLd({
  item,
  urlPath,
}: {
  item: EditorialArticle;
  urlPath: string;
}) {
  const SITE = getSiteUrl();
  const url = `${SITE}${urlPath}`;
  const images = Array.from({ length: GENERATED_GALLERY_COUNT }, (_, i) =>
    absoluteGeneratedImageUrl(SITE, "articles", item.slug, i),
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
    about: [{ "@type": "Thing", name: item.focus_entity }],
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
        name: "Articles",
        item: `${SITE}/articles`,
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(speakable) }} />
    </>
  );
}

export function EditorialArticlesIndexJsonLd({ total }: { total: number }) {
  const SITE = getSiteUrl();
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "the9thedition",
    url: SITE,
    description:
      "Long-form articles on architects, houses, and building products—structured for search, geographic context, and answer engines.",
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
    name: "Articles",
    url: `${SITE}/articles`,
    description: `Editorial library of ${total}+ articles covering architecture practices, residential design, and product specification.`,
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
