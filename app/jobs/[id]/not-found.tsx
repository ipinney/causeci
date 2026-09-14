import Link from "next/link";

export default function JobNotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Job not found</h1>
      <p className="mt-3 text-sm text-muted">
        In-memory jobs disappear when the server restarts. Paste the log again
        to create a new autopsy.
      </p>
      <Link href="/analyze" className="mt-6 inline-block text-sm text-coral">
        Paste a log
      </Link>
    </main>
  );
}
