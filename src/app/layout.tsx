import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CookieConsent } from "@/components/cookie-consent";
import { HasSignedInMarker } from "@/components/has-signed-in-marker";
import { SiteFooter } from "@/components/site-footer";
import { SiteJsonLd } from "@/components/site-json-ld";
import { SITE_BRAND, SITE_DESCRIPTION } from "@/lib/site-metadata";
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
    default: `${SITE_BRAND} | Architecture, design & culture`,
    template: `%s | ${SITE_BRAND}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_BRAND,
  authors: [{ name: SITE_BRAND, url: siteUrl }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: SITE_BRAND,
    title: `${SITE_BRAND} | Architecture, design & culture`,
    description: SITE_DESCRIPTION,
    images: defaultOpenGraphImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_BRAND} | Architecture, design & culture`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: siteUrl },
  icons: {
    icon: [{ url: "/the9th-edition-logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full bg-background-light text-charcoal antialiased">
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
