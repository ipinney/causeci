import { describe, expect, it } from "vitest";
import {
  ACTION_INSTALL_PATH,
  ACTION_README_URL,
  ACTION_SOURCE_URL,
  GUIDES,
  getGuide,
  otherGuides,
} from "./guides";
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
      "/guides/npm-test-failed-github-actions",
      "/guides/eslint-failed-github-actions",
      "/guides/typescript-failed-github-actions",
      "/guides/pytest-failed-github-actions",
      "/guides/jest-failed-github-actions",
      ACTION_INSTALL_PATH,
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
    expect(GUIDES).toHaveLength(9);
    expect(new Set(GUIDES.map((guide) => guide.slug)).size).toBe(GUIDES.length);
    expect(new Set(GUIDES.map((guide) => guide.path)).size).toBe(GUIDES.length);
    for (const guide of GUIDES) {
      expect(guide.lede.length).toBeGreaterThan(40);
      expect(guide.sections.length).toBeGreaterThanOrEqual(3);
      expect(guide.faqs.length).toBeGreaterThanOrEqual(2);
      expect(guide.path.startsWith("/guides/")).toBe(true);
    }
  });

  it("documents the Action install path for strangers", () => {
    const guide = getGuide("install-github-action-failure-teaser");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe(ACTION_INSTALL_PATH);
    const yaml = guide?.sections.find((section) => section.code?.content.includes("uses: ipinney/causeci/action@main"));
    expect(yaml?.code?.content).toContain("if: failure()");
    expect(yaml?.code?.content).toContain("tee ci.log");
    expect(yaml?.code?.content).toContain("permissions:");
    const inputs = guide?.sections.find((section) => section.table);
    expect(inputs?.table?.headers).toEqual(["Name", "Default", "Purpose"]);
    expect(inputs?.table?.rows.some((row) => row[0] === "log-path")).toBe(true);
    const publicNote = guide?.sections.some((section) =>
      section.paragraphs.some(
        (paragraph) =>
          paragraph.includes("public repository") &&
          paragraph.includes("ipinney/causeci/action@main") &&
          paragraph.includes("Private caller"),
      ),
    );
    expect(publicNote).toBe(true);
    const stalePrivate = [guide?.lede, ...(guide?.sections.flatMap((section) => section.paragraphs) ?? []), ...(guide?.faqs.map((faq) => `${faq.question} ${faq.answer}`) ?? [])].some(
      (text) =>
        /currently private|until the repo is made public|until it is public/i.test(
          text ?? "",
        ),
    );
    expect(stalePrivate).toBe(false);
    expect(guide?.updatedAt).toBe("2026-09-18");
    const links = guide?.sections.flatMap((section) => section.links ?? []);
    expect(links?.some((link) => link.href === ACTION_SOURCE_URL)).toBe(true);
    expect(links?.some((link) => link.href === ACTION_README_URL)).toBe(true);
    expect(links?.some((link) => link.href === "/analyze")).toBe(true);
  });

  it("documents npm test vs lockfile for GitHub Actions", () => {
    const guide = getGuide("npm-test-failed-github-actions");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe("/guides/npm-test-failed-github-actions");
    expect(guide?.updatedAt).toBe("2026-09-18");
    expect(guide?.keywords).toEqual(
      expect.arrayContaining([
        "npm test failed GitHub Actions",
        "jest failed CI",
        "vitest FAIL CI",
        "Process completed with exit code 1",
      ]),
    );
    const body = [
      guide?.lede,
      ...(guide?.sections.flatMap((section) => [
        ...section.paragraphs,
        ...(section.list ?? []),
        section.code?.content ?? "",
      ]) ?? []),
      ...(guide?.faqs.map((faq) => `${faq.question} ${faq.answer}`) ?? []),
    ].join("\n");
    expect(body).toMatch(/lockfile/i);
    expect(body).toMatch(/vitest FAIL/i);
    expect(body).toContain("/analyze");
    expect(body).toContain(ACTION_INSTALL_PATH);
    expect(body).toMatch(/not a Marketplace publish|not on the Marketplace/i);
    expect(body).not.toMatch(/listed on the Marketplace|published to the Marketplace/i);
    const links = guide?.sections.flatMap((section) => section.links ?? []);
    expect(links?.some((link) => link.href === "/analyze")).toBe(true);
    expect(links?.some((link) => link.href === ACTION_INSTALL_PATH)).toBe(true);
  });

  it("documents ESLint vs config/plugin install for GitHub Actions", () => {
    const guide = getGuide("eslint-failed-github-actions");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe("/guides/eslint-failed-github-actions");
    expect(guide?.updatedAt).toBe("2026-09-19");
    expect(guide?.keywords).toEqual(
      expect.arrayContaining([
        "eslint failed GitHub Actions",
        "ESLint Process completed with exit code 1",
        "npm run lint failed CI",
        "Process completed with exit code 1",
      ]),
    );
    const body = [
      guide?.lede,
      ...(guide?.sections.flatMap((section) => [
        ...section.paragraphs,
        ...(section.list ?? []),
        section.code?.content ?? "",
      ]) ?? []),
      ...(guide?.faqs.map((faq) => `${faq.question} ${faq.answer}`) ?? []),
    ].join("\n");
    expect(body).toMatch(/Failed to load (config|plugin)|Cannot find module/i);
    expect(body).toMatch(/✖/);
    expect(body).toMatch(/frozen lockfile|npm ci/i);
    expect(body).toContain("/analyze");
    expect(body).toContain(ACTION_INSTALL_PATH);
    expect(body).toContain("ipinney/causeci/action@main");
    expect(body).toMatch(/not a Marketplace publish|not on the Marketplace/i);
    expect(body).not.toMatch(/listed on the Marketplace|published to the Marketplace/i);
    const links = guide?.sections.flatMap((section) => section.links ?? []);
    expect(links?.some((link) => link.href === "/analyze")).toBe(true);
    expect(links?.some((link) => link.href === ACTION_INSTALL_PATH)).toBe(true);
  });

  it("documents TypeScript vs install/node_modules for GitHub Actions", () => {
    const guide = getGuide("typescript-failed-github-actions");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe("/guides/typescript-failed-github-actions");
    expect(guide?.updatedAt).toBe("2026-09-21");
    expect(guide?.keywords).toEqual(
      expect.arrayContaining([
        "typescript failed GitHub Actions",
        "tsc failed CI",
        "npx tsc --noEmit failed",
        "Process completed with exit code 1",
      ]),
    );
    const body = [
      guide?.lede,
      ...(guide?.sections.flatMap((section) => [
        ...section.paragraphs,
        ...(section.list ?? []),
        section.code?.content ?? "",
      ]) ?? []),
      ...(guide?.faqs.map((faq) => `${faq.question} ${faq.answer}`) ?? []),
    ].join("\n");
    expect(body).toMatch(/error TS|Type error:/i);
    expect(body).toMatch(/node_modules|Cannot find module 'typescript'/i);
    expect(body).toMatch(/npx tsc --noEmit|npm run build/i);
    expect(body).toMatch(/frozen lockfile|npm ci/i);
    expect(body).toContain("/analyze");
    expect(body).toContain(ACTION_INSTALL_PATH);
    expect(body).toContain("ipinney/causeci/action@main");
    expect(body).toMatch(/not a Marketplace publish|not on the Marketplace/i);
    expect(body).not.toMatch(/listed on the Marketplace|published to the Marketplace/i);
    const links = guide?.sections.flatMap((section) => section.links ?? []);
    expect(links?.some((link) => link.href === "/analyze")).toBe(true);
    expect(links?.some((link) => link.href === ACTION_INSTALL_PATH)).toBe(true);
  });

  it("documents pytest vs pip install / requirements for GitHub Actions", () => {
    const guide = getGuide("pytest-failed-github-actions");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe("/guides/pytest-failed-github-actions");
    expect(guide?.updatedAt).toBe("2026-09-22");
    expect(guide?.keywords).toEqual(
      expect.arrayContaining([
        "pytest failed GitHub Actions",
        "pytest failed CI",
        "Process completed with exit code 1",
        "FAILED tests",
        "pip install / requirements drift",
      ]),
    );
    const body = [
      guide?.lede,
      ...(guide?.sections.flatMap((section) => [
        ...section.paragraphs,
        ...(section.list ?? []),
        section.code?.content ?? "",
      ]) ?? []),
      ...(guide?.faqs.map((faq) => `${faq.question} ${faq.answer}`) ?? []),
    ].join("\n");
    expect(body).toMatch(/FAILED/);
    expect(body).toMatch(/pip install|requirements/i);
    expect(body).toMatch(/assert|AssertionError/i);
    expect(body).toContain("/analyze");
    expect(body).toContain(ACTION_INSTALL_PATH);
    expect(body).toContain("ipinney/causeci/action@main");
    expect(body).toMatch(/not a Marketplace publish|not on the Marketplace/i);
    expect(body).not.toMatch(/listed on the Marketplace|published to the Marketplace/i);
    const links = guide?.sections.flatMap((section) => section.links ?? []);
    expect(links?.some((link) => link.href === "/analyze")).toBe(true);
    expect(links?.some((link) => link.href === ACTION_INSTALL_PATH)).toBe(true);
  });

  it("documents Jest vs npm ci / node_modules for GitHub Actions", () => {
    const guide = getGuide("jest-failed-github-actions");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe("/guides/jest-failed-github-actions");
    expect(guide?.updatedAt).toBe("2026-09-23");
    expect(guide?.keywords).toEqual(
      expect.arrayContaining([
        "jest failed GitHub Actions",
        "jest failed CI",
        "Process completed with exit code 1",
        "Test Suites failed",
        "npm ci / node_modules drift",
      ]),
    );
    const body = [
      guide?.lede,
      ...(guide?.sections.flatMap((section) => [
        ...section.paragraphs,
        ...(section.list ?? []),
        section.code?.content ?? "",
      ]) ?? []),
      ...(guide?.faqs.map((faq) => `${faq.question} ${faq.answer}`) ?? []),
    ].join("\n");
    expect(body).toMatch(/FAIL path/);
    expect(body).toMatch(/Expected/);
    expect(body).toMatch(/Received/);
    expect(body).toMatch(/Test Suites: N failed/);
    expect(body).toMatch(/node_modules/);
    expect(body).toMatch(/npm ci && npx jest/);
    expect(body).toMatch(/npm test/);
    expect(body).toContain("Process completed with exit code 1");
    expect(body).toContain("/analyze");
    expect(body).toContain(ACTION_INSTALL_PATH);
    expect(body).toContain("ipinney/causeci/action@main");
    expect(body).toMatch(/not a Marketplace publish|not on the Marketplace/i);
    expect(body).not.toMatch(/listed on the Marketplace|published to the Marketplace/i);
    const links = guide?.sections.flatMap((section) => section.links ?? []) ?? [];
    expect(links.some((link) => link.href === "/analyze")).toBe(true);
    expect(links.some((link) => link.href === ACTION_INSTALL_PATH)).toBe(true);
    for (const href of [
      "/guides/npm-test-failed-github-actions",
      "/guides/typescript-failed-github-actions",
      "/guides/eslint-failed-github-actions",
      "/guides/pytest-failed-github-actions",
      "/guides/explain-github-actions-failure",
    ]) {
      expect(links.some((link) => link.href === href)).toBe(true);
    }
    const related = otherGuides("jest-failed-github-actions").map((item) => item.slug);
    expect(related).toEqual(
      expect.arrayContaining([
        "npm-test-failed-github-actions",
        "typescript-failed-github-actions",
        "eslint-failed-github-actions",
        "pytest-failed-github-actions",
        "install-github-action-failure-teaser",
        "explain-github-actions-failure",
      ]),
    );
    expect(related).not.toContain("jest-failed-github-actions");
  });
});
