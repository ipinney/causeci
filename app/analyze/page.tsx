import { PasteForm } from "@/components/paste-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paste a CI failure log",
  description:
    "Paste a failing GitHub Actions, GitLab CI, or CircleCI log and run a CauseCI autopsy. The top cause is free.",
  alternates: { canonical: "/analyze" },
  openGraph: {
    title: "Paste a CI failure log · CauseCI",
    description:
      "Drop the failed job output. CauseCI ranks likely root causes. The first cause is free.",
    url: "/analyze",
  },
};

export default function AnalyzePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Paste the red log</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Drop the failed job output. CauseCI ranks likely root causes, writes
        concrete fix steps, and can draft a patch. The first cause is free.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
        <PasteForm />
      </div>
    </main>
  );
}
