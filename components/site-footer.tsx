import { ACTION_INSTALL_PATH } from "@/lib/guides";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>CauseCI — CI failure autopsy. Paste a log; top cause free.</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/guides" className="hover:text-foreground">
            Guides
          </Link>
          <Link href={ACTION_INSTALL_PATH} className="hover:text-foreground">
            Action
          </Link>
          <Link
            href="/guides/explain-github-actions-failure"
            className="hover:text-foreground"
          >
            GitHub Actions
          </Link>
          <Link href="/guides/ci-log-root-cause" className="hover:text-foreground">
            CI root cause
          </Link>
          <Link
            href="/guides/gitlab-circleci-failure-autopsy"
            className="hover:text-foreground"
          >
            GitLab / CircleCI
          </Link>
          <Link href="/analyze" className="hover:text-foreground">
            Paste a log
          </Link>
        </nav>
      </div>
    </footer>
  );
}
