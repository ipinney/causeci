import {
  appBaseUrl,
  isStripeConfigured,
  productCredits,
  productLabel,
  productPriceCents,
} from "@/lib/env";
import { getJob } from "@/lib/store";
import type { CheckoutProduct } from "@/lib/types";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isProduct(value: unknown): value is CheckoutProduct {
  return value === "oneshot" || value === "pack5" || value === "pack10";
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return Response.json(
      { error: "Stripe is not configured. Use the local mock unlock." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const jobId =
    typeof body === "object" && body && "jobId" in body
      ? String((body as { jobId: unknown }).jobId)
      : "";
  const product =
    typeof body === "object" && body && "product" in body
      ? (body as { product: unknown }).product
      : "oneshot";

  if (!jobId || !isProduct(product)) {
    return Response.json({ error: "jobId and product are required" }, { status: 400 });
  }

  const job = await getJob(jobId);
  if (!job) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const credits = productCredits(product);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appBaseUrl()}/jobs/${jobId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appBaseUrl()}/jobs/${jobId}`,
    metadata: {
      jobId,
      product,
      credits: String(credits),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: productPriceCents(product),
          product_data: {
            name: `CauseCI — ${productLabel(product)}`,
            description: `Unlock autopsy ${jobId}`,
          },
        },
      },
    ],
  });

  if (!session.url) {
    return Response.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
  }

  return Response.json({ url: session.url });
}
