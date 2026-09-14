"use client";

import type { CheckoutProduct } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PRODUCTS: { id: CheckoutProduct; label: string; detail: string }[] = [
  { id: "oneshot", label: "$19", detail: "Unlock this autopsy" },
  { id: "pack5", label: "$49", detail: "This job + 4 credits" },
  { id: "pack10", label: "$79", detail: "This job + 9 credits" },
];

export function UnlockPanel({
  jobId,
  stripeConfigured,
  credits,
}: {
  jobId: string;
  stripeConfigured: boolean;
  credits: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  async function unlock(method: "dev" | "credit") {
    setError(null);
    setPending(method);
    try {
      const response = await fetch(`/api/jobs/${jobId}/unlock`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ method }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unlock failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlock failed");
    } finally {
      setPending(null);
    }
  }

  async function checkout(product: CheckoutProduct) {
    setError(null);
    setPending(product);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId, product }),
      });
      const payload = (await response.json()) as { error?: string; url?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Checkout failed");
      }
      window.location.assign(payload.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setPending(null);
    }
  }

  return (
    <section
      aria-labelledby="unlock-heading"
      className="rounded-xl border border-coral/40 bg-coral/5 p-5"
    >
      <h2 id="unlock-heading" className="text-lg font-semibold tracking-tight">
        Unlock full autopsy
      </h2>
      <p className="mt-1 text-sm text-muted">
        The teaser shows the top cause only. Unlock remaining ranked causes, all
        fix steps, and the optional patch draft.
      </p>

      {stripeConfigured ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {PRODUCTS.map((product) => (
            <button
              key={product.id}
              type="button"
              disabled={pending !== null}
              onClick={() => checkout(product.id)}
              className="rounded-lg border border-border bg-surface px-3 py-3 text-left hover:border-coral disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
            >
              <span className="block font-mono text-xl text-coral">{product.label}</span>
              <span className="mt-1 block text-xs text-muted">{product.detail}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-border bg-surface p-3 text-sm text-muted">
          Stripe keys are not set.{" "}
          <strong className="text-foreground">DEV_MODE mock unlock</strong> is
          enabled so the local demo works without payment.
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {credits > 0 ? (
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => unlock("credit")}
            className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:border-coral disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
          >
            {pending === "credit" ? "Using credit…" : `Use 1 credit (${credits} left)`}
          </button>
        ) : null}
        {!stripeConfigured ? (
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => unlock("dev")}
            className="inline-flex h-10 items-center rounded-md bg-coral px-4 text-sm font-semibold text-black hover:bg-coral-hover disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
          >
            {pending === "dev" ? "Unlocking…" : "Unlock full autopsy (dev)"}
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-coral">
          {error}
        </p>
      ) : null}
    </section>
  );
}
