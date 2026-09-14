import { autopsyToMarkdown } from "./markdown";
import type { Autopsy, Job, PublicJob } from "./types";

export function redactAutopsy(autopsy: Autopsy): Autopsy {
  return {
    ...autopsy,
    rootCauses: autopsy.rootCauses.slice(0, 1),
    patchDraft: undefined,
    lockedRemaining: Math.max(0, autopsy.rootCauses.length - 1),
    summary: `${autopsy.summary} Full ranking, remaining causes, and the patch draft are locked until you unlock this autopsy.`,
  };
}

export function toPublicJob(job: Job): PublicJob {
  if (!job.artifact) {
    return { ...job, artifact: undefined, markdown: undefined };
  }
  const artifact = job.unlocked ? job.artifact : redactAutopsy(job.artifact);
  return {
    ...job,
    artifact,
    markdown: autopsyToMarkdown(artifact, {
      jobId: job.id,
      unlocked: job.unlocked,
      createdAt: job.createdAt,
    }),
  };
}
