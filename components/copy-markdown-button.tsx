"use client";

import { useState } from "react";

export function CopyMarkdownButton({ markdown }: { markdown: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    window.setTimeout(() => setStatus("idle"), 2500);
  }

  const label =
    status === "copied"
      ? "Copied to clipboard"
      : status === "error"
        ? "Copy failed"
        : "Copy Markdown";

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-live="polite"
      className={`inline-flex h-10 items-center rounded-md border px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral ${
        status === "copied"
          ? "border-green bg-green/10 text-green"
          : status === "error"
            ? "border-coral bg-coral/10 text-coral"
            : "border-border bg-surface hover:border-coral"
      }`}
    >
      {label}
    </button>
  );
}
