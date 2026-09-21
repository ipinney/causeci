import { GuideCta } from "@/components/guide-cta";
import { JsonLd } from "@/components/json-ld";
import { PasteForm } from "@/components/paste-form";
import { ACTION_INSTALL_PATH, GUIDES } from "@/lib/guides";
import { PRODUCTION_ORIGIN } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: "CauseCI — Explain this GitHub Actions / CI failure",
  },
  description:
    "Explain this GitHub Actions or CI failure: paste the red log and get a ranked root-cause autopsy with confidence and fix steps. Top cause free.",
  keywords: [
    "explain this GitHub Actions failure",
    "npm test failed GitHub Actions",
    "eslint failed GitHub Actions",
    "typescript failed GitHub Actions",
    "CI log root cause",
    "GitLab CI failure autopsy",
    "CircleCI failure",
    "failing CI log",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "CauseCI — Explain this GitHub Actions / CI failure",
    description:
      "Paste a red GitHub Actions, GitLab, or CircleCI log. Ranked root causes, confidence, and fix steps. Top cause free.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explain this GitHub Actions / CI failure",
    description:
      "Paste the red log. Get a ranked CauseCI autopsy — top cause free.",
  },
};

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "CauseCI",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            url: PRODUCTION_ORIGIN,
            description:
              "Paste a failing CI log and get a ranked root-cause autopsy with confidence scores and fix steps.",
            offers: {
              "@type": "Offer",
              price: "19.00",
              priceCurrency: "USD",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "CauseCI",
            url: PRODUCTION_ORIGIN,
          },
        ]}
      />
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral">
        CI failure autopsy
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Explain this GitHub Actions / CI failure.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
        Paste a red log. Get a ranked root-cause autopsy, confidence scores, and
        concrete fix steps — as a shareable HTML / Markdown artifact — in minutes.
      </p>

      <div className="mt-10 rounded-2xl border border-border bg-surface/80 p-5 shadow-[0_0_0_1px_#ff6b4a14]">
        <PasteForm compact />
      </div>

      <section className="mt-16 grid gap-4 md:grid-cols-3" aria-label="How it works">
        {[
          {
            step: "01",
            title: "Paste the log",
            body: "GitHub Actions, GitLab, Circle — dump the failed job output. No repo install required.",
          },
          {
            step: "02",
            title: "Read the teaser",
            body: "The top cause is free. Remaining ranks, extra fixes, and the patch draft stay locked.",
          },
          {
            step: "03",
            title: "Unlock the artifact",
            body: "$19 one-shot or a credit pack. Export Markdown or open the printable HTML view.",
          },
        ].map((item) => (
          <article key={item.step} className="rounded-xl border border-border bg-surface p-5">
            <p className="font-mono text-xs text-coral">{item.step}</p>
            <h2 className="mt-2 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
          </article>
        ))}
      </section>

      <section
        className="mt-16 rounded-2xl border border-border bg-surface p-5 shadow-[0_0_0_1px_#ff6b4a14]"
        aria-labelledby="action-heading"
      >
        <p className="font-mono text-xs text-coral">GitHub Action</p>
        <h2 id="action-heading" className="mt-2 text-lg font-semibold tracking-tight">
          Post a teaser when CI fails
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Install from <span className="font-mono text-foreground/90">ipinney/causeci/action@main</span>{" "}
          (or a pinned SHA). Truncated excerpt and a paste link only — no log
          upload, not Marketplace. CauseCI is public; private caller repos are fine.
        </p>
        <p className="mt-4">
          <Link
            href={ACTION_INSTALL_PATH}
            className="text-sm font-medium text-coral hover:text-coral-hover"
          >
            Install the Action →
          </Link>
        </p>
      </section>

      <section className="mt-16" aria-labelledby="guides-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="guides-heading" className="text-2xl font-semibold tracking-tight">
              Guides
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Crawlable notes for the queries people type when a pipeline is red.
              Each page ends in the paste flow.
            </p>
          </div>
          <Link
            href="/guides"
            className="text-sm font-medium text-coral hover:text-coral-hover"
          >
            All guides →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {GUIDES.map((guide) => (
            <article key={guide.slug} className="rounded-xl border border-border bg-surface p-5">
              <p className="font-mono text-xs text-coral">{guide.eyebrow}</p>
              <h3 className="mt-2 text-lg font-semibold">
                <Link
                  href={guide.path}
                  className="hover:text-coral focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
                >
                  {guide.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">{guide.description}</p>
            </article>
          ))}
        </div>
        <div className="mt-6">
          <GuideCta />
        </div>
      </section>

      <section id="pricing" className="mt-16 scroll-mt-20">
        <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          One-shot analysis in the $9–29 band, or credit packs for a week of red
          builds. Locally, missing Stripe keys enable a mock unlock.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { price: "$19", name: "One-shot", detail: "Unlock a single autopsy" },
            { price: "$49", name: "5-pack", detail: "Five unlocks, cookie-stored credits" },
            { price: "$79", name: "10-pack", detail: "Ten unlocks for a busy release week" },
          ].map((tier) => (
            <article key={tier.name} className="rounded-xl border border-border bg-surface p-5">
              <p className="font-mono text-3xl text-coral">{tier.price}</p>
              <h3 className="mt-2 font-semibold">{tier.name}</h3>
              <p className="mt-1 text-sm text-muted">{tier.detail}</p>
            </article>
          ))}
        </div>
        <p className="mt-6">
          <Link
            href="/analyze"
            className="text-sm font-medium text-coral hover:text-coral-hover"
          >
            Prefer a dedicated paste page →
          </Link>
        </p>
      </section>
    </main>
  );
}
