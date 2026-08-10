import { navItems } from "@/lib/content";
import { SITE_SECTIONS } from "@/lib/site-sections";
import { SITE_BRAND, SITE_DESCRIPTION } from "@/lib/site-metadata";
import { SITE_FACEBOOK_URL, SITE_INSTAGRAM_URL } from "@/lib/site-social";
import { getSiteUrl } from "@/lib/site-url";

function jsonLdScript(data: Record<string, unknown>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function SiteJsonLd() {
  const base = getSiteUrl();

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: SITE_BRAND,
    alternateName: ["the9thedition", "theninthedition", "The 9th Edition"],
    url: base,
    description: SITE_DESCRIPTION,
    logo: `${base}/images/brand/edition-arch-logo.png`,
    sameAs: [SITE_INSTAGRAM_URL, SITE_FACEBOOK_URL, "https://linkedin.com", "https://youtube.com", "https://x.com"],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: SITE_BRAND,
    alternateName: ["the9thedition", "theninthedition"],
    url: base,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${base}/#organization` },
    inLanguage: "en",
    hasPart: SITE_SECTIONS.map((section) => ({
      "@type": "WebPage",
      "@id": `${base}${section.href}`,
      name: section.title,
      url: `${base}${section.href}`,
      description: section.description,
    })),
  };

  const navigation = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_BRAND} primary navigation`,
    itemListElement: navItems.map((item, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: item.label,
      url: `${base}${item.href === "/" ? "" : item.href}`,
    })),
  };

  return (
    <>
      {jsonLdScript(organization)}
      {jsonLdScript(website)}
      {jsonLdScript(navigation)}
    </>
  );
}
