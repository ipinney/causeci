import { AutopsyView } from "@/components/autopsy-view";
import { ConfirmCheckout } from "@/components/confirm-checkout";
import { CopyMarkdownButton } from "@/components/copy-markdown-button";
import { UnlockPanel } from "@/components/unlock-panel";
import { getCreditBalance } from "@/lib/credits";
import { isStripeConfigured } from "@/lib/env";
import { toPublicJob } from "@/lib/public-job";
import { getJob, persistenceMode } from "@/lib/store";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type JobRoute = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: Pick<JobRoute, "params">): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Autopsy ${id.slice(0, 8)}`,
    description: "Ranked CI failure autopsy from CauseCI.",
    robots: { index: false, follow: false },
  };
}

export default async function JobPage({
  params,
  searchParams,
}: JobRoute) {
  const { id } = await params;
  const query = await searchParams;
  const sessionId = typeof query.session_id === "string" ? query.session_id : undefined;
  const job = await getJob(id);
  if (!job) notFound();

  const publicJob = toPublicJob(job);
  const credits = await getCreditBalance();
  const stripeConfigured = isStripeConfigured();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <p className="font-mono text-xs text-muted">
        job {job.id} · {job.status} · {job.unlocked ? "full access" : "teaser"} ·{" "}
        {persistenceMode()}
      </p>

      {sessionId ? <div className="mt-4"><ConfirmCheckout jobId={job.id} sessionId={sessionId} /></div> : null}

      {job.status === "failed" ? (
        <p role="alert" className="mt-6 text-coral">
          Autopsy failed: {job.error ?? "unknown error"}
        </p>
      ) : null}

      {job.status === "running" || job.status === "queued" ? (
        <p role="status" className="mt-6 text-sm text-muted">
          Job is {job.status}. Refresh in a moment.
        </p>
      ) : null}

      {publicJob.artifact ? (
        <div className="mt-6">
          <AutopsyView autopsy={publicJob.artifact} unlocked={job.unlocked} />
        </div>
      ) : null}

      {!job.unlocked && job.status === "completed" ? (
        <div className="mt-8">
          <UnlockPanel
            jobId={job.id}
            stripeConfigured={stripeConfigured}
            credits={credits}
          />
        </div>
      ) : null}

      {publicJob.markdown ? (
        <div className="no-print mt-8 flex flex-wrap gap-2">
          <CopyMarkdownButton markdown={publicJob.markdown} />
          <Link
            href={`/jobs/${job.id}/print`}
            className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-3 text-sm font-medium hover:border-coral focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
          >
            Printable HTML
          </Link>
        </div>
      ) : null}
    </main>
  );
}
