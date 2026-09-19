import { PUBLIC_LASTMOD, type PublicRoute } from "./site";

export type GuideFaq = {
  question: string;
  answer: string;
};

export type GuideLink = {
  href: string;
  label: string;
  external?: boolean;
};

export type GuideTable = {
  headers: string[];
  rows: string[][];
};

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
  code?: { label?: string; content: string };
  table?: GuideTable;
  links?: GuideLink[];
};

export type Guide = {
  slug: string;
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  lede: string;
  keywords: string[];
  updatedAt: string;
  sections: GuideSection[];
  faqs: GuideFaq[];
};

export const ACTION_INSTALL_SLUG = "install-github-action-failure-teaser";
export const ACTION_INSTALL_PATH = `/guides/${ACTION_INSTALL_SLUG}`;
export const ACTION_SOURCE_URL =
  "https://github.com/ipinney/causeci/tree/main/action";
export const ACTION_README_URL =
  "https://github.com/ipinney/causeci/blob/main/action/README.md";

export const GUIDES: Guide[] = [
  {
    slug: "explain-github-actions-failure",
    path: "/guides/explain-github-actions-failure",
    title: "Explain this GitHub Actions failure",
    description:
      "How to read a red GitHub Actions job, find the first real error instead of the last echo, and turn the log into a ranked root-cause autopsy.",
    eyebrow: "GitHub Actions",
    lede:
      "A failed workflow is usually one real error plus a trail of echoes. This is how to name the cause from the job log — and when a teaser autopsy is enough to unblock you.",
    keywords: [
      "explain this GitHub Actions failure",
      "GitHub Actions failed",
      "workflow failed",
      "##[error]",
      "Process completed with exit code 1",
    ],
    updatedAt: PUBLIC_LASTMOD,
    sections: [
      {
        heading: "Start at the first red step, not the last line",
        paragraphs: [
          "Most people paste the tail of the log because that is what the Checks UI shows. The last line is often Process completed with exit code 1 — a wrapper, not a diagnosis. Scroll up to the first ##[error], FAIL, or Error: in the failing step. That is the sentence you are trying to explain.",
          "Annotations in the Actions UI are a shortcut, not a substitute. They can point at a later upload or notify step that only failed because the test step already died.",
        ],
        list: [
          "Collapse every green step. The hang or crash is almost always the first non-zero exit.",
          "Search the raw log for ##[error], npm error, FAIL, and error TS.",
          "Ignore checkout / cache noise unless those steps themselves are red.",
        ],
      },
      {
        heading: "Failures GitHub Actions logs repeat every week",
        paragraphs: [
          "A short list covers a surprising share of red PRs. Match the message, then confirm it is the first failure — not a downstream symptom.",
        ],
        list: [
          "Lockfile drift: npm ci / pnpm --frozen-lockfile / yarn --frozen-lockfile after a local install that was never committed.",
          "Missing secret: fork pull requests do not receive repository secrets; new environments forget renamed keys.",
          "Timeout or cancel: a hung test or a waiting network client, not a failed assertion.",
          "Exit 137 / heap OOM: the runner ran out of memory. Shrink workers before raising NODE_OPTIONS.",
          "TypeScript or lint gate: deterministic; the same commit will fail again until tsc or eslint is clean locally.",
        ],
      },
      {
        heading: "What a useful explanation looks like",
        paragraphs: [
          "A good write-up is ranked. Rank 1 is the first failure that, if fixed, would turn the job green. Rank 2+ are alternatives or environment drift. Each rank needs a quoted evidence line, a confidence, and a fix you can run locally with the same command CI used.",
          "CauseCI follows that shape. Paste the job log, get a teaser with the top cause free, and unlock remaining ranks plus a patch draft if you want the full artifact.",
        ],
        code: {
          label: "What to copy from the Actions log",
          content: `##[error] Process completed with exit code 1
npm error \`npm ci\` can only install packages when your
package.json and package-lock.json are in sync.
Missing: typescript@5.6.3 from lock file`,
        },
      },
    ],
    faqs: [
      {
        question: "Why does GitHub say the job failed if my tests never ran?",
        answer:
          "An earlier step exited non-zero — install, checkout, or a cache restore. Open the first red step; the test job never started.",
      },
      {
        question: "Do I need to install a GitHub Action to explain the failure?",
        answer:
          "No. Paste the log at CauseCI. An optional teaser Action can comment a truncated excerpt and a link back when a job fails; it is not required for an autopsy. Install notes live at /guides/install-github-action-failure-teaser.",
      },
    ],
  },
  {
    slug: "ci-log-root-cause",
    path: "/guides/ci-log-root-cause",
    title: "Find the root cause in a CI log",
    description:
      "A practical method for turning a noisy CI/CD log into a root-cause rank: first error, evidence, and a local reproduction command.",
    eyebrow: "CI logs",
    lede:
      "Root cause is the change that would make this exact job pass. Everything after that is a symptom — including failed uploads, failed notifies, and the final exit code.",
    keywords: [
      "CI log root cause",
      "CI failure autopsy",
      "failing CI log",
      "root cause CI",
      "debug CI pipeline",
    ],
    updatedAt: PUBLIC_LASTMOD,
    sections: [
      {
        heading: "Separate the cause from the echo",
        paragraphs: [
          "CI runners print every command, then summarize. The summary is almost never the root cause. Work backwards only until you hit the first command that returned non-zero for a new reason.",
          "A failed Slack notify after a failed test is not a messaging bug. A missing artifact after a compile error is not an upload bug. Rank those lower unless they fail when the main command is green.",
        ],
        list: [
          "Cause: the first new error (lockfile, assertion, type, secret, OOM, timeout).",
          "Symptom: later steps that assume the previous step succeeded.",
          "Drift: Node, OS, or dependency-cache differences vs your laptop — cheap to rule out, easy to over-rank.",
        ],
      },
      {
        heading: "A short autopsy you can run by hand",
        paragraphs: [
          "You do not need a model for the first pass. The log already contains the evidence. Write four lines before you change code.",
        ],
        list: [
          "CI system and job name (GitHub Actions, GitLab, CircleCI, other).",
          "First error line, quoted — not paraphrased.",
          "Local command that should reproduce it (npm ci, not npm install; CI=true).",
          "One alternative if the first line is truncated or looks like a wrapper.",
        ],
        code: {
          label: "Hand autopsy template",
          content: `CI: GitHub Actions / test
First error: Missing: typescript@5.6.3 from lock file
Reproduce: npm ci
Alt: only if npm ci is clean — then the FAIL in vitest`,
        },
      },
      {
        heading: "When the log is truncated or huge",
        paragraphs: [
          "Hosted runners drop the middle of very large logs. If you only have the tail, re-export the full job log before you guess. CauseCI accepts a paste up to a few hundred thousand characters and returns a teaser (top cause) without an account.",
          "Never paste secrets. Redact tokens, PATs, and private keys first. A useful autopsy quotes error text, not credentials.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is a CI failure autopsy?",
        answer:
          "A ranked list of likely root causes with quoted evidence, confidence, and concrete fix steps — not a raw log dump and not a single unexplained 'build failed' label.",
      },
      {
        question: "Is the top cause always right?",
        answer:
          "No. Treat rank 1 as the best-supported hypothesis from this log. If the quoted line is a wrapper, promote the next rank. Unlocking later ranks is for alternatives, not a second opinion from a different log.",
      },
    ],
  },
  {
    slug: "gitlab-circleci-failure-autopsy",
    path: "/guides/gitlab-circleci-failure-autopsy",
    title: "GitLab CI and CircleCI failure autopsy",
    description:
      "How to autopsy a failed GitLab CI or CircleCI job: section markers, job names, and the same first-error method used for GitHub Actions.",
    eyebrow: "GitLab · CircleCI",
    lede:
      "The product names change. The method does not: find the first real error, quote it, and rank anything that only failed afterwards.",
    keywords: [
      "GitLab CI failure",
      "CircleCI failure",
      "CI failure autopsy",
      "ERROR: Job failed",
      "CIRCLE_JOB",
    ],
    updatedAt: PUBLIC_LASTMOD,
    sections: [
      {
        heading: "GitLab: sections and ERROR: Job failed",
        paragraphs: [
          "GitLab wraps steps in section_start / section_end markers. The UI can collapse them; the raw job log still has the first compiler or installer error above ERROR: Job failed: exit code.",
          "Artifacts, after_script, and environment-stop jobs often fail because the main script already failed. Read the job that ran your tests or build, not the cleanup job, unless cleanup is the only red job.",
        ],
        list: [
          "Download the raw job log if the UI truncated the middle.",
          "Search for ERROR:, fatal:, and the first non-zero section.",
          "Check whether the job used the same image and Node version as your laptop.",
        ],
      },
      {
        heading: "CircleCI: CIRCLE_JOB and the spin-up tax",
        paragraphs: [
          "CircleCI prints a long spin-up and checkout before your commands. Skip that unless checkout itself failed. The useful line is usually inside the named CIRCLE_JOB step that ran npm test, gradle, or go test.",
          "Orbs and persist_to_workspace failures are often symptoms of an earlier compile error in the same workflow. Open the first failed job in the workflow graph, not the last.",
        ],
        code: {
          label: "Signals CauseCI looks for",
          content: `GitLab:  section_start:  ERROR: Job failed
CircleCI: CIRCLE_JOB  (plus the first Error: / FAIL in that job)
Actions:  ##[error]  actions/checkout`,
        },
      },
      {
        heading: "Same paste flow, any of these logs",
        paragraphs: [
          "CauseCI does not require a GitLab or Circle install. Paste the failed job output. The teaser returns the top cause; remaining ranks and a patch draft stay locked until you unlock the artifact.",
          "If you are on GitHub, an optional teaser Action can post a truncated excerpt and a link back to the paste page when a job fails. It is not a Marketplace publish — install it from the CauseCI repo path. The public install page is /guides/install-github-action-failure-teaser.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I paste a GitLab or CircleCI log even though the landing page mentions GitHub Actions?",
        answer:
          "Yes. The paste field accepts any of those job logs. Detection is from the text (section markers, CIRCLE_JOB, ##[error]), not from an OAuth install.",
      },
      {
        question: "Do you store the log forever?",
        answer:
          "Jobs persist in Supabase when that is configured; otherwise they live in process memory and vanish on restart. Do not paste secrets either way.",
      },
    ],
  },
  {
    slug: "npm-test-failed-github-actions",
    path: "/guides/npm-test-failed-github-actions",
    title: "npm test failed in GitHub Actions",
    description:
      "How to read a red npm test step in GitHub Actions: distinguish a lockfile install failure from a Jest or Vitest FAIL, and ignore Process completed with exit code 1.",
    eyebrow: "npm test · Jest · Vitest",
    lede:
      "When npm test fails in GitHub Actions, the last line is almost always Process completed with exit code 1. That is a wrapper. The cause is the first real error — a lockfile refusal, a Jest assertion, or a Vitest FAIL.",
    keywords: [
      "npm test failed GitHub Actions",
      "jest failed CI",
      "vitest FAIL CI",
      "Process completed with exit code 1",
      "lockfile vs test failure",
    ],
    updatedAt: "2026-09-18",
    sections: [
      {
        heading: "Start at the first FAIL, not exit code 1",
        paragraphs: [
          "A red npm test step almost always ends with Process completed with exit code 1. That line only means the process died. Scroll up in the failing step to the first FAIL, AssertionError, Error:, or npm error. That sentence is the diagnosis you are trying to name.",
          "Annotations in the Checks UI can point at a later upload or notify step that only failed because tests already died. Collapse every green step. The hang or crash is almost always the first non-zero exit.",
        ],
        list: [
          "Search the raw job log for FAIL, AssertionError, npm error, and ##[error].",
          "Quote the first of those lines — do not paraphrase the wrapper.",
          "If the first error is in an install step, npm test never ran. Treat that as a lockfile or installer failure.",
        ],
      },
      {
        heading: "Lockfile vs test: did npm test even run?",
        paragraphs: [
          "Lockfile drift and a failing assertion look the same in the Checks UI: a red job and exit code 1. They are not the same failure. npm ci / pnpm --frozen-lockfile / yarn --frozen-lockfile refuse to install when package.json and the lockfile disagree. If that step is red, the test runner never started.",
          "A real test failure happens after install succeeded. You will see a runner banner (vitest run, jest, or > npm test) and then FAIL plus Expected / Received. Reproduce with the same command CI used: npm ci && npm test, not a local npm install that already mutated the lockfile.",
        ],
        list: [
          "Lockfile: npm error `npm ci` can only install… / Missing: … from lock file / ERR_PNPM_OUTDATED_LOCKFILE. Fix by committing package.json and the lockfile together.",
          "Test: FAIL path/to/file.test.ts, AssertionError, Expected: / Received:. Open that file and line; re-run only that spec locally.",
          "If both appear in one paste, rank the lockfile first. Tests after a failed install are leftover output or a later job.",
        ],
        code: {
          label: "Same exit code, two different first errors",
          content: `# Lockfile — npm test never ran
npm error \`npm ci\` can only install packages when your
package.json and package-lock.json are in sync.
Missing: typescript@5.6.3 from lock file
Error: Process completed with exit code 1

# Test — install was green
> vitest run
 FAIL  src/billing.test.ts > Checkout > applies summer coupon
AssertionError: expected 20 to be 18
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Jest failed CI vs vitest FAIL",
        paragraphs: [
          "Jest and Vitest print different banners, same method. Find the first FAIL, then the file and assertion. A Jest failed CI log usually shows FAIL plus Expected / Received and a stack. Vitest FAIL CI logs show FAIL  path/to/file.test.ts, a ❯ pointer, and AssertionError. Neither wrapper is the cause.",
          "Re-run the cited file with the same Node version and CI=true. If it passes locally and fails only on the runner, look at timezone, locale, and env — not the exit code.",
        ],
        list: [
          "Jest: npx jest path/to/file.test.ts --runInBand",
          "Vitest: npx vitest run path/to/file.test.ts",
          "Match CI: same Node, frozen lockfile, CI=true.",
        ],
        code: {
          label: "What to copy from the Actions log",
          content: `FAIL  src/billing.test.ts > Checkout > applies summer coupon
AssertionError: expected 20 to be 18
 ❯ src/billing.test.ts:42:22`,
        },
      },
      {
        heading: "Paste the log when the first error is still unclear",
        paragraphs: [
          "If the log is long or the first error is buried under npm noise, paste the failed job output at /analyze. CauseCI returns a teaser with the top cause free. Remaining ranks and a patch draft stay locked until you unlock the artifact. The Action does not upload your log — a human still pastes it.",
          "An optional teaser Action can post a truncated excerpt and a paste link when a job fails. It is not a Marketplace publish. Install notes live at /guides/install-github-action-failure-teaser.",
        ],
        links: [
          { href: "/analyze", label: "Paste a log on CauseCI" },
          {
            href: ACTION_INSTALL_PATH,
            label: "Optional: install the failure-teaser Action",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Why does GitHub say Process completed with exit code 1 after npm test?",
        answer:
          "That line is a wrapper. The job died because an earlier command returned non-zero. Scroll up to the first FAIL, AssertionError, or npm error — that is the cause.",
      },
      {
        question: "How do I tell a lockfile failure from a Jest or Vitest FAIL?",
        answer:
          "If npm ci (or a frozen lockfile install) is the first red step, tests never ran. A Jest failed CI or vitest FAIL CI log shows a runner banner and FAIL plus Expected / Received after install succeeded.",
      },
      {
        question: "Do I need to install a GitHub Action to explain npm test failed GitHub Actions?",
        answer:
          "No. Paste the log at /analyze. The top cause is free. An optional teaser Action can comment a truncated excerpt and a link back; it does not upload the log and is not on the Marketplace.",
      },
    ],
  },
  {
    slug: "eslint-failed-github-actions",
    path: "/guides/eslint-failed-github-actions",
    title: "ESLint failed in GitHub Actions",
    description:
      "How to read a red ESLint / npm run lint step in GitHub Actions: distinguish a config or plugin install failure from a real lint violation, and ignore Process completed with exit code 1.",
    eyebrow: "ESLint · npm run lint",
    lede:
      "When ESLint fails in GitHub Actions, the last line is almost always Process completed with exit code 1. That is a wrapper. The cause is the first real error — a missing plugin or config, or a file:line error plus ✖.",
    keywords: [
      "eslint failed GitHub Actions",
      "ESLint Process completed with exit code 1",
      "npm run lint failed CI",
      "Process completed with exit code 1",
      "ESLint plugin install failure",
    ],
    updatedAt: "2026-09-19",
    sections: [
      {
        heading: "Start at the first error / ✖, not exit code 1",
        paragraphs: [
          "A red npm run lint or eslint step almost always ends with Process completed with exit code 1. That line only means the process died. Scroll up in the failing step to the first error, ✖, ##[error], or ESLint: line. That sentence is the diagnosis you are trying to name.",
          "Annotations in the Checks UI can point at a later upload or notify step that only failed because lint already died. Collapse every green step. The hang or crash is almost always the first non-zero exit.",
        ],
        list: [
          "Search the raw job log for error, ✖, ##[error], Failed to load, and Cannot find module.",
          "Quote the first of those lines — do not paraphrase the wrapper.",
          "If the first error is in an install step, npm run lint never ran. Treat that as a lockfile or installer failure.",
        ],
      },
      {
        heading: "Config/plugin install vs a real lint violation",
        paragraphs: [
          "A missing plugin and a rule violation look the same in the Checks UI: a red job and exit code 1. They are not the same failure. Failed to load config, Failed to load plugin, Cannot find module 'eslint-plugin-…', or ESLint couldn't find a config file means the linter never graded your source. If npm ci (or a frozen lockfile install) is red, lint never started.",
          "A real lint violation happens after ESLint loaded. You will see a path, a line:column, the word error, a rule id, and usually ✖ N problems. Reproduce with the same command CI used: npm ci && npm run lint, not an editor overlay that already mutated the lockfile or used a different config.",
        ],
        list: [
          "Install / config: Failed to load config… / Failed to load plugin… / Cannot find module 'eslint-plugin-…' / ESLint couldn't find eslint.config.*. Fix by committing the plugin (or shareable config) in package.json and the lockfile together, then re-run npm ci.",
          "Violation: path/to/file.ts:12:5  error  …  some-rule. Open that file and rule; re-run only that file locally.",
          "If both appear in one paste, rank the install or config load first. Violations after a failed load are leftover output or a later job.",
        ],
        code: {
          label: "Same exit code, two different first errors",
          content: `# Config / plugin — ESLint never graded source
Oops! Something went wrong! :(
ESLint: 9.12.0

Error: Failed to load plugin 'react' declared in 'eslint.config.mjs':
Cannot find module 'eslint-plugin-react'
Error: Process completed with exit code 1

# Violation — config loaded
/home/runner/work/app/src/index.ts
  12:5  error  'foo' is assigned a value but never used  no-unused-vars

✖ 1 problem (1 error, 0 warnings)
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Reproduce locally with the same Node and frozen lockfile",
        paragraphs: [
          "Editor squiggles are not the CI gate. Match the runner: same Node as actions/setup-node, a frozen lockfile install, then the exact lint script. If CI uses npm ci && npm run lint -- --max-warnings=0, run that — not npx eslint on a dirty node_modules.",
          "If it passes locally and fails only on the runner, the first error is usually a missing plugin in the committed lockfile, a different ESLint major, or a config file that exists on your laptop but was never committed.",
        ],
        list: [
          "Node: nvm use (or fnm) to the version in setup-node. Confirm with node -v.",
          "Install: npm ci — or pnpm install --frozen-lockfile / yarn --frozen-lockfile.",
          "Lint: CI=true npm run lint. Re-run one file with npx eslint path/to/file.ts once the full script fails the same way.",
        ],
        code: {
          label: "What to copy from the Actions log",
          content: `/home/runner/work/app/src/index.ts
  12:5  error  'foo' is assigned a value but never used  no-unused-vars
✖ 1 problem (1 error, 0 warnings)`,
        },
      },
      {
        heading: "Paste the log when the first error is still unclear",
        paragraphs: [
          "If the log is long or the first error is buried under npm noise, paste the failed job output at /analyze. CauseCI returns a teaser with the top cause free. Remaining ranks and a patch draft stay locked until you unlock the artifact. The Action does not upload your log — a human still pastes it.",
          "An optional teaser Action can post a truncated excerpt and a paste link when a job fails. It is not a Marketplace publish. Install from the public repo path uses: ipinney/causeci/action@main. Notes live at /guides/install-github-action-failure-teaser.",
        ],
        links: [
          { href: "/analyze", label: "Paste a log on CauseCI" },
          {
            href: ACTION_INSTALL_PATH,
            label: "Optional: install the failure-teaser Action",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Why does GitHub say Process completed with exit code 1 after ESLint?",
        answer:
          "That line is a wrapper. The job died because an earlier command returned non-zero. Scroll up to the first error, ✖, or ##[error] — that is the cause.",
      },
      {
        question: "How do I tell a config or plugin install failure from a real lint violation?",
        answer:
          "If npm ci is red, or ESLint prints Failed to load config / Failed to load plugin / Cannot find module, lint never graded your files. A real npm run lint failed CI violation shows a path, line:column, error, a rule id, and usually ✖ N problems after the config loaded.",
      },
      {
        question: "Do I need to install a GitHub Action to explain eslint failed GitHub Actions?",
        answer:
          "No. Paste the log at /analyze. The top cause is free. An optional teaser Action can comment a truncated excerpt and a link back; it does not upload the log and is not on the Marketplace. Public callers use ipinney/causeci/action@main.",
      },
    ],
  },
  {
    slug: ACTION_INSTALL_SLUG,
    path: ACTION_INSTALL_PATH,
    title: "Install the CauseCI GitHub Action",
    description:
      "Install the CauseCI failure-teaser Action from the repo path — not the Marketplace. On a red job it posts a truncated excerpt and a paste link. It does not upload your log.",
    eyebrow: "GitHub Action",
    lede:
      "When a GitHub Actions job fails, this Action writes a short teaser and a link back to CauseCI. A human pastes the log. The top cause on the site is free. Nothing is uploaded.",
    keywords: [
      "CauseCI GitHub Action",
      "install GitHub Action failure teaser",
      "ipinney/causeci/action",
      "CI failure teaser",
      "GitHub Actions paste link",
    ],
    updatedAt: "2026-09-18",
    sections: [
      {
        heading: "What it does — and what it does not",
        paragraphs: [
          "On if: failure(), the Action writes a job summary (and an optional pull-request comment) that tells someone to paste the log at CauseCI. Prefer tee on the failing step so log-path points at a real file.",
          "It is not on the GitHub Marketplace. Install it from this repository path: uses: ipinney/causeci/action@main. No CauseCI API key, no outbound email, and no secrets belong in the Action folder.",
        ],
        list: [
          "Does: truncated teaser + paste link to /analyze. Top cause on the site is free.",
          "Does not: upload the log to CauseCI, list on Marketplace, send email, or call paid tools.",
          "Does not: replace pasting the log. The Action is a reminder, not an autopsy.",
        ],
      },
      {
        heading: "Copy-paste workflow",
        paragraphs: [
          "Add a step that only runs when the job already failed. Capture the failing command with tee so the Action can excerpt the tail. Request pull-requests: write only if you want a PR comment; job summaries work with contents: read.",
        ],
        code: {
          label: ".github/workflows/ci.yml",
          content: `# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:

permissions:
  contents: read
  pull-requests: write   # only needed if you want a PR comment

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - name: Test
        run: npm test 2>&1 | tee ci.log
      - name: CauseCI teaser
        if: failure()
        uses: ipinney/causeci/action@main
        with:
          log-path: ci.log`,
        },
      },
      {
        heading: "Inputs",
        paragraphs: [
          "Every input is optional. Job summaries work with the defaults. Set log-path when you teed the failing step; omit it rather than paste credentials into the workflow.",
        ],
        table: {
          headers: ["Name", "Default", "Purpose"],
          rows: [
            [
              "github-token",
              "${{ github.token }}",
              "Optional PR comments. Job summaries work without a comment.",
            ],
            [
              "app-url",
              "https://causeci.vercel.app",
              "Origin used in the paste link.",
            ],
            [
              "log-path",
              "(empty)",
              "Optional file to excerpt. Prefer tee on the failing step.",
            ],
            [
              "comment-on-pr",
              "true",
              "Set false to write only $GITHUB_STEP_SUMMARY.",
            ],
            [
              "max-excerpt-chars",
              "600",
              "Tail of the redacted log, not the full file.",
            ],
          ],
        },
      },
      {
        heading: "Pin a SHA; private caller repos are fine",
        paragraphs: [
          "Pin a commit SHA instead of @main if you want a frozen install: uses: ipinney/causeci/action@<commit-sha>.",
          "CauseCI is a public repository. Public callers can use ipinney/causeci/action@main (or a pinned SHA) without requesting access. Private caller repositories are fine — GitHub Actions can consume a public Action from a private workflow.",
        ],
        code: {
          label: "Frozen install",
          content: "uses: ipinney/causeci/action@<commit-sha>",
        },
      },
      {
        heading: "What gets posted",
        paragraphs: [
          "A short explanation plus a Paste the log link to https://causeci.vercel.app/analyze. Repo, workflow, and run metadata when GitHub provides it. An optional details excerpt from log-path after conservative secret redaction (PATs, sk_live_, AKIA…, PEM blocks, Bearer, token= / password= assignments).",
          "The Action upserts a single comment marked <!-- causeci-teaser --> so retries do not spam the pull request.",
        ],
        list: [
          "Out of scope: Marketplace listing, uploading logs, email or other outbound messaging, paid analytics.",
        ],
        links: [
          {
            href: ACTION_SOURCE_URL,
            label: "Action source on GitHub",
            external: true,
          },
          {
            href: ACTION_README_URL,
            label: "action/README.md",
            external: true,
          },
          { href: "/analyze", label: "Paste a log on CauseCI" },
        ],
      },
    ],
    faqs: [
      {
        question: "Is this Action on the GitHub Marketplace?",
        answer:
          "No. Install it from the repository path ipinney/causeci/action@main (or a commit SHA). There is no Marketplace listing.",
      },
      {
        question: "Does the Action upload my CI log?",
        answer:
          "No. It writes a truncated teaser and a paste link. A human pastes the log at /analyze. The top cause is free.",
      },
      {
        question: "Can a private repository use the Action?",
        answer:
          "Yes. CauseCI is public. Public callers use ipinney/causeci/action@main (or a pinned SHA). A private caller repo does not need extra access to this Action.",
      },
      {
        question: "Do I need an API key or paid plan to install it?",
        answer:
          "No. There is no CauseCI API key. The Action only posts a reminder. Autopsies still happen when someone pastes the log.",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function guideRoutes(): PublicRoute[] {
  return GUIDES.map((guide) => ({
    path: guide.path,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: guide.updatedAt,
  }));
}

export function otherGuides(slug: string): Guide[] {
  return GUIDES.filter((guide) => guide.slug !== slug);
}
