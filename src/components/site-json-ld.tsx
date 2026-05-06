import { navItems } from "@/lib/content";
import { SITE_BRAND, SITE_DESCRIPTION } from "@/lib/site-metadata";
import { getSiteUrl } from "@/lib/site-url";

function jsonLdScript(data: Record<string, unknown>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SiteJsonLd() {
  const base = getSiteUrl();

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_BRAND,
    url: base,
    description: SITE_DESCRIPTION,
    logo: `${base}/images/brand/edition-arch-logo.png`,
    sameAs: [
      "https://instagram.com",
      "https://linkedin.com",
      "https://youtube.com",
      "https://x.com",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_BRAND,
    url: base,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${base}#organization` },
    potentialAction: {
      "@type": "ReadAction",
      target: base,
    },
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

  const orgWithId = { ...organization, "@id": `${base}#organization` };

  return (
    <>
      {jsonLdScript(orgWithId)}
      {jsonLdScript(website)}
      {jsonLdScript(navigation)}
    </>
  );
}
