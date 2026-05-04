import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    ],
  },
};

export default nextConfig;
