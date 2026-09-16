export const PRODUCTION_ORIGIN = "https://causeci.vercel.app";

/** Content revision date for crawlable marketing/guide URLs (ISO date). */
export const PUBLIC_LASTMOD = "2026-09-16";

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type PublicRoute = {
  path: string;
  changeFrequency: SitemapChangeFrequency;
  priority: number;
  lastModified?: string;
};

export const STATIC_PUBLIC_ROUTES: PublicRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/analyze", changeFrequency: "monthly", priority: 0.8 },
  { path: "/guides", changeFrequency: "weekly", priority: 0.8 },
];

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path.replace(/\/$/, "");
  const suffix = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${PRODUCTION_ORIGIN}${suffix}`;
}

export function robotsSitemapUrl(): string {
  return `${PRODUCTION_ORIGIN}/sitemap.xml`;
}
