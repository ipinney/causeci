import { consumeCredit } from "@/lib/credits";
import { isDevUnlockEnabled } from "@/lib/env";
import { autopsyToMarkdown } from "@/lib/markdown";
import { toPublicJob } from "@/lib/public-job";
import { getJob, unlockJob } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const job = await getJob(id);
  if (!job) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.unlocked) {
    return Response.json({ job: toPublicJob(job) });
  }

  let method: "dev" | "credit" = "dev";
  try {
    const body = (await request.json()) as { method?: string };
    if (body.method === "credit") method = "credit";
  } catch {
    method = "dev";
  }

  if (method === "credit") {
    const spent = await consumeCredit();
    if (!spent) {
      return Response.json({ error: "No credits remaining" }, { status: 402 });
    }
  } else if (!isDevUnlockEnabled()) {
    return Response.json(
      { error: "Dev unlock is disabled while Stripe is configured." },
      { status: 403 },
    );
  }

  const unlocked = await unlockJob(id);
  if (unlocked.artifact) {
    unlocked.markdown = autopsyToMarkdown(unlocked.artifact, {
      jobId: unlocked.id,
      unlocked: true,
      createdAt: unlocked.createdAt,
    });
  }
  return Response.json({ job: toPublicJob(unlocked) });
}
