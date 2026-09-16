import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="no-print border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-sm outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
        >
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-md bg-coral text-[11px] font-bold tracking-tight text-black"
          >
            CI
          </span>
          <span className="font-semibold tracking-tight">CauseCI</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-4 text-sm text-muted">
          <Link
            href="/analyze"
            className="rounded-sm hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
          >
            Paste a log
          </Link>
          <Link
            href="/guides"
            className="rounded-sm hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
          >
            Guides
          </Link>
          <Link
            href="/#pricing"
            className="rounded-sm hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
          >
            Pricing
          </Link>
        </nav>
      </div>
    </header>
  );
}
