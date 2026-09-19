import { GuideCta } from "@/components/guide-cta";
import { JsonLd } from "@/components/json-ld";
import { GUIDES } from "@/lib/guides";
import { absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CI failure guides",
  description:
    "Short notes on explaining GitHub Actions failures, npm test / Jest / Vitest CI fails, ESLint / npm run lint CI fails, finding a CI log root cause, autopsying GitLab or CircleCI jobs, and installing the CauseCI failure-teaser Action. Each page ends in the paste flow.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "CI failure guides · CauseCI",
    description:
      "Explain a red GitHub Actions, GitLab, or CircleCI job. Rank the root cause, then paste the log for a teaser autopsy.",
    url: "/guides",
    type: "website",
  },
};

export default function GuidesIndexPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "CI failure guides",
          url: absoluteUrl("/guides"),
          hasPart: GUIDES.map((guide) => ({
            "@type": "Article",
            name: guide.title,
            url: absoluteUrl(guide.path),
          })),
        }}
      />
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral">
        Guides
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        How to explain a red CI job
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted">
        Crawlable notes for the queries people type when a pipeline is red —
        including npm test / Jest / Vitest failures, ESLint / npm run lint
        failures, and how to install the optional GitHub Action teaser. Each
        page is a method you can run by hand, then a teaser autopsy if you
        want the ranked write-up.
      </p>

      <ul className="mt-10 space-y-4">
        {GUIDES.map((guide) => (
          <li key={guide.slug}>
            <article className="rounded-xl border border-border bg-surface p-5">
              <p className="font-mono text-xs text-coral">{guide.eyebrow}</p>
              <h2 className="mt-2 text-lg font-semibold">
                <Link
                  href={guide.path}
                  className="hover:text-coral focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
                >
                  {guide.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">{guide.description}</p>
              <p className="mt-3">
                <Link
                  href={guide.path}
                  className="text-sm font-medium text-coral hover:text-coral-hover"
                >
                  Read the guide →
                </Link>
              </p>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-12">
        <GuideCta />
      </div>
    </main>
  );
}
