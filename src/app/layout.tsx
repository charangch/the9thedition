import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CookieConsent } from "@/components/cookie-consent";
import { HasSignedInMarker } from "@/components/has-signed-in-marker";
import { SiteFooter } from "@/components/site-footer";
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

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "the9thedition",
  description: "Premium architecture, design, and culture platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full bg-background-light text-charcoal antialiased">
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
