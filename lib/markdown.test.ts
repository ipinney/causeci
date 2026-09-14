import { describe, expect, it } from "vitest";
import { autopsyToMarkdown } from "./markdown";
import { stubAutopsy } from "./stub-autopsy";
import { SAMPLE_LOG } from "./sample-log";

describe("autopsyToMarkdown", () => {
  it("redacts later causes in a teaser export", () => {
    const autopsy = stubAutopsy(SAMPLE_LOG);
    const teaser = autopsyToMarkdown(autopsy, {
      jobId: "job-1",
      unlocked: false,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    const full = autopsyToMarkdown(autopsy, {
      jobId: "job-1",
      unlocked: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(teaser).toContain("Teaser only");
    expect(teaser).not.toContain("Suggested patch draft");
    expect(full).toContain("Suggested patch draft");
    expect(full.split("### ").length).toBeGreaterThan(teaser.split("### ").length);
  });
});
