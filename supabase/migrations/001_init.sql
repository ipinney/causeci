-- CauseCI week-1 schema. Apply in the Supabase SQL editor or via CLI.
-- Server routes use SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).

create extension if not exists pgcrypto;

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'queued'
    check (status in ('queued', 'running', 'completed', 'failed')),
  unlocked boolean not null default false,
  log_excerpt text not null default '',
  log_hash text not null default '',
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists artifacts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  autopsy jsonb not null,
  markdown text not null,
  created_at timestamptz not null default now(),
  constraint artifacts_job_id_key unique (job_id)
);

create index if not exists jobs_created_at_idx on jobs (created_at desc);

alter table jobs enable row level security;
alter table artifacts enable row level security;
-- No anon policies: the Next.js server uses the service role.
