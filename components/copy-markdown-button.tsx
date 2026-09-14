"use client";

import { useState } from "react";

export function CopyMarkdownButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-3 text-sm font-medium hover:border-coral focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
    >
      {copied ? "Copied" : "Copy Markdown"}
    </button>
  );
}
