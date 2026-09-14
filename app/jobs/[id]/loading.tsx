export default function JobLoading() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <p className="font-mono text-xs text-coral">Running autopsy…</p>
      <p className="mt-3 text-sm text-muted">
        Ranking root causes from the log you pasted.
      </p>
    </main>
  );
}
