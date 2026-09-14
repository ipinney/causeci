export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>CauseCI — CI failure autopsy. Week-1 MVP.</p>
        <p>No secrets in the repo. Local demo works without Stripe or Supabase.</p>
      </div>
    </footer>
  );
}
