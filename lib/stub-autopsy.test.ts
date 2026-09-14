import { describe, expect, it } from "vitest";
import { SAMPLE_LOG } from "./sample-log";
import { stubAutopsy } from "./stub-autopsy";

describe("stubAutopsy", () => {
  it("ranks a lockfile mismatch from a GitHub Actions sample", () => {
    const autopsy = stubAutopsy(SAMPLE_LOG);
    expect(autopsy.ciSystem).toBe("GitHub Actions");
    expect(autopsy.generatedBy).toBe("stub");
    expect(autopsy.rootCauses.length).toBeGreaterThanOrEqual(2);
    expect(autopsy.rootCauses[0]?.title.toLowerCase()).toMatch(/lockfile/);
    expect(autopsy.rootCauses[0]?.confidence).toBeGreaterThan(80);
    expect(autopsy.patchDraft?.filename).toBeTruthy();
  });

  it("falls back conservatively on unstructured text", () => {
    const autopsy = stubAutopsy(
      "something went sideways in the pipeline and nobody left a stack trace 12345",
    );
    expect(autopsy.rootCauses[0]?.confidence).toBeLessThan(60);
    expect(autopsy.rootCauses[0]?.fixSteps.length).toBeGreaterThan(0);
  });

  it("detects TypeScript compiler errors", () => {
    const autopsy = stubAutopsy(
      "src/app.ts:12:3 - error TS2322: Type 'string' is not assignable to type 'number'.",
    );
    expect(autopsy.rootCauses[0]?.title).toMatch(/TypeScript/i);
  });
});
