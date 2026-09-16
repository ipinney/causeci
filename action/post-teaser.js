"use strict";

const { appendFileSync, existsSync, readFileSync } = require("node:fs");
const { buildTeaserMarkdown, excerptLog } = require("./excerpt.js");

const MARKER = "<!-- causeci-teaser -->";

function input(name) {
  const key = `INPUT_${name.toUpperCase().replace(/-/g, "_")}`;
  return process.env[key] ?? "";
}

function readEvent() {
  const path = process.env.GITHUB_EVENT_PATH;
  if (!path || !existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

async function githubJson(token, url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "causeci-failure-teaser",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!response.ok) {
    const message =
      body && typeof body === "object" && body.message
        ? body.message
        : `${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  return body;
}

async function upsertPrComment({ token, owner, repo, issueNumber, markdown }) {
  const listUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100`;
  const comments = await githubJson(token, listUrl);
  const existing = Array.isArray(comments)
    ? comments.find((comment) => typeof comment.body === "string" && comment.body.includes(MARKER))
    : null;

  if (existing?.id) {
    await githubJson(token, `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: markdown }),
    });
    return "updated";
  }

  await githubJson(token, `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: markdown }),
  });
  return "created";
}

function buildFromEnv() {
  const appUrl = input("app-url") || "https://causeci.vercel.app";
  const logPath = input("log-path");
  const maxChars = Number(input("max-excerpt-chars") || "600");
  let raw = "";
  if (logPath && existsSync(logPath)) {
    raw = readFileSync(logPath, "utf8");
  }
  const server = process.env.GITHUB_SERVER_URL || "https://github.com";
  const repository = process.env.GITHUB_REPOSITORY || "";
  const runId = process.env.GITHUB_RUN_ID || "";
  const runUrl = repository && runId ? `${server}/${repository}/actions/runs/${runId}` : "";

  return buildTeaserMarkdown({
    appUrl,
    excerpt: excerptLog(raw, maxChars),
    repository,
    workflow: process.env.GITHUB_WORKFLOW || "",
    job: process.env.GITHUB_JOB || "",
    runUrl,
    sha: process.env.GITHUB_SHA || "",
  });
}

async function main() {
  const markdown = buildFromEnv();
  const printOnly = process.argv.includes("--print");

  if (printOnly || !process.env.GITHUB_ACTIONS) {
    process.stdout.write(markdown);
    if (printOnly && !process.env.GITHUB_ACTIONS) return;
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
  }

  const commentOnPr = (input("comment-on-pr") || "true").toLowerCase() !== "false";
  const token = input("github-token") || process.env.GITHUB_TOKEN || "";
  const event = readEvent();
  const issueNumber = event.pull_request?.number ?? event.issue?.number;
  const repository = process.env.GITHUB_REPOSITORY || "";
  const [owner, repo] = repository.split("/");

  if (!commentOnPr || !token || !issueNumber || !owner || !repo) {
    return;
  }

  try {
    const result = await upsertPrComment({
      token,
      owner,
      repo,
      issueNumber,
      markdown,
    });
    console.log(`CauseCI teaser pull-request comment ${result}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`CauseCI teaser could not comment on the pull request: ${message}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
