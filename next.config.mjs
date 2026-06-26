import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function insforgeImagePattern() {
  const raw = process.env.NEXT_PUBLIC_INSFORGE_URL?.trim();
  if (!raw) return null;
  try {
    const { protocol, hostname } = new URL(raw);
    if (!hostname) return null;
    return { protocol: protocol.replace(":", ""), hostname };
  } catch {
    return null;
  }
}

const insforgePattern = insforgeImagePattern();

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/news", destination: "/architecture-news", permanent: true },
      { source: "/news/:slug", destination: "/architecture-news/:slug", permanent: true },
      {
        source: "/documents/the9thedition-project-submission-template.pdf",
        destination: "/documents/the9thedition-premium-submission-template.pdf",
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.insforge.app",
      },
      ...(insforgePattern ? [insforgePattern] : []),
    ],
    localPatterns: [
      {
        pathname: "/api/generated-image",
      },
      {
        pathname: "/the9th-edition-logo.png",
      },
      { pathname: "/images/brand/edition-arch-logo.png" },
      { pathname: "/images/brand/**" },
      { pathname: "/images/projects/**" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

const sentryOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
};

export default process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
  ? withSentryConfig(nextConfig, sentryOptions)
  : nextConfig;
