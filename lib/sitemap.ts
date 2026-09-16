import { GUIDES, guideRoutes } from "./guides";
import {
  PUBLIC_LASTMOD,
  STATIC_PUBLIC_ROUTES,
  absoluteUrl,
  type PublicRoute,
} from "./site";

export type SitemapEntry = {
  url: string;
  lastModified: string;
  changeFrequency: PublicRoute["changeFrequency"];
  priority: number;
};

export function publicRoutes(): PublicRoute[] {
  return [...STATIC_PUBLIC_ROUTES, ...guideRoutes()];
}

export function sitemapEntries(): SitemapEntry[] {
  return publicRoutes().map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: route.lastModified ?? PUBLIC_LASTMOD,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

export function sitemapPaths(): string[] {
  return publicRoutes().map((route) => route.path);
}

export function allGuidePaths(): string[] {
  return GUIDES.map((guide) => guide.path);
}
