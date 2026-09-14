"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ConfirmCheckout({
  jobId,
  sessionId,
}: {
  jobId: string;
  sessionId: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("Confirming payment…");

  useEffect(() => {
    let cancelled = false;
    async function confirm() {
      try {
        const response = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jobId, sessionId }),
        });
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? "Could not confirm payment");
        }
        if (!cancelled) {
          setMessage("Payment confirmed. Refreshing autopsy…");
          router.replace(`/jobs/${jobId}`);
          router.refresh();
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Confirm failed");
        }
      }
    }
    void confirm();
    return () => {
      cancelled = true;
    };
  }, [jobId, sessionId, router]);

  return (
    <p role="status" className="rounded-lg border border-border bg-surface px-3 py-2 text-sm">
      {message}
    </p>
  );
}
