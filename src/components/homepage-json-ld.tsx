import { SITE_SECTIONS } from "@/lib/site-sections";
import { SITE_HOME_TITLE, SITE_DESCRIPTION } from "@/lib/site-metadata";
import { getSiteUrl } from "@/lib/site-url";

function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Homepage-only structured data to help Google show rich results and sitelinks. */
export function HomepageJsonLd() {
  const base = getSiteUrl();

  const homePage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${base}/#homepage`,
    url: `${base}/`,
    name: SITE_HOME_TITLE,
    description: SITE_DESCRIPTION,
    isPartOf: { "@id": `${base}/#website` },
    about: { "@id": `${base}/#organization` },
    inLanguage: "en",
  };

  const sectionList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_BRAND} sections`,
    itemListElement: SITE_SECTIONS.map((section, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "WebPage",
        "@id": `${base}${section.href}`,
        name: section.title,
        url: `${base}${section.href}`,
        description: section.description,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(homePage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(sectionList) }} />
    </>
  );
}
