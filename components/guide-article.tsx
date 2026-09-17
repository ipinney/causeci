import { GuideCta } from "@/components/guide-cta";
import { JsonLd } from "@/components/json-ld";
import { otherGuides, type Guide } from "@/lib/guides";
import { PRODUCTION_ORIGIN, absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

export function guideMetadata(guide: Guide): Metadata {
  return {
    title: guide.title,
    description: guide.description,
    keywords: guide.keywords,
    alternates: { canonical: guide.path },
    openGraph: {
      title: `${guide.title} · CauseCI`,
      description: guide.description,
      url: guide.path,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.title} · CauseCI`,
      description: guide.description,
    },
  };
}

function guideJsonLd(guide: Guide) {
  const url = absoluteUrl(guide.path);
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      dateModified: guide.updatedAt,
      mainEntityOfPage: url,
      publisher: {
        "@type": "Organization",
        name: "CauseCI",
        url: PRODUCTION_ORIGIN,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
        { "@type": "ListItem", position: 3, name: guide.title, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];
}

export function GuideArticle({ guide }: { guide: Guide }) {
  const related = otherGuides(guide.slug);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <JsonLd data={guideJsonLd(guide)} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/guides" className="hover:text-foreground">
              Guides
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{guide.title}</li>
        </ol>
      </nav>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-coral">
        {guide.eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {guide.title}
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted">{guide.lede}</p>
      <p className="mt-2 font-mono text-xs text-muted">Updated {guide.updatedAt}</p>

      {guide.sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="mt-3 text-base leading-7 text-foreground/90">
              {paragraph}
            </p>
          ))}
          {section.list ? (
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7">
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.table ? (
            <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                    {section.table.headers.map((header) => (
                      <th key={header} scope="col" className="px-4 py-3 font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row) => (
                    <tr key={row[0]} className="border-b border-border last:border-b-0">
                      {row.map((cell, index) => (
                        <td
                          key={`${row[0]}-${index}`}
                          className={`px-4 py-3 align-top leading-6 ${
                            index === 0
                              ? "font-mono text-xs text-coral"
                              : "text-foreground/90"
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {section.code ? (
            <figure className="mt-4">
              {section.code.label ? (
                <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  {section.code.label}
                </figcaption>
              ) : null}
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 font-mono text-xs leading-5">
                {section.code.content}
              </pre>
            </figure>
          ) : null}
          {section.links ? (
            <ul className="mt-4 space-y-2">
              {section.links.map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      className="text-sm font-medium text-coral hover:text-coral-hover"
                      rel="noreferrer"
                    >
                      {item.label} →
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-coral hover:text-coral-hover"
                    >
                      {item.label} →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <section className="mt-12" aria-labelledby="guide-faq">
        <h2 id="guide-faq" className="text-xl font-semibold tracking-tight">
          Questions
        </h2>
        <dl className="mt-4 space-y-4">
          {guide.faqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-border bg-surface p-4">
              <dt className="font-semibold">{faq.question}</dt>
              <dd className="mt-2 text-sm leading-6 text-muted">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-12">
        <GuideCta />
      </div>

      <nav className="mt-10" aria-label="More guides">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          More CI failure notes
        </h2>
        <ul className="mt-3 space-y-2">
          {related.map((item) => (
            <li key={item.slug}>
              <Link
                href={item.path}
                className="text-sm font-medium text-coral hover:text-coral-hover"
              >
                {item.title} →
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
