import { unlockJob } from "@/lib/store";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) {
    return Response.json({ error: "Stripe webhook is not configured" }, { status: 501 });
  }

  const stripe = new Stripe(key);
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature) {
    return Response.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid signature" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const jobId = session.metadata?.jobId;
    if (jobId) {
      await unlockJob(jobId);
    }
  }

  return Response.json({ received: true });
}
