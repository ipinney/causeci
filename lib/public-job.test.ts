import { describe, expect, it } from "vitest";
import { redactAutopsy, toPublicJob } from "./public-job";
import { stubAutopsy } from "./stub-autopsy";
import { SAMPLE_LOG } from "./sample-log";
import type { Job } from "./types";

describe("toPublicJob", () => {
  const autopsy = stubAutopsy(SAMPLE_LOG);
  const base: Job = {
    id: "job-1",
    status: "completed",
    unlocked: false,
    logExcerpt: "…",
    logHash: "abc",
    artifact: autopsy,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  it("keeps only the top cause until unlock", () => {
    const teaser = toPublicJob(base);
    expect(teaser.artifact?.rootCauses).toHaveLength(1);
    expect(teaser.artifact?.lockedRemaining).toBe(autopsy.rootCauses.length - 1);
    expect(teaser.artifact?.patchDraft).toBeUndefined();
    expect(redactAutopsy(autopsy).rootCauses[0]?.title).toBe(
      autopsy.rootCauses[0]?.title,
    );
  });

  it("returns the full artifact after unlock", () => {
    const full = toPublicJob({ ...base, unlocked: true });
    expect(full.artifact?.rootCauses.length).toBe(autopsy.rootCauses.length);
    expect(full.artifact?.patchDraft).toEqual(autopsy.patchDraft);
  });
});
