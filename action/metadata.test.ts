import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = readFileSync(new URL("../action.yml", import.meta.url), "utf8");
const nested = readFileSync(new URL("./action.yml", import.meta.url), "utf8");

const INPUTS = [
  "github-token:",
  "app-url:",
  "log-path:",
  "comment-on-pr:",
  "max-excerpt-chars:",
];

describe("CauseCI action metadata", () => {
  it("exposes Marketplace-ready root metadata that reuses action/post-teaser.js", () => {
    expect(root).toMatch(/^name: CauseCI failure teaser$/m);
    expect(root).toMatch(/^description: \S/m);
    expect(root).toMatch(/^author: CauseCI$/m);
    expect(root).toMatch(/^\s*icon: activity$/m);
    expect(root).toMatch(/^\s*color: red$/m);
    expect(root).toMatch(/using: node20/);
    expect(root).toMatch(/main: action\/post-teaser\.js/);
    for (const input of INPUTS) {
      expect(root).toContain(input);
    }
  });

  it("keeps the nested action entrypoint for ipinney/causeci/action installs", () => {
    expect(nested).toMatch(/^name: CauseCI failure teaser$/m);
    expect(nested).toMatch(/main: post-teaser\.js/);
    expect(nested).not.toMatch(/main: action\/post-teaser\.js/);
    for (const input of INPUTS) {
      expect(nested).toContain(input);
    }
  });
});
