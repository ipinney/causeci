import Link from "next/link";

export function GuideCta() {
  return (
    <aside className="rounded-2xl border border-border bg-surface p-5 shadow-[0_0_0_1px_#ff6b4a14]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral">
        Free teaser
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">
        Paste the red log. Get the top cause free.
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        CauseCI ranks likely root causes with quoted evidence and fix steps.
        Remaining ranks and the patch draft stay locked until you unlock the
        artifact — no install required.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/analyze"
          className="inline-flex h-11 items-center justify-center rounded-md bg-coral px-5 text-sm font-semibold text-black transition hover:bg-coral-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
        >
          Paste a CI log
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-medium hover:border-coral focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
        >
          Home paste box
        </Link>
      </div>
    </aside>
  );
}
