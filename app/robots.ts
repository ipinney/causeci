import type { MetadataRoute } from "next";
import { PRODUCTION_ORIGIN, robotsSitemapUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/jobs/", "/api/"],
    },
    sitemap: robotsSitemapUrl(),
    host: PRODUCTION_ORIGIN.replace(/^https:\/\//, ""),
  };
}
