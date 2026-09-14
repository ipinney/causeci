export const MAX_LOG_CHARS = 200_000;

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function isDevUnlockEnabled(): boolean {
  return !isStripeConfigured();
}

export function inferUrl(): string | undefined {
  const url = process.env.CAUSECI_INFER_URL?.trim();
  return url || undefined;
}

export function appBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function productPriceCents(product: "oneshot" | "pack5" | "pack10"): number {
  switch (product) {
    case "oneshot":
      return 1900;
    case "pack5":
      return 4900;
    case "pack10":
      return 7900;
  }
}

export function productCredits(product: "oneshot" | "pack5" | "pack10"): number {
  switch (product) {
    case "oneshot":
      return 1;
    case "pack5":
      return 5;
    case "pack10":
      return 10;
  }
}

export function productLabel(product: "oneshot" | "pack5" | "pack10"): string {
  switch (product) {
    case "oneshot":
      return "One-shot autopsy — $19";
    case "pack5":
      return "5-pack credits — $49";
    case "pack10":
      return "10-pack credits — $79";
  }
}
