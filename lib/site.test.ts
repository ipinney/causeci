import { describe, expect, it } from "vitest";
import { GUIDES } from "./guides";
import {
  PRODUCTION_ORIGIN,
  absoluteUrl,
  robotsSitemapUrl,
} from "./site";
import { allGuidePaths, sitemapEntries, sitemapPaths } from "./sitemap";

describe("public SEO routes", () => {
  it("advertises the production sitemap on causeci.vercel.app", () => {
    expect(PRODUCTION_ORIGIN).toBe("https://causeci.vercel.app");
    expect(robotsSitemapUrl()).toBe("https://causeci.vercel.app/sitemap.xml");
    expect(absoluteUrl("/")).toBe("https://causeci.vercel.app");
    expect(absoluteUrl("/guides")).toBe("https://causeci.vercel.app/guides");
  });

  it("lists home, analyze, guides hub, and each guide — never jobs or API", () => {
    const paths = sitemapPaths();
    expect(paths).toEqual([
      "/",
      "/analyze",
      "/guides",
      "/guides/explain-github-actions-failure",
      "/guides/ci-log-root-cause",
      "/guides/gitlab-circleci-failure-autopsy",
    ]);
    expect(paths.some((path) => path.startsWith("/jobs"))).toBe(false);
    expect(paths.some((path) => path.startsWith("/api"))).toBe(false);
    expect(allGuidePaths()).toEqual(GUIDES.map((guide) => guide.path));
  });

  it("emits absolute production URLs with lastmod and priority", () => {
    const entries = sitemapEntries();
    expect(entries[0]).toMatchObject({
      url: "https://causeci.vercel.app",
      changeFrequency: "weekly",
      priority: 1,
    });
    for (const entry of entries) {
      expect(entry.url.startsWith("https://causeci.vercel.app")).toBe(true);
      expect(entry.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("keeps each guide useful: lede, sections, CTA-related FAQ, and a paste path", () => {
    expect(GUIDES).toHaveLength(3);
    for (const guide of GUIDES) {
      expect(guide.lede.length).toBeGreaterThan(40);
      expect(guide.sections.length).toBeGreaterThanOrEqual(3);
      expect(guide.faqs.length).toBeGreaterThanOrEqual(2);
      expect(guide.path.startsWith("/guides/")).toBe(true);
    }
  });
});
