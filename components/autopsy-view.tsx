import type { Autopsy, RootCause } from "@/lib/types";

function Confidence({ value }: { value: number }) {
  const tone =
    value >= 80 ? "text-green" : value >= 60 ? "text-amber" : "text-muted";
  return (
    <span className={`font-mono text-sm ${tone}`}>{value}% confidence</span>
  );
}

function CauseCard({ cause }: { cause: RootCause }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold tracking-tight">
          <span className="mr-2 font-mono text-coral">#{cause.rank}</span>
          {cause.title}
        </h3>
        <Confidence value={cause.confidence} />
      </div>
      <p className="mt-3 text-sm leading-6 text-foreground/90">{cause.summary}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Evidence
          </h4>
          <ul className="mt-2 space-y-2 text-sm text-foreground/80">
            {cause.evidence.map((item) => (
              <li key={item} className="rounded-md bg-background px-3 py-2 font-mono text-xs leading-5">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Fix steps
          </h4>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6">
            {cause.fixSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  );
}

export function AutopsyView({
  autopsy,
  unlocked,
}: {
  autopsy: Autopsy;
  unlocked: boolean;
}) {
  const visible = unlocked ? autopsy.rootCauses : autopsy.rootCauses.slice(0, 1);
  const hiddenCount = Math.max(0, autopsy.rootCauses.length - visible.length);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-coral">{autopsy.ciSystem}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{autopsy.headline}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{autopsy.summary}</p>
      </div>

      {visible.map((cause) => (
        <CauseCard key={`${cause.rank}-${cause.title}`} cause={cause} />
      ))}

      {!unlocked && hiddenCount > 0 ? (
        <div
          aria-hidden
          className="relative overflow-hidden rounded-xl border border-border"
        >
          <div className="pointer-events-none select-none blur-sm opacity-40 p-5">
            <p className="font-semibold">#{visible.length + 1} Additional ranked cause</p>
            <p className="mt-2 text-sm text-muted">
              Remaining {hiddenCount} cause{hiddenCount === 1 ? "" : "s"}, extra fix
              steps, and the suggested patch stay locked on the free teaser.
            </p>
          </div>
          <div className="absolute inset-0 grid place-items-center bg-background/40">
            <p className="rounded-full border border-border bg-surface px-3 py-1 text-xs uppercase tracking-wider text-muted">
              Locked — unlock full autopsy
            </p>
          </div>
        </div>
      ) : null}

      {unlocked && autopsy.patchDraft ? (
        <details className="rounded-xl border border-border bg-surface p-5">
          <summary className="cursor-pointer text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral">
            Suggested patch draft — {autopsy.patchDraft.filename}
          </summary>
          <p className="mt-3 text-sm text-muted">{autopsy.patchDraft.notes}</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-background p-4 font-mono text-xs leading-5">
            <code>{autopsy.patchDraft.content}</code>
          </pre>
        </details>
      ) : null}

      <p className="text-xs text-muted">
        Engine: {autopsy.generatedBy === "http" ? "CAUSECI_INFER_URL" : "deterministic stub"}
      </p>
    </div>
  );
}
