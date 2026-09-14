export type RootCause = {
  rank: number;
  title: string;
  summary: string;
  confidence: number;
  evidence: string[];
  fixSteps: string[];
};

export type PatchDraft = {
  filename: string;
  language: string;
  content: string;
  notes: string;
};

export type Autopsy = {
  headline: string;
  ciSystem: string;
  summary: string;
  rootCauses: RootCause[];
  patchDraft?: PatchDraft;
  generatedBy: "http" | "stub";
};

export type JobStatus = "queued" | "running" | "completed" | "failed";

export type Job = {
  id: string;
  status: JobStatus;
  unlocked: boolean;
  logExcerpt: string;
  logHash: string;
  error?: string;
  artifact?: Autopsy;
  markdown?: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicJob = Omit<Job, "artifact" | "markdown"> & {
  artifact?: Autopsy;
  markdown?: string;
};

export type CheckoutProduct = "oneshot" | "pack5" | "pack10";
