import { inferUrl } from "./env";
import { stubAutopsy } from "./stub-autopsy";
import type { Autopsy, RootCause } from "./types";

function isAutopsy(value: unknown): value is Autopsy {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Autopsy;
  return (
    typeof candidate.headline === "string" &&
    typeof candidate.ciSystem === "string" &&
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.rootCauses) &&
    candidate.rootCauses.every(isRootCause)
  );
}

function isRootCause(value: unknown): value is RootCause {
  if (!value || typeof value !== "object") return false;
  const cause = value as RootCause;
  return (
    typeof cause.rank === "number" &&
    typeof cause.title === "string" &&
    typeof cause.summary === "string" &&
    typeof cause.confidence === "number" &&
    Array.isArray(cause.evidence) &&
    Array.isArray(cause.fixSteps)
  );
}

async function inferViaHttp(log: string, url: string): Promise<Autopsy> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ log }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Inference HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    if (!isAutopsy(payload)) {
      throw new Error("Inference response failed schema check");
    }
    return { ...payload, generatedBy: "http" };
  } finally {
    clearTimeout(timer);
  }
}

export async function runAutopsy(log: string): Promise<Autopsy> {
  const url = inferUrl();
  if (url) {
    try {
      return await inferViaHttp(log, url);
    } catch (error) {
      console.error("[causeci] CAUSECI_INFER_URL failed, using stub", error);
    }
  }
  return stubAutopsy(log);
}
