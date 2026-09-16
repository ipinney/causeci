"use strict";

/**
 * Truncate + redact helpers for the CauseCI failure teaser Action.
 * Keep this file dependency-free so a repo can install from the git path.
 */

function redactSecrets(text) {
  let out = String(text ?? "");
  const patterns = [
    /ghp_[A-Za-z0-9]{20,}/g,
    /github_pat_[A-Za-z0-9_]{20,}/g,
    /ghs_[A-Za-z0-9]{20,}/g,
    /gho_[A-Za-z0-9]{20,}/g,
    /ghu_[A-Za-z0-9]{20,}/g,
    /sk_live_[A-Za-z0-9]+/g,
    /sk_test_[A-Za-z0-9]+/g,
    /AKIA[0-9A-Z]{16}/g,
    /xox[baprs]-[A-Za-z0-9-]+/g,
    /Bearer\s+[A-Za-z0-9._\-+=/]+/gi,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    /(?:password|passwd|secret|token|api[_-]?key)\s*[:=]\s*\S+/gi,
  ];
  for (const pattern of patterns) {
    out = out.replace(pattern, "[redacted]");
  }
  return out;
}

function excerptLog(text, maxChars = 600) {
  const limit = Number.isFinite(maxChars) && maxChars > 0 ? Math.floor(maxChars) : 600;
  const normalized = redactSecrets(text).replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";
  if (normalized.length <= limit) return normalized;
  const sliced = normalized.slice(-limit);
  const firstNewline = sliced.indexOf("\n");
  return (firstNewline === -1 ? sliced : sliced.slice(firstNewline + 1)).trim();
}

function buildTeaserMarkdown({
  appUrl = "https://causeci.vercel.app",
  excerpt = "",
  repository = "",
  workflow = "",
  job = "",
  runUrl = "",
  sha = "",
} = {}) {
  const origin = String(appUrl || "https://causeci.vercel.app").replace(/\/$/, "");
  const analyze = `${origin}/analyze`;
  const lines = [
    "<!-- causeci-teaser -->",
    "## CauseCI teaser",
    "",
    "This job failed. Paste the log into CauseCI for a ranked root-cause autopsy.",
    "The top cause is free; remaining ranks stay locked until you unlock the artifact.",
    "",
    `- [Paste the log](${analyze})`,
  ];
  if (repository) lines.push(`- Repo: \`${repository}\``);
  if (workflow) {
    lines.push(`- Workflow: ${workflow}${job ? ` / \`${job}\`` : ""}`);
  } else if (job) {
    lines.push(`- Job: \`${job}\``);
  }
  if (sha) lines.push(`- Commit: \`${String(sha).slice(0, 7)}\``);
  if (runUrl) lines.push(`- [GitHub run](${runUrl})`);
  if (excerpt) {
    lines.push(
      "",
      "<details><summary>Truncated log excerpt (secrets redacted)</summary>",
      "",
      "```text",
      excerpt,
      "```",
      "",
      "</details>",
    );
  }
  return `${lines.join("\n")}\n`;
}

module.exports = {
  redactSecrets,
  excerptLog,
  buildTeaserMarkdown,
};
