import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { redactSecrets, excerptLog, buildTeaserMarkdown } = require("./excerpt.js") as {
  redactSecrets: (text: string) => string;
  excerptLog: (text: string, maxChars?: number) => string;
  buildTeaserMarkdown: (opts?: Record<string, string>) => string;
};

describe("CauseCI action excerpt", () => {
  it("redacts common secret shapes", () => {
    const raw = [
      "Authorization: Bearer ghp_abcdefghijklmnopqrstuvwxyz0123456789",
      "STRIPE sk_live_abc123XYZ",
      "AWS AKIAIOSFODNN7EXAMPLE",
      "password=hunter2",
      "-----BEGIN RSA PRIVATE KEY-----",
      "abc",
      "-----END RSA PRIVATE KEY-----",
    ].join("\n");
    const redacted = redactSecrets(raw);
    expect(redacted).not.toMatch(/ghp_/);
    expect(redacted).not.toContain("sk_live_abc123XYZ");
    expect(redacted).not.toContain("AKIAIOSFODNN7EXAMPLE");
    expect(redacted).not.toContain("hunter2");
    expect(redacted).not.toContain("BEGIN RSA PRIVATE KEY");
    expect(redacted).toContain("[redacted]");
  });

  it("keeps the tail of a long log within the cap", () => {
    const body = Array.from({ length: 40 }, (_, i) => `line-${i}-xxxxxxxx`).join("\n");
    const excerpt = excerptLog(body, 80);
    expect(excerpt.length).toBeLessThanOrEqual(80);
    expect(excerpt).toContain("line-39");
    expect(excerpt).not.toContain("line-0-");
  });

  it("builds a teaser that points at the CauseCI paste flow", () => {
    const markdown = buildTeaserMarkdown({
      appUrl: "https://causeci.vercel.app/",
      excerpt: "npm ci failed",
      repository: "ipinney/causeci",
      workflow: "CI",
      job: "test",
      runUrl: "https://github.com/ipinney/causeci/actions/runs/1",
      sha: "abcdef1234567890",
    });
    expect(markdown).toContain("<!-- causeci-teaser -->");
    expect(markdown).toContain("https://causeci.vercel.app/analyze");
    expect(markdown).toContain("npm ci failed");
    expect(markdown).toContain("`abcdef1`");
    expect(markdown).not.toMatch(/marketplace/i);
  });
});
