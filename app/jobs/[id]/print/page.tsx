import { AutopsyView } from "@/components/autopsy-view";
import { toPublicJob } from "@/lib/public-job";
import { getJob } from "@/lib/store";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PrintRoute = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PrintRoute): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Print ${id.slice(0, 8)}`,
    robots: { index: false, follow: false },
  };
}

export default async function PrintJobPage({
  params,
}: PrintRoute) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();
  const publicJob = toPublicJob(job);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="no-print mb-6 flex items-center justify-between gap-3">
        <Link href={`/jobs/${job.id}`} className="text-sm text-coral">
          ← Back to autopsy
        </Link>
        <p className="text-xs text-muted">Use your browser print dialog for a PDF.</p>
      </div>
      <p className="font-mono text-xs text-muted">CauseCI · {job.id}</p>
      {publicJob.artifact ? (
        <div className="mt-4">
          <AutopsyView autopsy={publicJob.artifact} unlocked={job.unlocked} />
        </div>
      ) : (
        <p>No artifact yet.</p>
      )}
      {publicJob.markdown ? (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Markdown
          </h2>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 font-mono text-xs leading-5">
            {publicJob.markdown}
          </pre>
        </section>
      ) : null}
    </main>
  );
}
