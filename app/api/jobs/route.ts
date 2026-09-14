import { createHash } from "node:crypto";
import { MAX_LOG_CHARS } from "@/lib/env";
import { runAutopsy } from "@/lib/infer";
import { autopsyToMarkdown } from "@/lib/markdown";
import { toPublicJob } from "@/lib/public-job";
import { completeJob, createJob, failJob } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const log =
    typeof body === "object" && body && "log" in body
      ? String((body as { log: unknown }).log)
      : "";

  const trimmed = log.trim();
  if (trimmed.length < 20) {
    return Response.json(
      { error: "Paste a CI log (at least 20 characters)." },
      { status: 400 },
    );
  }

  const clipped = trimmed.slice(0, MAX_LOG_CHARS);
  const logHash = createHash("sha256").update(clipped).digest("hex");
  const logExcerpt = clipped.slice(0, 4000);

  const job = await createJob({ logExcerpt, logHash });

  try {
    const artifact = await runAutopsy(clipped);
    const markdown = autopsyToMarkdown(artifact, {
      jobId: job.id,
      unlocked: true,
      createdAt: job.createdAt,
    });
    const completed = await completeJob(job.id, artifact, markdown);
    return Response.json({ job: toPublicJob(completed) }, { status: 201 });
  } catch (error) {
    const failed = await failJob(
      job.id,
      error instanceof Error ? error.message : "Autopsy failed",
    );
    return Response.json({ job: toPublicJob(failed) }, { status: 500 });
  }
}
