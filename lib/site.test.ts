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
      "/guides/vitest-failed-github-actions",
      "/guides/playwright-failed-github-actions",
      "/guides/cypress-failed-github-actions",
      "/guides/go-test-failed-github-actions",
      "/guides/rust-test-failed-github-actions",
      "/guides/maven-test-failed-github-actions",
      "/guides/gradle-test-failed-github-actions",
      "/guides/phpunit-failed-github-actions",
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
    expect(GUIDES).toHaveLength(17);
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

  it("documents Vitest vs npm ci / lockfile for GitHub Actions", () => {
    const guide = getGuide("vitest-failed-github-actions");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe("/guides/vitest-failed-github-actions");
    expect(guide?.updatedAt).toBe("2026-09-24");
    expect(guide?.keywords).toEqual(
      expect.arrayContaining([
        "vitest failed GitHub Actions",
        "vitest FAIL CI",
        "vitest Process completed with exit code 1",
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
    expect(body).toMatch(/FAIL  /);
    expect(body).toMatch(/AssertionError/);
    expect(body).toMatch(/RUN  v/);
    expect(body).toMatch(/npx vitest run/);
    expect(body).toMatch(/npm test/);
    expect(body).toMatch(/npm ci/);
    expect(body).toMatch(/lockfile/i);
    expect(body).toMatch(/jsdom/);
    expect(body).toMatch(/happy-dom/);
    expect(body).toMatch(/snapshot/i);
    expect(body).toMatch(/timed out/i);
    expect(body).toMatch(/pool=forks|forks pool/);
    expect(body).toMatch(/Failed to resolve import/);
    expect(body).toMatch(/\[vite:esbuild\] Transform failed/);
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
      "/guides/jest-failed-github-actions",
      "/guides/npm-test-failed-github-actions",
      "/guides/typescript-failed-github-actions",
      "/guides/eslint-failed-github-actions",
      "/guides/pytest-failed-github-actions",
      "/guides/explain-github-actions-failure",
    ]) {
      expect(links.some((link) => link.href === href)).toBe(true);
    }
    const related = otherGuides("vitest-failed-github-actions").map((item) => item.slug);
    expect(related).toEqual(
      expect.arrayContaining([
        "jest-failed-github-actions",
        "npm-test-failed-github-actions",
        "typescript-failed-github-actions",
        "eslint-failed-github-actions",
        "pytest-failed-github-actions",
        "install-github-action-failure-teaser",
        "explain-github-actions-failure",
      ]),
    );
    expect(related).not.toContain("vitest-failed-github-actions");
  });

  it("documents Playwright vs browser install for GitHub Actions", () => {
    const guide = getGuide("playwright-failed-github-actions");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe("/guides/playwright-failed-github-actions");
    expect(guide?.updatedAt).toBe("2026-09-25");
    expect(guide?.keywords).toEqual(
      expect.arrayContaining([
        "playwright failed GitHub Actions",
        "playwright test failed CI",
        "playwright Process completed with exit code 1",
        "Process completed with exit code 1",
        "npx playwright test failed",
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
    expect(body).toMatch(/npx playwright test/);
    expect(body).toMatch(/npx playwright install --with-deps/);
    expect(body).toMatch(/Executable doesn't exist/);
    expect(body).toMatch(/Host system is missing dependencies/);
    expect(body).toMatch(/browserType\.launch/);
    expect(body).toMatch(/headless/);
    expect(body).toMatch(/xvfb-run/);
    expect(body).toMatch(/Test timeout of 30000ms exceeded/);
    expect(body).toMatch(/webServer/);
    expect(body).toMatch(/flaky/);
    expect(body).toMatch(/trace\.zip/);
    expect(body).toMatch(/playwright-report/);
    expect(body).toMatch(/toHaveScreenshot|snapshot doesn't exist/);
    expect(body).toMatch(/linux\.png/);
    expect(body).toMatch(/@playwright\/test/);
    expect(body).toMatch(/npm ci/);
    expect(body).toContain("Process completed with exit code 1");
    expect(body).toContain("/analyze");
    expect(body).toContain("/guides");
    expect(body).toContain(ACTION_INSTALL_PATH);
    expect(body).toContain("ipinney/causeci/action@main");
    expect(body).toMatch(/not a Marketplace publish|not on the Marketplace/i);
    expect(body).not.toMatch(/listed on the Marketplace|published to the Marketplace/i);
    const links = guide?.sections.flatMap((section) => section.links ?? []) ?? [];
    expect(links.some((link) => link.href === "/analyze")).toBe(true);
    expect(links.some((link) => link.href === ACTION_INSTALL_PATH)).toBe(true);
    expect(links.some((link) => link.href === "/guides")).toBe(true);
    for (const href of [
      "/guides/vitest-failed-github-actions",
      "/guides/jest-failed-github-actions",
      "/guides/npm-test-failed-github-actions",
      "/guides/typescript-failed-github-actions",
      "/guides/eslint-failed-github-actions",
      "/guides/pytest-failed-github-actions",
      "/guides/explain-github-actions-failure",
    ]) {
      expect(links.some((link) => link.href === href)).toBe(true);
    }
    const related = otherGuides("playwright-failed-github-actions").map((item) => item.slug);
    expect(related).toEqual(
      expect.arrayContaining([
        "vitest-failed-github-actions",
        "jest-failed-github-actions",
        "npm-test-failed-github-actions",
        "typescript-failed-github-actions",
        "eslint-failed-github-actions",
        "pytest-failed-github-actions",
        "install-github-action-failure-teaser",
        "explain-github-actions-failure",
      ]),
    );
    expect(related).not.toContain("playwright-failed-github-actions");
  });

  it("documents Cypress vs binary install for GitHub Actions", () => {
    const guide = getGuide("cypress-failed-github-actions");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe("/guides/cypress-failed-github-actions");
    expect(guide?.updatedAt).toBe("2026-09-26");
    expect(guide?.keywords).toEqual(
      expect.arrayContaining([
        "cypress failed GitHub Actions",
        "cypress run failed CI",
        "cypress Process completed with exit code 1",
        "Process completed with exit code 1",
        "npx cypress run failed",
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
    expect(body).toMatch(/npx cypress run/);
    expect(body).toMatch(/The cypress npm package is installed, but the Cypress binary is missing/);
    expect(body).toMatch(/cypress install/);
    expect(body).toMatch(/does not match the expected package version/);
    expect(body).toMatch(/Cypress could not verify that this server is running/);
    expect(body).toMatch(/CYPRESS_BASE_URL/);
    expect(body).toMatch(/Timed out retrying after 4000ms/);
    expect(body).toMatch(/Your system is missing the dependency: Xvfb/);
    expect(body).toMatch(/cypress\/screenshots/);
    expect(body).toMatch(/cypress\/videos/);
    expect(body).toMatch(/video: true/);
    expect(body).toMatch(/CYPRESS_RECORD_KEY/);
    expect(body).toMatch(/--record/);
    expect(body).toMatch(/--parallel/);
    expect(body).toMatch(/headed/);
    expect(body).toMatch(/retries\.runMode/);
    expect(body).toMatch(/\(Attempt 2 of 3\)/);
    expect(body).toMatch(/npm ci/);
    expect(body).toContain("Process completed with exit code 1");
    expect(body).toContain("/analyze");
    expect(body).toContain("/guides");
    expect(body).toContain(ACTION_INSTALL_PATH);
    expect(body).toContain("ipinney/causeci/action@main");
    expect(body).toMatch(/not a Marketplace publish|not on the Marketplace/i);
    expect(body).not.toMatch(/listed on the Marketplace|published to the Marketplace/i);
    const links = guide?.sections.flatMap((section) => section.links ?? []) ?? [];
    expect(links.some((link) => link.href === "/analyze")).toBe(true);
    expect(links.some((link) => link.href === ACTION_INSTALL_PATH)).toBe(true);
    expect(links.some((link) => link.href === "/guides")).toBe(true);
    for (const href of [
      "/guides/playwright-failed-github-actions",
      "/guides/vitest-failed-github-actions",
      "/guides/jest-failed-github-actions",
      "/guides/npm-test-failed-github-actions",
      "/guides/typescript-failed-github-actions",
      "/guides/eslint-failed-github-actions",
      "/guides/pytest-failed-github-actions",
      "/guides/explain-github-actions-failure",
    ]) {
      expect(links.some((link) => link.href === href)).toBe(true);
    }
    const related = otherGuides("cypress-failed-github-actions").map((item) => item.slug);
    expect(related).toEqual(
      expect.arrayContaining([
        "playwright-failed-github-actions",
        "vitest-failed-github-actions",
        "jest-failed-github-actions",
        "npm-test-failed-github-actions",
        "typescript-failed-github-actions",
        "eslint-failed-github-actions",
        "pytest-failed-github-actions",
        "install-github-action-failure-teaser",
        "explain-github-actions-failure",
      ]),
    );
    expect(related).not.toContain("cypress-failed-github-actions");
  });

  it("documents go test vs module and build-constraint failures for GitHub Actions", () => {
    const guide = getGuide("go-test-failed-github-actions");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe("/guides/go-test-failed-github-actions");
    expect(guide?.updatedAt).toBe("2026-09-27");
    expect(guide?.keywords).toEqual(
      expect.arrayContaining([
        "go test failed GitHub Actions",
        "go test Process completed with exit code 1",
        "go test ./... failed CI",
        "module cache / go.sum drift",
        "build constraints",
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
    expect(body).toMatch(/go test \.\/\.\.\./);
    expect(body).toMatch(/--- FAIL:/);
    expect(body).toMatch(/\[build failed\]/);
    expect(body).toMatch(/missing go\.sum entry/);
    expect(body).toMatch(/inconsistent vendoring/);
    expect(body).toMatch(/is not in std/);
    expect(body).toMatch(/from \$GOROOT/);
    expect(body).toMatch(/from \$GOPATH/);
    expect(body).toMatch(/build constraints exclude all Go files/);
    expect(body).toMatch(/GOTOOLCHAIN=local/);
    expect(body).toMatch(/go: go\.mod requires go >=/);
    expect(body).toMatch(/actions\/setup-go/);
    expect(body).toMatch(/CGO_ENABLED/);
    expect(body).toMatch(/-race requires cgo/);
    expect(body).toMatch(/DATA RACE/);
    expect(body).toMatch(/go mod tidy/);
    expect(body).toContain("Process completed with exit code 1");
    expect(body).toContain("/analyze");
    expect(body).toContain("/guides");
    expect(body).toContain(ACTION_INSTALL_PATH);
    expect(body).toContain("ipinney/causeci/action@main");
    expect(body).toMatch(/not a Marketplace publish|not on the Marketplace/i);
    expect(body).not.toMatch(/listed on the Marketplace|published to the Marketplace/i);
    const links = guide?.sections.flatMap((section) => section.links ?? []) ?? [];
    expect(links.some((link) => link.href === "/analyze")).toBe(true);
    expect(links.some((link) => link.href === ACTION_INSTALL_PATH)).toBe(true);
    expect(links.some((link) => link.href === "/guides")).toBe(true);
    for (const href of [
      "/guides/cypress-failed-github-actions",
      "/guides/playwright-failed-github-actions",
      "/guides/vitest-failed-github-actions",
      "/guides/jest-failed-github-actions",
      "/guides/npm-test-failed-github-actions",
      "/guides/typescript-failed-github-actions",
      "/guides/eslint-failed-github-actions",
      "/guides/pytest-failed-github-actions",
      "/guides/explain-github-actions-failure",
    ]) {
      expect(links.some((link) => link.href === href)).toBe(true);
    }
    const related = otherGuides("go-test-failed-github-actions").map((item) => item.slug);
    expect(related).toEqual(
      expect.arrayContaining([
        "cypress-failed-github-actions",
        "playwright-failed-github-actions",
        "vitest-failed-github-actions",
        "jest-failed-github-actions",
        "npm-test-failed-github-actions",
        "typescript-failed-github-actions",
        "eslint-failed-github-actions",
        "pytest-failed-github-actions",
        "install-github-action-failure-teaser",
        "explain-github-actions-failure",
      ]),
    );
    expect(related).not.toContain("go-test-failed-github-actions");
    expect(GUIDES.at(-1)?.slug).toBe("install-github-action-failure-teaser");
  });

  it("documents cargo test vs registry, cache, and toolchain failures for GitHub Actions", () => {
    const guide = getGuide("rust-test-failed-github-actions");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe("/guides/rust-test-failed-github-actions");
    expect(guide?.updatedAt).toBe("2026-09-28");
    expect(guide?.keywords).toEqual(
      expect.arrayContaining([
        "cargo test failed GitHub Actions",
        "cargo test Process completed with exit code 1",
        "cargo test --locked failed CI",
        "registry / Cargo.lock / cache drift",
        "rustup / dtolnay toolchain",
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
    expect(body).toMatch(/cargo test --locked/);
    expect(body).toMatch(/test result: FAILED/);
    expect(body).toMatch(/panicked at/);
    expect(body).toMatch(/assertion `left == right` failed/);
    expect(body).toMatch(/error: test failed, to rerun pass `--lib`/);
    expect(body).toMatch(/error: could not compile/);
    expect(body).toMatch(/error\[E0425\]/);
    expect(body).toMatch(/--locked was passed to prevent this/);
    expect(body).toMatch(/perhaps a crate was updated and forgotten to be re-vendored\?/);
    expect(body).toMatch(/dtolnay\/rust-toolchain/);
    expect(body).toMatch(/actions-rs\/toolchain/);
    expect(body).toMatch(/rustup could not choose a version of cargo/);
    expect(body).toMatch(/Swatinem\/rust-cache/);
    expect(body).toMatch(/Cargo\.lock/);
    expect(body).toMatch(/failed to run custom build command/);
    expect(body).toMatch(/note: test did not panic as expected/);
    expect(body).toMatch(/RUST_BACKTRACE=1/);
    expect(body).toMatch(/rust-toolchain\.toml/);
    expect(body).toContain("Process completed with exit code 101");
    expect(body).toContain("Process completed with exit code 1");
    expect(body).toContain("/analyze");
    expect(body).toContain("/guides");
    expect(body).toContain(ACTION_INSTALL_PATH);
    expect(body).toContain("ipinney/causeci/action@main");
    expect(body).toMatch(/not a Marketplace publish|not on the Marketplace/i);
    expect(body).not.toMatch(/listed on the Marketplace|published to the Marketplace/i);
    const links = guide?.sections.flatMap((section) => section.links ?? []) ?? [];
    expect(links.some((link) => link.href === "/analyze")).toBe(true);
    expect(links.some((link) => link.href === ACTION_INSTALL_PATH)).toBe(true);
    expect(links.some((link) => link.href === "/guides")).toBe(true);
    for (const href of [
      "/guides/go-test-failed-github-actions",
      "/guides/cypress-failed-github-actions",
      "/guides/playwright-failed-github-actions",
      "/guides/vitest-failed-github-actions",
      "/guides/jest-failed-github-actions",
      "/guides/npm-test-failed-github-actions",
      "/guides/typescript-failed-github-actions",
      "/guides/eslint-failed-github-actions",
      "/guides/pytest-failed-github-actions",
      "/guides/explain-github-actions-failure",
    ]) {
      expect(links.some((link) => link.href === href)).toBe(true);
    }
    const related = otherGuides("rust-test-failed-github-actions").map((item) => item.slug);
    expect(related).toEqual(
      expect.arrayContaining([
        "go-test-failed-github-actions",
        "cypress-failed-github-actions",
        "playwright-failed-github-actions",
        "vitest-failed-github-actions",
        "jest-failed-github-actions",
        "npm-test-failed-github-actions",
        "typescript-failed-github-actions",
        "eslint-failed-github-actions",
        "pytest-failed-github-actions",
        "install-github-action-failure-teaser",
        "explain-github-actions-failure",
      ]),
    );
    expect(related).not.toContain("rust-test-failed-github-actions");
    expect(GUIDES.at(-1)?.slug).toBe("install-github-action-failure-teaser");
  });

  it("documents Maven Surefire vs dependency, settings, JDK, and cache failures for GitHub Actions", () => {
    const guide = getGuide("maven-test-failed-github-actions");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe("/guides/maven-test-failed-github-actions");
    expect(guide?.title).toBe("Maven / Surefire test failed in GitHub Actions");
    expect(guide?.updatedAt).toBe("2026-09-29");
    expect(guide?.keywords).toEqual(
      expect.arrayContaining([
        "maven test failed GitHub Actions",
        "maven surefire Process completed with exit code 1",
        "mvn test failed CI",
        "settings.xml / dependency / cache drift",
        "JDK / toolchain",
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
    expect(body).toMatch(/\.\/mvnw -B -ntp test/);
    expect(body).toMatch(/<<< FAILURE!/);
    expect(body).toMatch(/<<< ERROR!/);
    expect(body).toMatch(/There are test failures/);
    expect(body).toMatch(/target\/surefire-reports/);
    expect(body).toMatch(/maven-surefire-plugin/);
    expect(body).toMatch(/Could not resolve dependencies/);
    expect(body).toMatch(/Could not find artifact/);
    expect(body).toMatch(/could not be resolved/);
    expect(body).toMatch(/status code: 401/);
    expect(body).toMatch(/settings\.xml/);
    expect(body).toMatch(/Blocked mirror for repositories/);
    expect(body).toMatch(/release version 21 not supported/);
    expect(body).toMatch(/toolchains\.xml/);
    expect(body).toMatch(/actions\/setup-java/);
    expect(body).toMatch(/invalid LOC header \(bad signature\)/);
    expect(body).toMatch(/COMPILATION ERROR/);
    expect(body).toMatch(/cannot find symbol/);
    expect(body).toMatch(/The forked VM terminated without properly saying goodbye/);
    expect(body).toContain("Process completed with exit code 1");
    expect(body).toContain("/analyze");
    expect(body).toContain("/guides");
    expect(body).toContain(ACTION_INSTALL_PATH);
    expect(body).toContain("ipinney/causeci/action@main");
    expect(body).toMatch(/not a Marketplace publish|not on the Marketplace/i);
    expect(body).not.toMatch(/listed on the Marketplace|published to the Marketplace/i);
    const links = guide?.sections.flatMap((section) => section.links ?? []) ?? [];
    expect(links.some((link) => link.href === "/analyze")).toBe(true);
    expect(links.some((link) => link.href === ACTION_INSTALL_PATH)).toBe(true);
    expect(links.some((link) => link.href === "/guides")).toBe(true);
    for (const href of [
      "/guides/rust-test-failed-github-actions",
      "/guides/go-test-failed-github-actions",
      "/guides/cypress-failed-github-actions",
      "/guides/playwright-failed-github-actions",
      "/guides/vitest-failed-github-actions",
      "/guides/jest-failed-github-actions",
      "/guides/npm-test-failed-github-actions",
      "/guides/typescript-failed-github-actions",
      "/guides/eslint-failed-github-actions",
      "/guides/pytest-failed-github-actions",
      "/guides/explain-github-actions-failure",
    ]) {
      expect(links.some((link) => link.href === href)).toBe(true);
    }
    const related = otherGuides("maven-test-failed-github-actions").map((item) => item.slug);
    expect(related).toEqual(
      expect.arrayContaining([
        "rust-test-failed-github-actions",
        "go-test-failed-github-actions",
        "cypress-failed-github-actions",
        "playwright-failed-github-actions",
        "vitest-failed-github-actions",
        "jest-failed-github-actions",
        "npm-test-failed-github-actions",
        "typescript-failed-github-actions",
        "eslint-failed-github-actions",
        "pytest-failed-github-actions",
        "install-github-action-failure-teaser",
        "explain-github-actions-failure",
      ]),
    );
    expect(related).not.toContain("maven-test-failed-github-actions");
    expect(GUIDES.at(-1)?.slug).toBe("install-github-action-failure-teaser");
  });

  it("documents Gradle JUnit vs dependency, credentials, JDK, and cache failures for GitHub Actions", () => {
    const guide = getGuide("gradle-test-failed-github-actions");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe("/guides/gradle-test-failed-github-actions");
    expect(guide?.title).toBe("Gradle / JUnit test failed in GitHub Actions");
    expect(guide?.updatedAt).toBe("2026-09-30");
    expect(guide?.keywords).toEqual(
      expect.arrayContaining([
        "gradle test failed GitHub Actions",
        "gradlew test Process completed with exit code 1",
        "gradle test failed CI",
        "dependency / cache / credentials drift",
        "JDK / toolchain",
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
    expect(body).toMatch(/\.\/gradlew test/);
    expect(body).toMatch(/gradle test/);
    expect(body).toMatch(/Execution failed for task ':test'/);
    expect(body).toMatch(/What went wrong/);
    expect(body).toMatch(/There were failing tests/);
    expect(body).toMatch(/build\/reports\/tests\/test/);
    expect(body).toMatch(/useJUnitPlatform/);
    expect(body).toMatch(/useTestNG/);
    expect(body).toMatch(/AssertionFailedError/);
    expect(body).toMatch(/Could not resolve/);
    expect(body).toMatch(/Received status code 401/);
    expect(body).toMatch(/No matching toolchains found/);
    expect(body).toMatch(/toolchain download repositories have not been configured/);
    expect(body).toMatch(/actions\/setup-java/);
    expect(body).toMatch(/invalid LOC header \(bad signature\)/);
    expect(body).toMatch(/Compilation failed/);
    expect(body).toMatch(/cannot find symbol/);
    expect(body).toMatch(/org\.gradle\.wrapper\.GradleWrapperMain/);
    expect(body).toContain("Process completed with exit code 1");
    expect(body).toContain("/analyze");
    expect(body).toContain("/guides");
    expect(body).toContain(ACTION_INSTALL_PATH);
    expect(body).toContain("ipinney/causeci/action@main");
    expect(body).toMatch(/not a Marketplace publish|not on the Marketplace/i);
    expect(body).not.toMatch(/listed on the Marketplace|published to the Marketplace/i);
    const links = guide?.sections.flatMap((section) => section.links ?? []) ?? [];
    expect(links.some((link) => link.href === "/analyze")).toBe(true);
    expect(links.some((link) => link.href === ACTION_INSTALL_PATH)).toBe(true);
    expect(links.some((link) => link.href === "/guides")).toBe(true);
    for (const href of [
      "/guides/maven-test-failed-github-actions",
      "/guides/rust-test-failed-github-actions",
      "/guides/go-test-failed-github-actions",
      "/guides/cypress-failed-github-actions",
      "/guides/playwright-failed-github-actions",
      "/guides/vitest-failed-github-actions",
      "/guides/jest-failed-github-actions",
      "/guides/npm-test-failed-github-actions",
      "/guides/typescript-failed-github-actions",
      "/guides/eslint-failed-github-actions",
      "/guides/pytest-failed-github-actions",
      "/guides/explain-github-actions-failure",
    ]) {
      expect(links.some((link) => link.href === href)).toBe(true);
    }
    const related = otherGuides("gradle-test-failed-github-actions").map((item) => item.slug);
    expect(related).toEqual(
      expect.arrayContaining([
        "maven-test-failed-github-actions",
        "rust-test-failed-github-actions",
        "go-test-failed-github-actions",
        "cypress-failed-github-actions",
        "playwright-failed-github-actions",
        "vitest-failed-github-actions",
        "jest-failed-github-actions",
        "npm-test-failed-github-actions",
        "typescript-failed-github-actions",
        "eslint-failed-github-actions",
        "pytest-failed-github-actions",
        "install-github-action-failure-teaser",
        "explain-github-actions-failure",
      ]),
    );
    expect(related).not.toContain("gradle-test-failed-github-actions");
    expect(GUIDES.at(-1)?.slug).toBe("install-github-action-failure-teaser");
  });

  it("documents PHPUnit vs composer, ext, memory, and config failures for GitHub Actions", () => {
    const guide = getGuide("phpunit-failed-github-actions");
    expect(guide).toBeDefined();
    expect(guide?.path).toBe("/guides/phpunit-failed-github-actions");
    expect(guide?.title).toBe("PHPUnit test failed in GitHub Actions");
    expect(guide?.updatedAt).toBe("2026-10-01");
    expect(guide?.keywords).toEqual(
      expect.arrayContaining([
        "PHPUnit failed GitHub Actions",
        "vendor/bin/phpunit Process completed with exit code 1",
        "There were X failures",
        "composer test failed CI",
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
    expect(body).toMatch(/vendor\/bin\/phpunit/);
    expect(body).toMatch(/composer test/);
    expect(body).toMatch(/composer install/);
    expect(body).toMatch(/FAILURES!/);
    expect(body).toMatch(/Tests: 4, Assertions: 7, Failures: 1/);
    expect(body).toMatch(/There was 1 failure/);
    expect(body).toMatch(/There were 2 failures/);
    expect(body).toMatch(/There were X failures/);
    expect(body).toMatch(/Failed asserting that 20 is identical to 18/);
    expect(body).toMatch(/ERRORS!/);
    expect(body).toMatch(/PHP Fatal error/);
    expect(body).toMatch(/Allowed memory size of 134217728 bytes exhausted/);
    expect(body).toMatch(/ext-dom/);
    expect(body).toMatch(/it is missing from your system/);
    expect(body).toMatch(/Could not read XML from file/);
    expect(body).toMatch(/phpunit\.xml/);
    expect(body).toMatch(/vendor\/autoload\.php/);
    expect(body).toMatch(/failOnDeprecation/);
    expect(body).toMatch(/--fail-on-deprecation/);
    expect(body).toMatch(/processIsolation/);
    expect(body).toMatch(/Test was run in child process and ended unexpectedly/);
    expect(body).toMatch(/No code coverage driver is available/);
    expect(body).toMatch(/shivammathur\/setup-php/);
    expect(body).toContain("Process completed with exit code 1");
    expect(body).toContain("Process completed with exit code 2");
    expect(body).toContain("/analyze");
    expect(body).toContain("/guides");
    expect(body).toContain(ACTION_INSTALL_PATH);
    expect(body).toContain("ipinney/causeci/action@main");
    expect(body).toMatch(/not a Marketplace publish|not on the Marketplace/i);
    expect(body).not.toMatch(/listed on the Marketplace|published to the Marketplace/i);
    const links = guide?.sections.flatMap((section) => section.links ?? []) ?? [];
    expect(links.some((link) => link.href === "/analyze")).toBe(true);
    expect(links.some((link) => link.href === ACTION_INSTALL_PATH)).toBe(true);
    expect(links.some((link) => link.href === "/guides")).toBe(true);
    for (const href of [
      "/guides/gradle-test-failed-github-actions",
      "/guides/maven-test-failed-github-actions",
      "/guides/rust-test-failed-github-actions",
      "/guides/go-test-failed-github-actions",
      "/guides/cypress-failed-github-actions",
      "/guides/playwright-failed-github-actions",
      "/guides/vitest-failed-github-actions",
      "/guides/jest-failed-github-actions",
      "/guides/npm-test-failed-github-actions",
      "/guides/typescript-failed-github-actions",
      "/guides/eslint-failed-github-actions",
      "/guides/pytest-failed-github-actions",
      "/guides/explain-github-actions-failure",
    ]) {
      expect(links.some((link) => link.href === href)).toBe(true);
    }
    const related = otherGuides("phpunit-failed-github-actions").map((item) => item.slug);
    expect(related).toEqual(
      expect.arrayContaining([
        "gradle-test-failed-github-actions",
        "maven-test-failed-github-actions",
        "rust-test-failed-github-actions",
        "go-test-failed-github-actions",
        "cypress-failed-github-actions",
        "playwright-failed-github-actions",
        "vitest-failed-github-actions",
        "jest-failed-github-actions",
        "npm-test-failed-github-actions",
        "typescript-failed-github-actions",
        "eslint-failed-github-actions",
        "pytest-failed-github-actions",
        "install-github-action-failure-teaser",
        "explain-github-actions-failure",
      ]),
    );
    expect(related).not.toContain("phpunit-failed-github-actions");
    expect(GUIDES.at(-1)?.slug).toBe("install-github-action-failure-teaser");
  });
});
