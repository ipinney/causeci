"use client";

import { SAMPLE_LOG } from "@/lib/sample-log";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

export function PasteForm({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const router = useRouter();
  const [log, setLog] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ log }),
      });
      const payload = (await response.json()) as {
        error?: string;
        job?: { id: string };
      };
      if (!response.ok || !payload.job) {
        throw new Error(payload.error ?? "Could not start autopsy");
      }
      router.push(`/jobs/${payload.job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start autopsy");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          Failing CI / GitHub Actions log
        </label>
        <button
          type="button"
          className="text-xs text-coral hover:text-coral-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
          onClick={() => setLog(SAMPLE_LOG)}
        >
          Load sample log
        </button>
      </div>
      <textarea
        id={id}
        name="log"
        required
        minLength={20}
        value={log}
        onChange={(event) => setLog(event.target.value)}
        placeholder="Paste the red job log here — npm ci, test failures, checkout errors…"
        className={`w-full resize-y rounded-lg border border-border bg-surface px-3 py-3 font-mono text-sm leading-6 text-foreground placeholder:text-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral ${
          compact ? "min-h-48" : "min-h-72"
        }`}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="none"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">{log.length.toLocaleString()} characters</p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-md bg-coral px-5 text-sm font-semibold text-black transition hover:bg-coral-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
        >
          {pending ? "Running autopsy…" : "Run autopsy"}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-coral">
          {error}
        </p>
      ) : null}
    </form>
  );
}
