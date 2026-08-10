import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/projects", "/projects/", "/professionals", "/articles", "/architecture-news", "/archive"],
        disallow: ["/admin", "/api/", "/login", "/me", "/settings", "/reset-password", "/auth/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/projects", "/projects/", "/professionals", "/articles", "/architecture-news", "/archive"],
        disallow: ["/admin", "/api/", "/login", "/me", "/settings", "/reset-password", "/auth/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
