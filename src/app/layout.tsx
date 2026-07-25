import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CookieConsent } from "@/components/cookie-consent";
import { HasSignedInMarker } from "@/components/has-signed-in-marker";
import { SiteFooter } from "@/components/site-footer";
import { SiteJsonLd } from "@/components/site-json-ld";
import { SITE_BRAND, SITE_DESCRIPTION, SITE_KEYWORDS } from "@/lib/site-metadata";
import { defaultOpenGraphImages } from "@/lib/seo-metadata";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "the9thedition | The 9th Edition — Architecture, Design & Culture",
    template: `%s | ${SITE_BRAND}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_BRAND,
  authors: [{ name: SITE_BRAND, url: siteUrl }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: SITE_BRAND,
    title: "the9thedition | The 9th Edition — Architecture, Design & Culture",
    description: SITE_DESCRIPTION,
    images: defaultOpenGraphImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: "the9thedition | The 9th Edition — Architecture, Design & Culture",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "google1c6f87315d8d961e",
  },
  icons: {
    icon: [{ url: "/the9th-edition-logo.png", type: "image/png" }],
  },
};

const GTM_ID = "GTM-KRBFJSTK";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className="min-h-full bg-background-light text-charcoal antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <SiteJsonLd />
        <div className="flex min-h-full flex-col">
          <HasSignedInMarker />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <CookieConsent />
        </div>
      </body>
    </html>
  );
}
