import { addCredits } from "@/lib/credits";
import { isStripeConfigured } from "@/lib/env";
import { toPublicJob } from "@/lib/public-job";
import { getJob, unlockJob } from "@/lib/store";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return Response.json({ error: "Stripe is not configured" }, { status: 400 });
  }

  const body = (await request.json()) as { sessionId?: string; jobId?: string };
  if (!body.sessionId || !body.jobId) {
    return Response.json({ error: "sessionId and jobId are required" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.retrieve(body.sessionId);

  if (session.payment_status !== "paid" && session.status !== "complete") {
    return Response.json({ error: "Checkout is not complete" }, { status: 402 });
  }
  if (session.metadata?.jobId !== body.jobId) {
    return Response.json({ error: "Session does not match this job" }, { status: 403 });
  }

  const existing = await getJob(body.jobId);
  if (!existing) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  const alreadyUnlocked = existing.unlocked;
  const unlocked = alreadyUnlocked ? existing : await unlockJob(body.jobId);

  const credits = Number.parseInt(session.metadata?.credits ?? "1", 10);
  if (!alreadyUnlocked && credits > 1) {
    await addCredits(credits - 1);
  }

  return Response.json({ job: toPublicJob(unlocked) });
}
