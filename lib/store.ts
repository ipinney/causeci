import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./env";
import type { Autopsy, Job, JobStatus } from "./types";

type JobRow = {
  id: string;
  status: JobStatus;
  unlocked: boolean;
  log_excerpt: string;
  log_hash: string;
  error: string | null;
  created_at: string;
  updated_at: string;
};

type ArtifactRow = {
  job_id: string;
  autopsy: Autopsy;
  markdown: string;
};

const memory = globalThis as typeof globalThis & {
  __causeciJobs?: Map<string, Job>;
};

function memoryMap(): Map<string, Job> {
  if (!memory.__causeciJobs) {
    memory.__causeciJobs = new Map();
  }
  return memory.__causeciJobs;
}

function serviceClient(): SupabaseClient {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function rowToJob(row: JobRow, artifact?: ArtifactRow | null): Job {
  return {
    id: row.id,
    status: row.status,
    unlocked: row.unlocked,
    logExcerpt: row.log_excerpt,
    logHash: row.log_hash,
    error: row.error ?? undefined,
    artifact: artifact?.autopsy,
    markdown: artifact?.markdown,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createJob(input: {
  logExcerpt: string;
  logHash: string;
}): Promise<Job> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const job: Job = {
      id: crypto.randomUUID(),
      status: "running",
      unlocked: false,
      logExcerpt: input.logExcerpt,
      logHash: input.logHash,
      createdAt: now,
      updatedAt: now,
    };
    memoryMap().set(job.id, job);
    return job;
  }

  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      status: "running",
      unlocked: false,
      log_excerpt: input.logExcerpt,
      log_hash: input.logHash,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create job");
  }
  return rowToJob(data as JobRow);
}

export async function getJob(id: string): Promise<Job | null> {
  if (!isSupabaseConfigured()) {
    return memoryMap().get(id) ?? null;
  }

  const supabase = serviceClient();
  const { data: row, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) return null;

  const { data: artifact } = await supabase
    .from("artifacts")
    .select("*")
    .eq("job_id", id)
    .maybeSingle();

  return rowToJob(row as JobRow, artifact as ArtifactRow | null);
}

export async function completeJob(
  id: string,
  artifact: Autopsy,
  markdown: string,
): Promise<Job> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const existing = memoryMap().get(id);
    if (!existing) throw new Error("Job not found");
    const next: Job = {
      ...existing,
      status: "completed",
      artifact,
      markdown,
      updatedAt: now,
    };
    memoryMap().set(id, next);
    return next;
  }

  const supabase = serviceClient();
  const { data: row, error } = await supabase
    .from("jobs")
    .update({ status: "completed", updated_at: now, error: null })
    .eq("id", id)
    .select()
    .single();
  if (error || !row) throw new Error(error?.message ?? "Failed to update job");

  const { error: artError } = await supabase.from("artifacts").upsert({
    job_id: id,
    autopsy: artifact,
    markdown,
  });
  if (artError) throw new Error(artError.message);

  return rowToJob(row as JobRow, { job_id: id, autopsy: artifact, markdown });
}

export async function failJob(id: string, message: string): Promise<Job> {
  const now = new Date().toISOString();
  if (!isSupabaseConfigured()) {
    const existing = memoryMap().get(id);
    if (!existing) throw new Error("Job not found");
    const next: Job = {
      ...existing,
      status: "failed",
      error: message,
      updatedAt: now,
    };
    memoryMap().set(id, next);
    return next;
  }

  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("jobs")
    .update({ status: "failed", error: message, updated_at: now })
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to fail job");
  return rowToJob(data as JobRow);
}

export async function unlockJob(id: string): Promise<Job> {
  const now = new Date().toISOString();
  if (!isSupabaseConfigured()) {
    const existing = memoryMap().get(id);
    if (!existing) throw new Error("Job not found");
    const next: Job = { ...existing, unlocked: true, updatedAt: now };
    memoryMap().set(id, next);
    return next;
  }

  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("jobs")
    .update({ unlocked: true, updated_at: now })
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to unlock job");

  const { data: artifact } = await supabase
    .from("artifacts")
    .select("*")
    .eq("job_id", id)
    .maybeSingle();

  return rowToJob(data as JobRow, artifact as ArtifactRow | null);
}

export function persistenceMode(): "supabase" | "memory" {
  return isSupabaseConfigured() ? "supabase" : "memory";
}
