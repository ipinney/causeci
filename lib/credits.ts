import { cookies } from "next/headers";

const COOKIE = "causeci_credits";

export async function getCreditBalance(): Promise<number> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function setCreditBalance(next: number): Promise<void> {
  const jar = await cookies();
  const value = String(Math.max(0, Math.floor(next)));
  jar.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function consumeCredit(): Promise<boolean> {
  const current = await getCreditBalance();
  if (current < 1) return false;
  await setCreditBalance(current - 1);
  return true;
}

export async function addCredits(amount: number): Promise<number> {
  const next = (await getCreditBalance()) + amount;
  await setCreditBalance(next);
  return next;
}
