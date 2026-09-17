# CauseCI

Paste a failing CI/CD log → ranked root-cause autopsy + concrete fix steps (optional patch draft) as a shareable HTML/Markdown artifact.

Brand: **CauseCI**. Dark theme, coral accent, developer-tool aesthetic.

## Week-1 MVP

- Landing page aimed at “explain this GitHub Actions / CI failure”
- Paste UI → job → result page with ranked causes (confidence), fix steps, optional patch
- Free teaser: **top cause only** until unlock
- Stripe Checkout ($19 one-shot, $49 / 5 credits, $79 / 10 credits) or **DEV_MODE mock unlock** when Stripe keys are missing
- Supabase persistence when configured; otherwise **in-memory** (lost on restart)
- Pluggable inference: `CAUSECI_INFER_URL` or a deterministic stub so the UI is testable without a model

No secrets belong in this repo.

## Week-2 distribution (SEO + Action teaser)

Identity / publish surfaces only — no paid ads, no outbound email or DMs.

- Sitemap at [`/sitemap.xml`](https://causeci.vercel.app/sitemap.xml); [`robots.txt`](https://causeci.vercel.app/robots.txt) points at it and still disallows `/jobs/` and `/api/`
- Home Open Graph / Twitter metadata targets the CI-failure query; guides are linked from the landing page
- Crawlable guides (App Router):
  - [Explain this GitHub Actions failure](/guides/explain-github-actions-failure)
  - [CI log root cause](/guides/ci-log-root-cause)
  - [GitLab / CircleCI failure autopsy](/guides/gitlab-circleci-failure-autopsy)
  - [Install the CauseCI GitHub Action](/guides/install-github-action-failure-teaser) (`/docs/action` redirects here)
- Optional [GitHub Action teaser](./action/README.md) under `action/` — posts a truncated excerpt + paste link on failure. **Not published to the Marketplace**; install from `ipinney/causeci/action@<ref>`. Public install docs: [/guides/install-github-action-failure-teaser](https://causeci.vercel.app/guides/install-github-action-failure-teaser)

## Operator kill metric

If the product records **fewer than 20 paid unlocks AND less than $200 revenue in 30 days** (soft launch 2026-09-14), kill it. Do not add paid ads or outbound messaging.

## Local run

Requires Node 20.9+ (Node 22 is fine). Default port is **3000**. Do not bind 8088, 8089, or 8787.

```bash
git clone https://github.com/ipinney/causeci.git
cd causeci
npm install
cp .env.example .env.local   # optional — empty values still work
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Local demo **without any keys**:

1. Paste a log (or click **Load sample log**) and run an autopsy.
2. The result page shows the top cause only.
3. Click **Unlock full autopsy (dev)** — mock unlock, no Stripe.
4. Copy Markdown or open **Printable HTML**.

```bash
npm test
npm run build
npm start
```

`npm start` also listens on port 3000.

## Environment variables

Names only — put real values in `.env.local` or the Vercel project, never in git.

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Public origin for Stripe redirects. Defaults to `http://localhost:3000` or `https://$VERCEL_URL`. |
| `STRIPE_SECRET_KEY` | Stripe secret. If missing, mock unlock is enabled. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`/api/webhooks/stripe`). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key (reserved for a future client Stripe.js surface). |
| `SUPABASE_URL` | Supabase project URL. If missing, jobs stay in process memory. |
| `SUPABASE_ANON_KEY` | Anon key (reserved; server writes use the service role). |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used to read/write `jobs` and `artifacts`. |
| `CAUSECI_INFER_URL` | Optional `POST { "log": "..." }` endpoint that returns an autopsy JSON document. If unset or the call fails, the stub engine runs. |

## Persistence fallback

When Supabase env vars are absent, jobs are stored in a process-local `Map`. That is enough for `next dev` / a single `next start` process. It does **not** survive restarts, multiple serverless isolates, or a second Node process. Apply `supabase/migrations/001_init.sql` and set the Supabase variables before production.

## Stripe

Create a Checkout-enabled Stripe account (not committed here). Point the webhook at `/api/webhooks/stripe` for `checkout.session.completed`. The success URL also hits `/api/checkout/confirm` so a local redirect works even if the webhook is not tunneled.

If `STRIPE_SECRET_KEY` or `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is missing, the paywall shows **Unlock full autopsy (dev)** instead of Checkout.

Credit packs add leftover unlocks to an httpOnly cookie after a successful Checkout return (`causeci_credits`). Webhooks only unlock the paid job — they cannot set the visitor’s cookie.

## Inference

Preferred: set `CAUSECI_INFER_URL` to an HTTPS endpoint that accepts:

```json
{ "log": "<raw CI log>" }
```

and returns:

```json
{
  "headline": "…",
  "ciSystem": "GitHub Actions",
  "summary": "…",
  "rootCauses": [
    {
      "rank": 1,
      "title": "…",
      "summary": "…",
      "confidence": 90,
      "evidence": ["…"],
      "fixSteps": ["…"]
    }
  ],
  "patchDraft": {
    "filename": "file.ts",
    "language": "ts",
    "content": "…",
    "notes": "…"
  }
}
```

**Spark / x.ai later:** stand up a small proxy that maps this schema onto x.ai (or another provider), keep the API key only in that service’s env, and point `CAUSECI_INFER_URL` at it. Do not put model keys in this repo.

## Vercel

1. Import `ipinney/causeci`.
2. Framework preset: Next.js. Build: `npm run build`. Output: default.
3. Add the env names above in Project Settings (Production / Preview as needed).
4. Apply the SQL migration to Supabase before enabling those keys.
5. Add a Stripe webhook to `https://<deployment>/api/webhooks/stripe`.
6. Set `NEXT_PUBLIC_APP_URL` to the production origin so Checkout redirects stay on the right host.

## Tests

```bash
npm test
```

Covers the stub autopsy ranker, Markdown teaser vs full export, public sitemap routes, and Action excerpt redaction.

```bash
node action/post-teaser.js --print
```

## License

Private / unpublished unless the repo owner says otherwise.
