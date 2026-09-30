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
          {
            href: "/guides/pytest-failed-github-actions",
            label: "pytest failed in GitHub Actions",
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
    slug: "typescript-failed-github-actions",
    path: "/guides/typescript-failed-github-actions",
    title: "TypeScript / tsc failed in GitHub Actions",
    description:
      "How to read a red tsc / npm run build / npx tsc --noEmit step in GitHub Actions: distinguish an install or node_modules failure from a real type error, and ignore Process completed with exit code 1.",
    eyebrow: "TypeScript · tsc · npm run build",
    lede:
      "When TypeScript fails in GitHub Actions, the last line is almost always Process completed with exit code 1. That is a wrapper. The cause is the first real error — a missing typescript / node_modules install, or error TSxxxx at a file:line.",
    keywords: [
      "typescript failed GitHub Actions",
      "tsc failed CI",
      "npx tsc --noEmit failed",
      "Process completed with exit code 1",
      "error TS GitHub Actions",
    ],
    updatedAt: "2026-09-21",
    sections: [
      {
        heading: "Start at the first error TS, not exit code 1",
        paragraphs: [
          "A red tsc, npm run build, or npx tsc --noEmit step almost always ends with Process completed with exit code 1. That line only means the process died. Scroll up in the failing step to the first error TS, Type error:, Cannot find module, or ##[error]. That sentence is the diagnosis you are trying to name.",
          "Annotations in the Checks UI can point at a later upload or notify step that only failed because the compiler already died. Collapse every green step. The hang or crash is almost always the first non-zero exit.",
        ],
        list: [
          "Search the raw job log for error TS, Type error:, Cannot find module, and ##[error].",
          "Quote the first of those lines — do not paraphrase the wrapper.",
          "If the first error is in an install step, tsc never ran. Treat that as a lockfile or installer failure.",
        ],
      },
      {
        heading: "Install / node_modules vs a real type error",
        paragraphs: [
          "A missing typescript package and a type mismatch look the same in the Checks UI: a red job and exit code 1. They are not the same failure. Cannot find module 'typescript', tsc: not found, or a red npm ci / frozen lockfile install means the compiler never typed your source. If node_modules is missing or cache-restored empty, npx tsc --noEmit never started.",
          "A real type error happens after tsc loaded. You will see path:line:col - error TSxxxx and usually Found N errors. Next.js npm run build wraps the same codes as Type error:. Reproduce with the same command CI used: npm ci && npx tsc --noEmit (or npm run build), not a laptop tsc that already has a dirty node_modules.",
        ],
        list: [
          "Install / node_modules: Cannot find module 'typescript' / tsc: not found / npm error `npm ci` can only install… / Missing: typescript@… from lock file. Fix by committing package.json and the lockfile together, then re-run npm ci.",
          "Type error: src/app.ts:12:3 - error TS2322: Type 'string' is not assignable to type 'number'. Open that file and line; re-run npx tsc --noEmit locally.",
          "If both appear in one paste, rank the install or missing node_modules first. error TS lines after a failed install are leftover output or a later job.",
        ],
        code: {
          label: "Same exit code, two different first errors",
          content: `# Install / node_modules — tsc never typed source
npm error \`npm ci\` can only install packages when your
package.json and package-lock.json are in sync.
Missing: typescript@5.6.3 from lock file
Error: Process completed with exit code 1

# Type error — compiler loaded
src/app.ts:12:3 - error TS2322: Type 'string' is not assignable to type 'number'.
Found 1 error in src/app.ts:12
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Reproduce locally with the same Node and frozen lockfile",
        paragraphs: [
          "Editor squiggles are not the CI gate. Match the runner: same Node as actions/setup-node, a frozen lockfile install, then the exact compile script. If CI uses npm ci && npx tsc --noEmit, run that — not tsc on a dirty node_modules or a different tsconfig.",
          "If it passes locally and fails only on the runner, the first error is usually a missing typescript (or @types) package in the committed lockfile, a different TypeScript major, or a tsconfig that exists on your laptop but was never committed.",
        ],
        list: [
          "Node: nvm use (or fnm) to the version in setup-node. Confirm with node -v.",
          "Install: npm ci — or pnpm install --frozen-lockfile / yarn --frozen-lockfile.",
          "Compile: CI=true npx tsc --noEmit. If CI runs npm run build, run that once the noEmit command fails the same way.",
        ],
        code: {
          label: "What to copy from the Actions log",
          content: `src/app.ts:12:3 - error TS2322: Type 'string' is not assignable to type 'number'.
Found 1 error in src/app.ts:12`,
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
        question: "Why does GitHub say Process completed with exit code 1 after tsc?",
        answer:
          "That line is a wrapper. The job died because an earlier command returned non-zero. Scroll up to the first error TS, Type error:, or ##[error] — that is the cause.",
      },
      {
        question: "How do I tell an install or node_modules failure from a real type error?",
        answer:
          "If npm ci is red, or the log prints Cannot find module 'typescript' / tsc: not found, the compiler never typed your files. A real tsc failed CI or npx tsc --noEmit failed log shows path:line:col - error TSxxxx (or Next.js Type error:) after the compiler loaded.",
      },
      {
        question: "Do I need to install a GitHub Action to explain typescript failed GitHub Actions?",
        answer:
          "No. Paste the log at /analyze. The top cause is free. An optional teaser Action can comment a truncated excerpt and a link back; it does not upload the log and is not on the Marketplace. Public callers use ipinney/causeci/action@main.",
      },
    ],
  },
  {
    slug: "pytest-failed-github-actions",
    path: "/guides/pytest-failed-github-actions",
    title: "pytest failed in GitHub Actions",
    description:
      "How to read a red pytest / python -m pytest step in GitHub Actions: distinguish a pip install or requirements drift failure from a real FAILED test, and ignore Process completed with exit code 1.",
    eyebrow: "pytest · Python · pip",
    lede:
      "When pytest fails in GitHub Actions, the last line is almost always Process completed with exit code 1. That is a wrapper. The cause is the first real error — a pip install / requirements drift, or a FAILED test with an assertion.",
    keywords: [
      "pytest failed GitHub Actions",
      "pytest failed CI",
      "Process completed with exit code 1",
      "FAILED tests",
      "pip install / requirements drift",
    ],
    updatedAt: "2026-09-22",
    sections: [
      {
        heading: "Start at the first FAILED / ERROR, not exit code 1",
        paragraphs: [
          "A red pytest or python -m pytest step almost always ends with Process completed with exit code 1. That line only means the process died. Scroll up in the failing step to the first FAILED, ERROR, E   AssertionError, ModuleNotFoundError, or ##[error]. That sentence is the diagnosis you are trying to name.",
          "Annotations in the Checks UI can point at a later upload or notify step that only failed because pytest already died. Collapse every green step. The hang or crash is almost always the first non-zero exit.",
        ],
        list: [
          "Search the raw job log for FAILED, ERROR, AssertionError, ModuleNotFoundError, and ##[error].",
          "Quote the first of those lines — do not paraphrase the wrapper.",
          "If the first error is in a pip install / setup-python step, pytest never ran. Treat that as an install or requirements failure.",
        ],
      },
      {
        heading: "pip install / requirements drift vs a real FAILED test",
        paragraphs: [
          "A broken pip install and a failing assertion look the same in the Checks UI: a red job and exit code 1. They are not the same failure. Could not find a version that satisfies…, No matching distribution found, ERROR: ResolutionImpossible, or ModuleNotFoundError before any test collection means pytest never graded your suite. If the install / setup step is red, the runner never started.",
          "A real FAILED test happens after install and collection succeeded. You will see a pytest banner, then FAILED path/to/test_….py::test_name, short test summary info, and usually = N failed. Reproduce with the same Python and deps CI used: pip install -r requirements.txt && pytest, not a laptop venv that already drifted from the committed requirements or lock file.",
        ],
        list: [
          "Install / requirements: Could not find a version that satisfies… / No matching distribution found for … / ERROR: ResolutionImpossible / ModuleNotFoundError: No module named '…' during collection. Fix by committing requirements.txt (or poetry.lock / uv.lock / Pipfile.lock) with the same pins CI installs, then re-run the install step.",
          "FAILED test: FAILED tests/test_billing.py::test_coupon - AssertionError: assert 20 == 18. Open that file and assertion; re-run only that node id locally.",
          "If both appear in one paste, rank the install or requirements drift first. FAILED lines after a failed pip install are leftover output or a later job.",
        ],
        code: {
          label: "Same exit code, two different first errors",
          content: `# Install / requirements — pytest never ran
ERROR: Could not find a version that satisfies the requirement
requests==2.31.0 (from -r requirements.txt (line 3))
No matching distribution found for requests==2.31.0
Error: Process completed with exit code 1

# FAILED test — install and collection were green
=========================== short test summary info ============================
FAILED tests/test_billing.py::test_coupon - AssertionError: assert 20 == 18
============================== 1 failed in 0.12s ===============================
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Reproduce locally with the same Python and deps as CI",
        paragraphs: [
          "A local venv is not the CI gate. Match the runner: same Python as actions/setup-python, the same requirements or lock install, then the exact pytest command. If CI uses pip install -r requirements.txt && pytest -q, run that — not pytest on a dirty site-packages that already has extra packages.",
          "If it passes locally and fails only on the runner, the first error is usually requirements drift (uncommitted pin change), a different Python minor, missing system libs, or an env var / secret the laptop already has.",
        ],
        list: [
          "Python: pyenv (or conda) to the version in setup-python. Confirm with python -V.",
          "Install: pip install -r requirements.txt — or poetry install --no-root / uv sync / pipenv install --deploy with the committed lock.",
          "Test: CI=true pytest. Re-run one node with pytest path/to/test_file.py::test_name once the full suite fails the same way.",
        ],
        code: {
          label: "What to copy from the Actions log",
          content: `FAILED tests/test_billing.py::test_coupon - AssertionError: assert 20 == 18
============================== 1 failed in 0.12s ===============================`,
        },
      },
      {
        heading: "Paste the log when the first error is still unclear",
        paragraphs: [
          "If the log is long or the first error is buried under pip noise, paste the failed job output at /analyze. CauseCI returns a teaser with the top cause free. Remaining ranks and a patch draft stay locked until you unlock the artifact. The Action does not upload your log — a human still pastes it.",
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
        question: "Why does GitHub say Process completed with exit code 1 after pytest?",
        answer:
          "That line is a wrapper. The job died because an earlier command returned non-zero. Scroll up to the first FAILED, ERROR, AssertionError, or ##[error] — that is the cause.",
      },
      {
        question: "How do I tell a pip install / requirements failure from a real FAILED test?",
        answer:
          "If pip install (or poetry / uv / pipenv) is red, or the log prints Could not find a version / No matching distribution / ModuleNotFoundError before collection, pytest never graded your suite. A real pytest failed CI log shows FAILED path::test_name and short test summary info after install succeeded.",
      },
      {
        question: "Do I need to install a GitHub Action to explain pytest failed GitHub Actions?",
        answer:
          "No. Paste the log at /analyze. The top cause is free. An optional teaser Action can comment a truncated excerpt and a link back; it does not upload the log and is not on the Marketplace. Public callers use ipinney/causeci/action@main.",
      },
    ],
  },
  {
    slug: "jest-failed-github-actions",
    path: "/guides/jest-failed-github-actions",
    title: "Jest failed in GitHub Actions",
    description:
      "How to read a red Jest / npx jest / npm test step in GitHub Actions: distinguish an npm ci or node_modules drift failure from a real Jest FAIL, and ignore Process completed with exit code 1.",
    eyebrow: "Jest · npm test · npm ci",
    lede:
      "When Jest fails in GitHub Actions, the last line is almost always Process completed with exit code 1. That is a wrapper. The cause is the first real error — an npm ci / node_modules drift, or a FAIL with Expected / Received.",
    keywords: [
      "jest failed GitHub Actions",
      "jest failed CI",
      "Process completed with exit code 1",
      "Test Suites failed",
      "npm ci / node_modules drift",
    ],
    updatedAt: "2026-09-23",
    sections: [
      {
        heading: "Start at the first FAIL, not exit code 1",
        paragraphs: [
          "A red npx jest or npm test step almost always ends with Process completed with exit code 1. Ignore that wrapper line. It only means the process died. Scroll up in the failing step to the first FAIL path, Expected / Received, Test Suites: N failed, or ##[error]. That sentence is the diagnosis you are trying to name.",
          "Annotations in the Checks UI can point at a later upload or notify step that only failed because Jest already died. Collapse every green step. The hang or crash is almost always the first non-zero exit.",
        ],
        list: [
          "Search the raw job log for FAIL, Expected, Received, Test Suites:, and ##[error].",
          "Quote the first of those lines — do not paraphrase the wrapper.",
          "If the first error is in an npm ci or install step, Jest never ran. Treat that as install or node_modules drift.",
        ],
      },
      {
        heading: "npm ci / node_modules drift vs a real Jest FAIL",
        paragraphs: [
          "A broken install and a failing assertion look the same in the Checks UI: a red job and exit code 1. They are not the same failure. npm error `npm ci` can only install…, Missing: … from lock file, Cannot find module 'jest', or jest: not found means the runner never graded your suite. If node_modules is missing, cache-restored empty, or drifted from the lockfile, npx jest never started.",
          "A real Jest FAIL happens after install succeeded. You will see a Jest banner, then FAIL path/to/file.test.ts, Expected / Received, and Test Suites: N failed. Reproduce with the same command CI used: npm ci && npx jest, or npm ci && npm test when the script is jest — not a laptop npm install that already mutated node_modules.",
        ],
        list: [
          "Install / node_modules: npm error `npm ci` can only install… / Missing: … from lock file / Cannot find module 'jest' / jest: not found. Fix by committing package.json and the lockfile together, then re-run npm ci.",
          "Jest FAIL: FAIL path/to/file.test.ts with Expected: 18 / Received: 20, then Test Suites: N failed. Open that file and assertion; re-run only that path locally.",
          "If both appear in one paste, rank the install or node_modules drift first. FAIL lines after a failed npm ci are leftover output or a later job.",
        ],
        code: {
          label: "Same exit code, two different first errors",
          content: `# Install / node_modules — Jest never ran
npm error \`npm ci\` can only install packages when your
package.json and package-lock.json are in sync.
Missing: jest@29.7.0 from lock file
Error: Process completed with exit code 1

# Jest FAIL — install was green
FAIL src/billing.test.ts
  ● Checkout › applies summer coupon

    expect(received).toBe(expected) // Object.is equality

    Expected: 18
    Received: 20

Test Suites: 1 failed, 4 passed, 5 total
Tests:       1 failed, 12 passed, 13 total
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Reproduce locally with the same command CI used",
        paragraphs: [
          "A warm node_modules on your laptop is not the CI gate. Match the runner: same Node as actions/setup-node, a frozen lockfile install, then the exact Jest command. If CI uses npm ci && npx jest, run that — not jest on a dirty node_modules or a jest.config that was never committed.",
          "If the workflow script is npm test and package.json runs jest, reproduce with npm ci && npm test. If it passes locally and fails only on the runner, the first error is usually lockfile drift, a different Node major, timezone or CI=true, or an env var the laptop already has.",
        ],
        list: [
          "Node: nvm use (or fnm) to the version in setup-node. Confirm with node -v.",
          "Install: npm ci — do not reuse a laptop node_modules that drifted from the lockfile.",
          "Test: CI=true npx jest, or npm test when that script is jest. The full reproduce is npm ci && npx jest (or npm ci && npm test). Re-run one file with npx jest path/to/file.test.ts --runInBand.",
        ],
        code: {
          label: "What to copy from the Actions log",
          content: `FAIL src/billing.test.ts
  ● Checkout › applies summer coupon
    Expected: 18
    Received: 20
Test Suites: 1 failed, 4 passed, 5 total`,
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
          {
            href: "/guides/npm-test-failed-github-actions",
            label: "npm test failed in GitHub Actions",
          },
          {
            href: "/guides/typescript-failed-github-actions",
            label: "TypeScript / tsc failed in GitHub Actions",
          },
          {
            href: "/guides/eslint-failed-github-actions",
            label: "ESLint failed in GitHub Actions",
          },
          {
            href: "/guides/pytest-failed-github-actions",
            label: "pytest failed in GitHub Actions",
          },
          {
            href: "/guides/explain-github-actions-failure",
            label: "Explain this GitHub Actions failure",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Why does GitHub say Process completed with exit code 1 after Jest?",
        answer:
          "That line is a wrapper. Ignore it. The job died because an earlier command returned non-zero. Scroll up to the first FAIL path, Expected / Received, or Test Suites: N failed — that is the cause.",
      },
      {
        question: "How do I tell an npm ci or node_modules failure from a real Jest FAIL?",
        answer:
          "If npm ci is red, or the log prints Cannot find module 'jest' / jest: not found / Missing: … from lock file, Jest never graded your suite. A real jest failed CI log shows FAIL path/to/file.test.ts, Expected / Received, and Test Suites: N failed after install succeeded.",
      },
      {
        question: "Do I need to install a GitHub Action to explain jest failed GitHub Actions?",
        answer:
          "No. Paste the log at /analyze. The top cause is free. An optional teaser Action can comment a truncated excerpt and a link back; it does not upload the log and is not on the Marketplace. Public callers use ipinney/causeci/action@main.",
      },
    ],
  },
  {
    slug: "vitest-failed-github-actions",
    path: "/guides/vitest-failed-github-actions",
    title: "Vitest failed in GitHub Actions",
    description:
      "How to read a red Vitest / npx vitest run / npm test step in GitHub Actions: distinguish an npm ci or lockfile failure from a real Vitest FAIL, and ignore Process completed with exit code 1.",
    eyebrow: "Vitest · npx vitest run · pool",
    lede:
      "When Vitest fails in GitHub Actions, the last line is almost always Process completed with exit code 1. That is a wrapper. The cause is the first real error — a lockfile or install refusal, or a Vitest FAIL (assertion, import, jsdom/happy-dom, snapshot, timeout, or worker OOM).",
    keywords: [
      "vitest failed GitHub Actions",
      "vitest FAIL CI",
      "vitest Process completed with exit code 1",
      "Process completed with exit code 1",
      "npx vitest run failed",
    ],
    updatedAt: "2026-09-24",
    sections: [
      {
        heading: "Start at the first FAIL, not exit code 1",
        paragraphs: [
          "A red npx vitest run or npm test step almost always ends with Process completed with exit code 1. Ignore that wrapper line. It only means the process died. Scroll up in the failing step to the first RUN  v banner, FAIL  path, AssertionError, Failed to resolve import, or ##[error]. That sentence is the diagnosis you are trying to name.",
          "Vitest does not print Jest's Test Suites: line or Expected: / Received: labels. A vitest FAIL CI log starts with RUN  vX.Y.Z, then FAIL  src/file.test.ts > suite > name, an AssertionError, and a ❯ frame. If you only see Test Suites:, you are looking at Jest.",
        ],
        list: [
          "Search the raw job log for RUN  v, FAIL  , AssertionError, Failed to resolve import, and ##[error].",
          "Quote the first of those lines — do not paraphrase the wrapper Process completed with exit code 1.",
          "If the first error is in an npm ci or install step, Vitest never ran. Treat that as lockfile or install drift.",
        ],
      },
      {
        heading: "Common Vitest CI failures",
        paragraphs: [
          "After install succeeded, the first red block is one of a short list. A Vite transform or unresolved import fails before any expect() runs. An assertion, snapshot, timeout, environment, or worker crash fails after the file loaded. The npm test guide covers whichever runner sits behind npm test; this page is the Vitest banner, pool, and Vite transform.",
          "Pool and forks are Vitest-specific. CI often sets --pool=forks or maxWorkers. Too many workers on a small runner dies as Killed, exit 137, JavaScript heap out of memory, or Worker terminated due to reaching memory limit — not as an assertion. Shrink fileParallelism or maxForks before raising NODE_OPTIONS.",
        ],
        list: [
          "Assertion: FAIL  src/billing.test.ts > Checkout > applies summer coupon, then AssertionError: expected 20 to be 18. Open that file and line.",
          "Import / Vite transform: Failed to resolve import \"@/lib/coupon\" or [vite:esbuild] Transform failed. The test body never ran. Fix the specifier, the tsconfig paths alias, or the syntax error Vite is compiling.",
          "jsdom / happy-dom: ReferenceError: document is not defined or window is not defined means the file ran in the node environment. Cannot find package 'jsdom' or MISSING DEPENDENCY happy-dom means the environment package is not installed. Match environment in vitest.config to what the test touches.",
          "Snapshot: Snapshot `Invoice > renders the header 1` mismatched, or a toMatchSnapshot / toMatchFileSnapshot diff. Re-run npx vitest run -u only after the new output is the one you want, then commit the snapshot.",
          "Timeout: Test timed out in 5000ms, or a hook timed out. A hung fetch, an uncleared timer, or vitest left in watch mode (no run, and CI unset) waits until the job limit.",
          "OOM / workers: exit 137, Killed, or a forks pool that spawned more workers than the runner can hold. Re-run with --pool=forks --maxWorkers=2, or the same flags CI used, reduced.",
        ],
        code: {
          label: "Vitest FAIL log excerpt",
          content: ` RUN  v3.2.4 /home/runner/work/app/app

 ❯ src/billing.test.ts (3 tests | 1 failed) 28ms
   × Checkout > applies summer coupon 12ms
     → expected 20 to be 18

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/billing.test.ts > Checkout > applies summer coupon
AssertionError: expected 20 to be 18

- Expected
+ Received

- 18
+ 20

 ❯ src/billing.test.ts:42:28
     40|   const total = applyCoupon(cart, "SUMMER");
     41|
     42|   expect(total).toBe(18);
       |                            ^
     43| });

 Test Files  1 failed | 4 passed (5)
      Tests  1 failed | 12 passed (13)
   Start at  14:02:11
   Duration  1.84s (transform 210ms, setup 0ms, collect 480ms, tests 90ms, environment 1.12s, prepare 320ms)

##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Reproduce with the same CI command",
        paragraphs: [
          "A warm node_modules and a Vitest watch session on your laptop are not the CI gate. Match the runner: same Node as actions/setup-node, a frozen lockfile install, then the exact Vitest command. If CI uses npx vitest run, run that. If the workflow script is npm test and package.json invokes vitest, reproduce with npm ci && npm test.",
          "vitest without run stays in watch mode unless CI=true. GitHub Actions sets CI, so a script of vitest usually exits there. A local shell without CI set hangs with no FAIL. Pass run when you copy the command off the runner, and pass the same --pool=forks or --maxWorkers flags the workflow used.",
        ],
        list: [
          "Node: nvm use (or fnm) to the version in setup-node. Confirm with node -v.",
          "Install: npm ci — do not reuse a laptop node_modules that drifted from the lockfile.",
          "Test: CI=true npx vitest run, or npm test when that script invokes vitest. The full reproduce is npm ci && npx vitest run (or npm ci && npm test). One file: npx vitest run src/billing.test.ts.",
        ],
        code: {
          label: "Same command the runner used",
          content: `npm ci && npx vitest run
# when package.json "test" invokes vitest:
npm ci && npm test
# one file, same pool CI used:
npx vitest run src/billing.test.ts --pool=forks --maxWorkers=2`,
        },
      },
      {
        heading: "When the lockfile failed first, tests never ran",
        paragraphs: [
          "A broken install and a failing assertion look the same in the Checks UI: a red job and exit code 1. They are not the same failure. npm error `npm ci` can only install…, Missing: vitest@… from lock file, ERR_PNPM_OUTDATED_LOCKFILE, Cannot find module 'vitest', or vitest: not found means the runner never graded your suite. If node_modules is missing or the lockfile drifted, npx vitest run never started.",
          "If both an install error and a FAIL appear in one paste, rank the lockfile first. FAIL lines after a failed npm ci are leftover output or a later job. Do not debug jsdom, snapshots, or forks until the install step is green.",
        ],
        list: [
          "Install / lockfile: npm error `npm ci` can only install… / Missing: … from lock file / Cannot find module 'vitest' / vitest: not found. Commit package.json and the lockfile together, then re-run npm ci.",
          "Vitest FAIL: a RUN  v banner, then FAIL  path > name, after npm ci was green.",
          "Jest prints FAIL path and Test Suites: N failed. Vitest prints RUN  v, FAIL  file > name, and Vite transform errors. The npm test guide is the split for any script; this page is only the Vitest runner.",
        ],
        code: {
          label: "Same exit code, two different first errors",
          content: `# Install / lockfile — Vitest never ran
npm error \`npm ci\` can only install packages when your
package.json and package-lock.json are in sync.
Missing: vitest@3.2.4 from lock file
Error: Process completed with exit code 1

# Vitest FAIL — install was green
 RUN  v3.2.4 /home/runner/work/app/app

 FAIL  src/billing.test.ts > Checkout > applies summer coupon
AssertionError: expected 20 to be 18
 ❯ src/billing.test.ts:42:28

 Test Files  1 failed | 4 passed (5)
##[error]Process completed with exit code 1

# Vite transform — collection failed before the assertion
src/billing.ts:40:0: ERROR: Expected "}" but found end of file
[vite:esbuild] Transform failed with 1 error:
src/billing.ts:40:0: ERROR: Expected "}" but found end of file
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Paste the log when the first error is still unclear",
        paragraphs: [
          "If the log is long or the first error is buried under Vite transform noise, paste the failed job output at /analyze. CauseCI returns a teaser with the top cause free. Remaining ranks and a patch draft stay locked until you unlock the artifact. The Action does not upload your log — a human still pastes it.",
          "An optional teaser Action can post a truncated excerpt and a paste link when a job fails. It is not a Marketplace publish. Install from the public repo path uses: ipinney/causeci/action@main. Notes live at /guides/install-github-action-failure-teaser.",
        ],
        links: [
          { href: "/analyze", label: "Paste a log on CauseCI" },
          {
            href: ACTION_INSTALL_PATH,
            label: "Optional: install the failure-teaser Action",
          },
          {
            href: "/guides/jest-failed-github-actions",
            label: "Jest failed in GitHub Actions",
          },
          {
            href: "/guides/npm-test-failed-github-actions",
            label: "npm test failed in GitHub Actions",
          },
          {
            href: "/guides/typescript-failed-github-actions",
            label: "TypeScript / tsc failed in GitHub Actions",
          },
          {
            href: "/guides/eslint-failed-github-actions",
            label: "ESLint failed in GitHub Actions",
          },
          {
            href: "/guides/pytest-failed-github-actions",
            label: "pytest failed in GitHub Actions",
          },
          {
            href: "/guides/explain-github-actions-failure",
            label: "Explain this GitHub Actions failure",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Why does GitHub say Process completed with exit code 1 after Vitest?",
        answer:
          "That line is a wrapper. The phrase vitest Process completed with exit code 1 is the wrapper, not the diagnosis. Scroll up to the first FAIL  path, AssertionError, Failed to resolve import, or ##[error] — that is the cause.",
      },
      {
        question: "How do I tell an npm ci or lockfile failure from a real Vitest FAIL?",
        answer:
          "If npm ci is red, or the log prints Cannot find module 'vitest' / vitest: not found / Missing: … from lock file, Vitest never graded your suite. A real vitest FAIL CI log shows a RUN  v banner, FAIL  path > name, and AssertionError after install succeeded.",
      },
      {
        question: "How is a Vitest failure different from Jest or a generic npm test failure?",
        answer:
          "Jest prints FAIL path, Expected / Received, and Test Suites: N failed. Vitest prints RUN  v, FAIL  file > name, a ❯ frame, Vite transform errors (Failed to resolve import, [vite:esbuild] Transform failed), and pool/forks worker lines. If you are not sure which runner npm test invoked, start with the npm test guide.",
      },
      {
        question: "Do I need to install a GitHub Action to explain vitest failed GitHub Actions?",
        answer:
          "No. Paste the log at /analyze. The top cause is free. An optional teaser Action can comment a truncated excerpt and a link back; it does not upload the log and is not on the Marketplace. Public callers use ipinney/causeci/action@main.",
      },
    ],
  },
  {
    slug: "playwright-failed-github-actions",
    path: "/guides/playwright-failed-github-actions",
    title: "Playwright failed in GitHub Actions",
    description:
      "How to read a red Playwright / npx playwright test step in GitHub Actions: distinguish a browser install, missing OS libraries, or version skew from a real e2e failure, and ignore Process completed with exit code 1.",
    eyebrow: "Playwright · npx playwright test · browsers",
    lede:
      "When Playwright fails in GitHub Actions, the last line is almost always Process completed with exit code 1. That is a wrapper. The cause is the first real error — browsers not installed, missing OS libraries, a version skew, a headed launch with no display, a timeout, or a failed e2e assertion.",
    keywords: [
      "playwright failed GitHub Actions",
      "playwright test failed CI",
      "playwright Process completed with exit code 1",
      "Process completed with exit code 1",
      "npx playwright test failed",
    ],
    updatedAt: "2026-09-25",
    sections: [
      {
        heading: "Start at the first error, not exit code 1",
        paragraphs: [
          "A red npx playwright test step almost always ends with Process completed with exit code 1. Ignore that wrapper line. It only means the process died. Scroll up in the failing step to the first Error:, browserType.launch, Executable doesn't exist, Test timeout of, or ##[error]. That sentence is the diagnosis you are trying to name.",
          "Playwright does not print Jest's FAIL path or Test Suites: line, and it does not print Vitest's RUN  v banner. A playwright test failed CI log starts with Running N tests using M workers, then a ✘ line, then 1) [chromium] › path:line › title and an Error: block. If you only see FAIL path or RUN  v, you are looking at Jest or Vitest.",
        ],
        list: [
          "Search the raw job log for Error:, browserType.launch, Executable doesn't exist, Test timeout of, and ##[error].",
          "Quote the first of those lines — do not paraphrase the wrapper Process completed with exit code 1.",
          "If the first error is in an npm ci or install step, Playwright never ran. Treat that as lockfile or install drift.",
        ],
      },
      {
        heading: "Common Playwright CI failures",
        paragraphs: [
          "After the npm install succeeded, the first red block is one of a short list. Rank it in this order. A missing browser or a missing system library fails before any test body runs. A timeout, assertion, flake, or screenshot diff fails after the browser launched. The npm test guide covers whichever runner sits behind npm test; this page is the Playwright browser, project, and trace.",
          "Playwright's own CI notes recommend workers: 1 on GitHub-hosted runners so each test gets the machine. More workers than cores shows up as timeouts and flakes, not as a clear 'too many workers' line. Caching browser binaries is not recommended: restore time is about the same as a download, and OS libraries are not cacheable. If a workflow caches ~/.cache/ms-playwright anyway, the cache key has to include the Playwright version or the next bump launches a revision that is not in the cache.",
        ],
        list: [
          "npm package missing: Cannot find module '@playwright/test' or playwright: not found. The suite never started. Fix the lockfile install before you touch a spec.",
          "Browsers missing or the wrong revision: browserType.launch: Executable doesn't exist at …/chromium_headless_shell-<revision>/…, then Please run the following command to download new browsers: npx playwright install. npm ci does not download browsers. The revision in that path belongs to one @playwright/test version.",
          "OS libraries: Host system is missing dependencies to run browsers, often with libnss3 or libnspr4. npx playwright install downloads binaries only. The CI command that installs both is npx playwright install --with-deps. The log may also say npx playwright install-deps.",
          "Headed on a headless runner: headless is the default. headless: false or --headed on ubuntu-latest dies with no display. The log says you launched a headed browser without a XServer, or Missing X server or $DISPLAY. Use headless in CI, or prefix the command with xvfb-run.",
          "Timeout: Test timeout of 30000ms exceeded, page.goto: Timeout 30000ms exceeded, or Error: Timed out waiting 60000ms from config.webServer. The app, webServer, or a networkidle wait did not finish. A hung HTML report (CI unset, so the reporter keeps serving) waits until the job limit.",
          "Assertion: Error: expect(locator).toHaveText(expected) failed, with Expected / Received, or a strict mode violation because a locator matched two elements. The browser did launch. Open that spec and line.",
          "Flake: retries (the scaffold sets retries: process.env.CI ? 2 : 0) turn a recovered failure into 1 flaky, and the job can still exit 0. A red job prints 1 failed after the last attempt. Read the last attempt. The first attempt is the flake, not always the cause of the red job.",
          "Screenshot: Error: A snapshot doesn't exist at …-linux.png, writing actual, or a toHaveScreenshot pixel diff. Baselines are per OS. A darwin or win32 snapshot does not satisfy ubuntu-latest. Update snapshots on the same runner or image, then commit the linux file.",
          "Artifacts: the error block names a screenshot and a trace.zip, plus npx playwright show-trace. Those files live under test-results/ and the HTML report under playwright-report/. They are deleted with the runner unless you upload them.",
        ],
        code: {
          label: "Playwright test failure log excerpt",
          content: `Running 12 tests using 1 worker

  ✘  1 [chromium] › e2e/checkout.spec.ts:18:3 › Checkout › applies summer coupon (5.2s)

  1) [chromium] › e2e/checkout.spec.ts:18:3 › Checkout › applies summer coupon

    Error: expect(locator).toHaveText(expected) failed

    Locator:  getByTestId('total')
    Expected: "18"
    Received: "20"
    Timeout:  5000ms

    Call log:
      - Expect "toHaveText" with timeout 5000ms
      - waiting for getByTestId('total')

      20 |   await page.getByRole('button', { name: 'Apply' }).click();
      21 |   await expect(page.getByTestId('total')).toHaveText('18');
         |                                            ^
      22 | });

    attachment #1: screenshot (image/png)
    test-results/checkout-Checkout-applies-summer-coupon-chromium/test-failed-1.png

    attachment #2: trace (application/zip)
    test-results/checkout-Checkout-applies-summer-coupon-chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/checkout-Checkout-applies-summer-coupon-chromium/trace.zip

  1 failed
    [chromium] › e2e/checkout.spec.ts:18:3 › Checkout › applies summer coupon
  11 passed (18.4s)
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Browser install, system deps, and version mismatch",
        paragraphs: [
          "A broken install and a failing assertion look the same in the Checks UI: a red job and exit code 1. They are not the same failure. npm error `npm ci` can only install…, Cannot find module '@playwright/test', or playwright: not found means the runner never graded your suite. Executable doesn't exist and Host system is missing dependencies mean the package installed and the browser launch did not. If both appear in one paste, rank the earlier step first.",
          "Run the installer from the project after npm ci so the CLI matches @playwright/test. npx playwright install before npm ci uses whatever version npx fetches, which can disagree with package.json, and the next test step then looks for a different chromium_headless_shell-<revision> folder. A container job that uses mcr.microsoft.com/playwright has to pin that image tag to the same version as @playwright/test. The image already contains browsers, so the sample skips npx playwright install — a mismatched tag still fails with Executable doesn't exist. Error: Failed to launch browser is the same family; DEBUG=pw:browser npx playwright test prints the launch line.",
        ],
        list: [
          "Lockfile: npm error `npm ci` can only install… / Cannot find module '@playwright/test' / playwright: not found. Commit package.json and the lockfile together, then re-run npm ci.",
          "Browsers: after npm ci, npx playwright install --with-deps. Install alone does not apt-get the libraries Chromium needs on ubuntu-latest.",
          "Version: the revision in the Executable doesn't exist path must belong to the installed @playwright/test. Do not cache ~/.cache/ms-playwright unless the key includes that version. Playwright's CI docs say browser caching is not worth it.",
          "Docker: match the mcr.microsoft.com/playwright tag to @playwright/test. Do not mix an image built for one version with a package.json on another.",
        ],
        code: {
          label: "Same exit code, three different first errors",
          content: `# Lockfile — Playwright never ran
npm error \`npm ci\` can only install packages when your
package.json and package-lock.json are in sync.
Cannot find module '@playwright/test'
Error: Process completed with exit code 1

# Browsers missing or wrong revision — tests never launched
Error: browserType.launch: Executable doesn't exist at /home/runner/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
Looks like Playwright Test or Playwright was just installed or updated.
Please run the following command to download new browsers:
    npx playwright install
##[error]Process completed with exit code 1

# Binaries present, OS libraries missing
Error: browserType.launch: Host system is missing dependencies to run browsers.
Please install them with the following command:
    npx playwright install-deps
Missing libraries: libnss3.so, libnspr4.so
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Reproduce with the same CI command",
        paragraphs: [
          "A laptop with a display, a headed browser, and darwin screenshots is not the CI gate. Match the runner: same Node as actions/setup-node, a frozen lockfile install, then the browser install, then the exact Playwright command. The three steps on the Playwright CI page are npm ci, npx playwright install --with-deps, and npx playwright test.",
          "GitHub Actions sets CI, so the HTML reporter writes playwright-report/ and exits. A local shell without CI set can sit on Serving HTML report until you interrupt it — that is not a test failure. Pass the same --project and --workers the workflow used. For one spec: npx playwright test e2e/checkout.spec.ts. Headed locally is fine; on the runner, drop --headed or wrap the command in xvfb-run. Upload playwright-report/ with actions/upload-artifact when the job is not cancelled, and upload test-results/ if you need the raw screenshot and trace.zip after the runner is gone.",
        ],
        list: [
          "Node: nvm use (or fnm) to the version in setup-node. Confirm with node -v.",
          "Install: npm ci, then npx playwright install --with-deps. Do not reuse a laptop browser cache.",
          "Test: CI=true npx playwright test. One file: CI=true npx playwright test e2e/checkout.spec.ts --project=chromium. Headed on Linux: xvfb-run npx playwright test.",
          "Traces: npx playwright show-trace test-results/.../trace.zip after you download the artifact. The path in the log is not on your laptop until you do.",
        ],
        code: {
          label: "Same commands the runner used",
          content: `npm ci
npx playwright install --with-deps
CI=true npx playwright test
# one spec, same project CI used:
CI=true npx playwright test e2e/checkout.spec.ts --project=chromium
# headed only when the runner has Xvfb:
xvfb-run npx playwright test`,
        },
      },
      {
        heading: "Paste the log when the first error is still unclear",
        paragraphs: [
          "If the log is long or the first error is buried under browser download noise, paste the failed job output at /analyze. CauseCI returns a teaser with the top cause free. Remaining ranks and a patch draft stay locked until you unlock the artifact. The Action does not upload your log — a human still pastes it.",
          "An optional teaser Action can post a truncated excerpt and a paste link when a job fails. It is not a Marketplace publish. Install from the public repo path uses: ipinney/causeci/action@main. Notes live at /guides/install-github-action-failure-teaser. All of the notes, including this one, are listed at /guides.",
        ],
        links: [
          { href: "/analyze", label: "Paste a log on CauseCI" },
          {
            href: ACTION_INSTALL_PATH,
            label: "Optional: install the failure-teaser Action",
          },
          { href: "/guides", label: "All CI failure guides" },
          {
            href: "/guides/vitest-failed-github-actions",
            label: "Vitest failed in GitHub Actions",
          },
          {
            href: "/guides/jest-failed-github-actions",
            label: "Jest failed in GitHub Actions",
          },
          {
            href: "/guides/npm-test-failed-github-actions",
            label: "npm test failed in GitHub Actions",
          },
          {
            href: "/guides/typescript-failed-github-actions",
            label: "TypeScript / tsc failed in GitHub Actions",
          },
          {
            href: "/guides/eslint-failed-github-actions",
            label: "ESLint failed in GitHub Actions",
          },
          {
            href: "/guides/pytest-failed-github-actions",
            label: "pytest failed in GitHub Actions",
          },
          {
            href: "/guides/explain-github-actions-failure",
            label: "Explain this GitHub Actions failure",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Why does GitHub say Process completed with exit code 1 after Playwright?",
        answer:
          "That line is a wrapper. The phrase playwright Process completed with exit code 1 is the wrapper, not the diagnosis. Scroll up to the first Error:, browserType.launch, Executable doesn't exist, Test timeout of, or ##[error] — that is the cause.",
      },
      {
        question: "How do I tell a browser install failure from a real Playwright test failure?",
        answer:
          "If npm ci is red, or the log prints Cannot find module '@playwright/test' / playwright: not found, Playwright never graded your suite. Executable doesn't exist or Host system is missing dependencies means the package installed and the browser never launched — run npx playwright install --with-deps after npm ci. A real playwright test failed CI log shows Running N tests, a ✘ line, Error: expect(...) or a timeout, and 1 failed after the browser started.",
      },
      {
        question: "Why do Playwright tests pass locally and fail in GitHub Actions?",
        answer:
          "The laptop usually has browsers, a display, and darwin or win32 screenshots. ubuntu-latest needs npx playwright install --with-deps, stays headless unless you add xvfb-run, and looks for -linux.png snapshots. A Docker image tag that does not match @playwright/test, or a browser cache from another version, fails with Executable doesn't exist. Timeouts and flakes also show up when workers is higher than the runner can hold — the CI docs recommend workers: 1.",
      },
      {
        question: "Do I need to install a GitHub Action to explain playwright failed GitHub Actions?",
        answer:
          "No. Paste the log at /analyze. The top cause is free. An optional teaser Action can comment a truncated excerpt and a link back; it does not upload the log and is not on the Marketplace. Public callers use ipinney/causeci/action@main.",
      },
    ],
  },
  {
    slug: "cypress-failed-github-actions",
    path: "/guides/cypress-failed-github-actions",
    title: "Cypress failed in GitHub Actions",
    description:
      "How to read a red Cypress / npx cypress run step in GitHub Actions: distinguish a missing binary, a version mismatch, or a Cypress Cloud record failure from a real e2e failure, and ignore Process completed with exit code 1.",
    eyebrow: "Cypress · npx cypress run · binary",
    lede:
      "When Cypress fails in GitHub Actions, the last line is almost always Process completed with exit code 1. That is a wrapper. The cause is the first real error — a missing Cypress binary, a version mismatch, a headed launch with no display, a baseUrl the runner cannot reach, a timeout, or a failed e2e assertion.",
    keywords: [
      "cypress failed GitHub Actions",
      "cypress run failed CI",
      "cypress Process completed with exit code 1",
      "Process completed with exit code 1",
      "npx cypress run failed",
    ],
    updatedAt: "2026-09-26",
    sections: [
      {
        heading: "Start at the first error, not exit code 1",
        paragraphs: [
          "A red npx cypress run step almost always ends with Process completed with exit code 1. Ignore that wrapper line. It only means the process died. Scroll up in the failing step to the first CypressError, AssertionError, The cypress npm package is installed, but the Cypress binary is missing, Cypress could not verify that this server is running, or ##[error]. That sentence is the diagnosis you are trying to name.",
          "Cypress does not print Jest's FAIL path or Test Suites: line, Vitest's RUN  v banner, or Playwright's Running N tests using M workers. A cypress run failed CI log starts with a version line, then Running: checkout.cy.js, then a numbered 1) failure and an AssertionError or CypressError. If you only see FAIL path, RUN  v, or [chromium] ›, you are looking at Jest, Vitest, or Playwright.",
        ],
        list: [
          "Search the raw job log for CypressError, AssertionError, Timed out retrying after, The Cypress binary is missing, and ##[error].",
          "Quote the first of those lines — do not paraphrase the wrapper Process completed with exit code 1.",
          "If the first error is in an npm ci or install step, Cypress never ran. Treat that as lockfile or install drift.",
        ],
      },
      {
        heading: "Common Cypress CI failures",
        paragraphs: [
          "After the npm install succeeded and the binary launched, the first red block is one of a short list. Rank it in this order. A baseUrl the runner cannot reach, or a wait-on that never sees the app, fails before any spec body runs. A timeout, assertion, or flake fails after the browser started. The npm test guide covers whichever runner sits behind npm test; this page is the Cypress binary, baseUrl, and cypress run reporter.",
          "cypress run is headless by default and uses the bundled Electron browser. cypress open is the interactive app — it waits for a person and will sit until the job limit if a workflow calls it. --headed, headed: true, or --browser chrome needs a display and, for Chrome, a browser that is actually installed. GitHub-hosted Ubuntu images already include Xvfb. A slim container, a self-hosted image, or act often does not, and the log says Your system is missing the dependency: Xvfb then Error: spawn Xvfb ENOENT. Since Cypress 13, video is false by default. A config that still sets video: true compresses every spec into cypress/videos during cypress run. Screenshots on failure still land in cypress/screenshots. Both folders are deleted with the runner unless you upload them.",
        ],
        list: [
          "Flake: retries.runMode (often 2) reprints the spec as (Attempt 2 of 3). A recovered attempt can still exit 0. A red job is the last attempt. Read that one. The first attempt is the flake, not always the cause of the red job.",
          "Timeout: Timed out retrying after 4000ms, a cy.wait() that never saw the route, or a start/wait-on line Timed out waiting for: http://localhost:3000. The app, an intercept, or defaultCommandTimeout did not finish. A hung cypress open waits until the job limit.",
          "Assertion: AssertionError: Timed out retrying after 4000ms: expected '<span.total>' to have text '18', but the text was '20'. The browser did launch. Open that spec.",
          "baseUrl / env: Cypress could not verify that this server is running, then the URL from baseUrl. CYPRESS_BASE_URL overrides the config value, so a workflow env on port 3000 and a Vite app on 5173 never meet. cypress.env.json is gitignored by the Cypress scaffold, so Cypress.env('API_URL') that works on a laptop is undefined on the runner. Fork pull requests also drop repository secrets.",
          "Headed vs headless: leave CI on cypress run, which is headless. --headed on a machine without Xvfb dies with Your system is missing the dependency: Xvfb. Electron ships inside the Cypress binary. Chrome does not — cypress-io/github-action installs it when browser: chrome is set. A bare npx cypress run --browser chrome fails when Chrome is not on the image.",
          "Video / screenshots: the summary names a path under cypress/screenshots/… (failed).png. With video: true it also writes cypress/videos/<spec>.mp4. Upload both with actions/upload-artifact and if-no-files-found: ignore. A video-compression warning does not change the spec's exit code — do not rank it above the assertion.",
        ],
        code: {
          label: "Cypress run failure log excerpt",
          content: `Cypress package version: 13.17.0
Cypress binary version: 13.17.0

Running:  checkout.cy.js                                                              (1 of 3)

  Checkout
    1) applies summer coupon

  0 passing (5s)
  1 failing

  1) Checkout
       applies summer coupon:
     AssertionError: Timed out retrying after 4000ms: expected '<span.total>' to have text '18', but the text was '20'
      + expected - actual

      -'20'
      +'18'

      at Context.eval (webpack://app/./cypress/e2e/checkout.cy.js:21:42)

  (Screenshots)

  -  /home/runner/work/app/app/cypress/screenshots/checkout.cy.js/Checkout -- applies summer coupon (failed).png

  (Results)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Tests:        3                                                                                │
  │ Passing:      2                                                                                │
  │ Failing:      1                                                                                │
  │ Screenshots:  1                                                                                │
  │ Video:        false                                                                            │
  │ Spec Ran:     checkout.cy.js                                                                   │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘

##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Binary install, version mismatch, and Cypress Cloud",
        paragraphs: [
          "A broken install and a failing assertion look the same in the Checks UI: a red job and exit code 1. They are not the same failure. npm error \`npm ci\` can only install…, or Cannot find module 'cypress', means the runner never graded your suite. The cypress npm package is installed, but the Cypress binary is missing means the package installed and the binary at ~/.cache/Cypress/<version>/Cypress/Cypress did not. npm ci does not guarantee that path if the postinstall was skipped, if CYPRESS_INSTALL_BINARY=0 was set, or if the cache restored node_modules and not ~/.cache/Cypress. If both an install error and a spec failure appear in one paste, rank the earlier step first.",
          "The binary version has to match the cypress package. npx cypress version prints both. A cache or a CYPRESS_INSTALL_BINARY pin from another release warns Binary version 13.7.1 does not match the expected package version 13.7.0 and These versions may not work properly together. A cypress/included image has to use the same tag as the cypress dependency — latest against an older package.json looks in a different cache folder. cypress/browsers has OS libraries and browsers, not your project's Cypress binary. pnpm's side-effects cache can skip the postinstall when the package is already in the store, so run npx cypress install after install, or turn that cache off.",
          "Cypress Cloud is optional. cypress run without --record stays on the runner and never needs a record key. --record sends the run to Cypress Cloud and requires CYPRESS_RECORD_KEY as a real environment variable — not a key inside cypress.env.json, and not the env block in cypress.config, because those only feed Cypress.env() inside tests. The log then says You passed the --record flag but did not provide us your Record Key. --parallel only works with --record, so a missing key fails before any spec is load-balanced. Fork pull requests do not receive repository secrets, so a job that always passes --record goes red on forks even when the specs would pass. Pass GITHUB_TOKEN into cypress-io/github-action when you record, so a re-run is a new build. A hand-rolled --ci-build-id has to be the same across the matrix and has to change with github.run_attempt.",
        ],
        list: [
          "Lockfile: npm error \`npm ci\` can only install… / Cannot find module 'cypress' / cypress: not found. Commit package.json and the lockfile together, then re-run npm ci.",
          "Binary: after npm ci, npx cypress install, then npx cypress verify. The expected path is ~/.cache/Cypress/<version>/Cypress/Cypress on a GitHub-hosted Linux runner. Cache that directory only when the key includes the cypress version.",
          "Version: npx cypress version. The package line and the binary line should match. Do not pin CYPRESS_INSTALL_BINARY to a different version than the cypress dependency.",
          "Cloud vs local: drop --record to reproduce a spec on the runner. Set CYPRESS_RECORD_KEY from the Actions secret only when you mean to record. Skip --record when the secret is empty.",
        ],
        code: {
          label: "Same exit code, three different first errors",
          content: `# Lockfile — Cypress never ran
npm error \`npm ci\` can only install packages when your
package.json and package-lock.json are in sync.
Cannot find module 'cypress'
Error: Process completed with exit code 1

# Package present, binary missing — specs never launched
The cypress npm package is installed, but the Cypress binary is missing.
We expected the binary to be installed here: /home/runner/.cache/Cypress/13.17.0/Cypress/Cypress
Reasons it may be missing:
- You're caching 'node_modules' but are not caching this path: /home/runner/.cache/Cypress
Alternatively, you can run 'cypress install' to download the binary again.
##[error]Process completed with exit code 1

# Cypress Cloud — specs may not have run
You passed the --record flag but did not provide us your Record Key.
You can also set the Record Key as the environment variable CYPRESS_RECORD_KEY.
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Reproduce with the same CI command",
        paragraphs: [
          "A laptop with a display, a headed Electron window, and a gitignored cypress.env.json is not the CI gate. Match the runner: same Node as actions/setup-node, a frozen lockfile install, then the binary check, then the exact Cypress command. If the workflow uses cypress-io/github-action, also match its start, wait-on, and browser inputs. The app has to be listening on the same origin as baseUrl before cypress run.",
          "GitHub Actions sets CI. cypress run exits when the specs finish. cypress open does not — it waits for the GUI. Pass the same --spec and --browser the workflow used. Headed locally is fine. On the runner, drop --headed unless Xvfb is installed. Omit --record unless you are debugging the Cloud key itself. Upload cypress/screenshots and, when video: true, cypress/videos with actions/upload-artifact if you need the files after the runner is gone.",
        ],
        list: [
          "Node: nvm use (or fnm) to the version in setup-node. Confirm with node -v.",
          "Install: npm ci, then npx cypress verify. Do not reuse a laptop binary cache from another version.",
          "Test: CI=true npx cypress run. One spec: CI=true npx cypress run --spec cypress/e2e/checkout.cy.js. Headed on Linux only when Xvfb exists: xvfb-run npx cypress run --headed.",
          "Server: start the app the way the workflow does, on the port baseUrl and wait-on use. CYPRESS_BASE_URL, if set, wins over cypress.config.",
        ],
        code: {
          label: "Same commands the runner used",
          content: `npm ci
npx cypress verify
CI=true npx cypress run
# one spec, same browser CI used:
CI=true npx cypress run --spec cypress/e2e/checkout.cy.js --browser electron
# headed only when the runner has Xvfb:
xvfb-run npx cypress run --headed`,
        },
      },
      {
        heading: "Paste the log when the first error is still unclear",
        paragraphs: [
          "If the log is long or the first error is buried under the binary download, paste the failed job output at /analyze. CauseCI returns a teaser with the top cause free. Remaining ranks and a patch draft stay locked until you unlock the artifact. The Action does not upload your log — a human still pastes it.",
          "An optional teaser Action can post a truncated excerpt and a paste link when a job fails. It is not a Marketplace publish. Install from the public repo path uses: ipinney/causeci/action@main. Notes live at /guides/install-github-action-failure-teaser. All of the notes, including this one, are listed at /guides.",
        ],
        links: [
          { href: "/analyze", label: "Paste a log on CauseCI" },
          {
            href: ACTION_INSTALL_PATH,
            label: "Optional: install the failure-teaser Action",
          },
          { href: "/guides", label: "All CI failure guides" },
          {
            href: "/guides/playwright-failed-github-actions",
            label: "Playwright failed in GitHub Actions",
          },
          {
            href: "/guides/vitest-failed-github-actions",
            label: "Vitest failed in GitHub Actions",
          },
          {
            href: "/guides/jest-failed-github-actions",
            label: "Jest failed in GitHub Actions",
          },
          {
            href: "/guides/npm-test-failed-github-actions",
            label: "npm test failed in GitHub Actions",
          },
          {
            href: "/guides/typescript-failed-github-actions",
            label: "TypeScript / tsc failed in GitHub Actions",
          },
          {
            href: "/guides/eslint-failed-github-actions",
            label: "ESLint failed in GitHub Actions",
          },
          {
            href: "/guides/pytest-failed-github-actions",
            label: "pytest failed in GitHub Actions",
          },
          {
            href: "/guides/explain-github-actions-failure",
            label: "Explain this GitHub Actions failure",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Why does GitHub say Process completed with exit code 1 after Cypress?",
        answer:
          "That line is a wrapper. The phrase cypress Process completed with exit code 1 is the wrapper, not the diagnosis. Scroll up to the first CypressError, AssertionError, The Cypress binary is missing, Cypress could not verify that this server is running, or ##[error] — that is the cause.",
      },
      {
        question: "How do I tell a Cypress binary install failure from a real e2e failure?",
        answer:
          "If npm ci is red, or the log prints Cannot find module 'cypress' / cypress: not found, Cypress never graded your suite. The cypress npm package is installed, but the Cypress binary is missing means the package installed and the binary never launched — run npx cypress install, then npx cypress verify, after npm ci. A real cypress run failed CI log shows Running: <spec>, a numbered failure, AssertionError or Timed out retrying after, and a screenshot path after the browser started.",
      },
      {
        question: "Why do Cypress tests pass locally and fail in GitHub Actions?",
        answer:
          "The laptop usually has the binary, a display, cypress.env.json, and the app already running on baseUrl. ubuntu-latest needs the binary in ~/.cache/Cypress, stays headless unless Xvfb is present, and does not see a gitignored cypress.env.json. CYPRESS_BASE_URL or a wait-on port that does not match the started app fails before specs. A cypress/included tag that does not match the cypress package, or a binary cache from another version, fails with a missing binary or Binary version … does not match the expected package version. A workflow that always passes --record goes red on fork pull requests because CYPRESS_RECORD_KEY is not available.",
      },
      {
        question: "Do I need to install a GitHub Action to explain cypress failed GitHub Actions?",
        answer:
          "No. Paste the log at /analyze. The top cause is free. An optional teaser Action can comment a truncated excerpt and a link back; it does not upload the log and is not on the Marketplace. Public callers use ipinney/causeci/action@main.",
      },
    ],
  },
  {
    slug: "go-test-failed-github-actions",
    path: "/guides/go-test-failed-github-actions",
    title: "Go test failed in GitHub Actions",
    description:
      "How to read a red go test / go test ./... step in GitHub Actions: distinguish a module, go.sum, cache, or setup-go install failure from a compile error, a real test FAIL, or a build tag / GOOS / GOARCH / CGO / race-detector issue, and ignore Process completed with exit code 1.",
    eyebrow: "go test · go test ./... · module",
    lede:
      "When go test fails in GitHub Actions, the last line is almost always Process completed with exit code 1. That is a wrapper. The cause is the first real error — a missing go.sum entry, inconsistent vendoring, a module cache or setup-go miss, a compile error, a build constraint, or a real --- FAIL:.",
    keywords: [
      "go test failed GitHub Actions",
      "go test Process completed with exit code 1",
      "go test ./... failed CI",
      "module cache / go.sum drift",
      "build constraints",
    ],
    updatedAt: "2026-09-27",
    sections: [
      {
        heading: "Start at the first error, not exit code 1",
        paragraphs: [
          "A red go test or go test ./... step almost always ends with Process completed with exit code 1. Ignore that wrapper line. It only means the process died. Scroll up in the failing step to the first --- FAIL:, FAIL:, [build failed], go: inconsistent vendoring, missing go.sum entry, package not in GOROOT/GOPATH, build constraints exclude all Go files, or ##[error]. That sentence is the diagnosis you are trying to name.",
          "Go does not print Jest's FAIL path or Test Suites: line, Vitest's RUN  v banner, Playwright's Running N tests using M workers, or Cypress's Running: spec.cy.js. A go test ./... failed CI log prints one line per package — ok, FAIL, or ? — and, for a real test failure, --- FAIL: TestName plus the file:line the test printed. [build failed] means the package did not compile, so no test function ran. If you only see FAIL path, RUN  v, [chromium] ›, or AssertionError: Timed out retrying, you are looking at Jest, Vitest, Playwright, or Cypress.",
        ],
        list: [
          "Search the raw job log for --- FAIL:, [build failed], missing go.sum entry, inconsistent vendoring, build constraints exclude all Go files, DATA RACE, and ##[error].",
          "Quote the first of those lines — do not paraphrase the wrapper Process completed with exit code 1.",
          "If the first error is in actions/setup-go, or the log stops at a go: line before any package result, go test never graded your suite. Treat that as a toolchain, module, or cache failure.",
        ],
      },
      {
        heading: "Common go test CI failures",
        paragraphs: [
          "After the module download succeeded and the packages compiled, the first red block is one of a short list. Rank it in this order. A compile error, a vet failure, or a build constraint fails before any Test function runs, and the package line says [build failed]. A --- FAIL: line, a timeout panic, or a DATA RACE fails after that package built. The pytest guide is the same split for Python; this page is the Go module, the package line, and the test name.",
          "go test ./... walks every package under the module. A line that starts with ? and ends with [no test files] is not a failure — that package has no tests that match this GOOS, GOARCH, and -tags set. ok means the tests passed. FAIL without [build failed], followed by --- FAIL: TestName, is a test that ran and failed. The job exits 1 if any package fails. GitHub then appends Process completed with exit code 1. Read the first FAIL package, not the wrapper.",
        ],
        list: [
          "Real test: --- FAIL: TestAppliesSummerCoupon (0.00s) and a file line such as coupon_test.go:21: total = 20, want 18, then FAIL github.com/acme/checkout/internal/billing. The package compiled. Open that test.",
          "Compile: # github.com/acme/checkout/internal/billing then undefined: applyDiscount, then FAIL … [build failed]. No --- FAIL: TestName, because the test binary was never linked.",
          "Vet: vet: … unreachable code, or a printf wrapper mismatch. go test runs go vet on the package before tests. It is a [build failed] gate, not an assertion.",
          "Timeout: panic: test timed out after 10m0s and running tests: followed by the test name. The default limit is 10 minutes for the whole package. A later ok line does not erase it.",
          "Race: WARNING: DATA RACE, then --- FAIL: and race detected during execution of test. The assertion may have passed. The detector is why the package is red.",
          "Build tags / GOOS / GOARCH: build constraints exclude all Go files, or a linux-only file fails while the job sets GOOS=windows. The test body never ran.",
          "CGO: cgo: C compiler \"gcc\" not found, or a missing header such as sqlite3.h. The race detector and many database drivers need cgo. ubuntu-latest has gcc; a distroless or alpine image often does not.",
        ],
        code: {
          label: "Go test failure log excerpt",
          content: `go test ./...
?   	github.com/acme/checkout/cmd/checkout	[no test files]
ok  	github.com/acme/checkout/internal/cart	0.008s
=== RUN   TestAppliesSummerCoupon
    coupon_test.go:21: total = 20, want 18
--- FAIL: TestAppliesSummerCoupon (0.00s)
FAIL
FAIL	github.com/acme/checkout/internal/billing	0.012s
FAIL
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Module, go.sum, cache, and setup-go versus a real FAIL",
        paragraphs: [
          "A broken module download and a failing test look the same in the Checks UI: a red job and exit code 1. They are not the same failure. go: updates to go.sum needed, disabled by -mod=readonly, missing go.sum entry, verifying … checksum mismatch, go: inconsistent vendoring, or a package not in GOROOT/GOPATH means go test never graded that package. # path and [build failed] mean the module resolved and the compiler rejected the code. --- FAIL: TestName means a test ran. If an install error and a FAIL both appear in one paste, rank the earlier step first.",
          "actions/setup-go installs the toolchain before your test step. A red setup-go step — Unable to find Go version, or a go-version-file that does not exist — means go test never started. The action sets GOTOOLCHAIN=local by default, so a go 1.23 line in go.mod does not download a newer toolchain when the action pinned 1.22. The test step then dies with go: go.mod requires go >= 1.23.0 (running go 1.22.5; GOTOOLCHAIN=local). That is a toolchain mismatch, not a test failure.",
          "Module cache and go.sum drift are the other install family. setup-go with cache: true keys the module cache on go.sum. On a GitHub-hosted runner that cache is /home/runner/go/pkg/mod. A cache miss only slows the job. A go.mod that gained a requirement the committed go.sum does not list fails the download. As of Go 1.16, a go line of 1.14 or higher defaults to -mod=readonly when there is no vendor directory, so the runner will not rewrite go.sum for you. Run go mod tidy locally and commit go.mod and go.sum together. Do not hand-edit go.sum, and do not delete it to silence the error. If the repo vendors dependencies, go test uses that vendor directory, and a stale vendor/modules.txt fails with go: inconsistent vendoring before any test runs. Run go mod vendor and commit vendor/ with the module files. A checksum mismatch (verifying … checksum mismatch, then SECURITY ERROR) is not ordinary drift: the download does not match the sum already committed. Clear that module from the cache and download it again. If the sum still does not match, do not force go.sum to the new hash. A private module still fetched through proxy.golang.org fails with terminal prompts disabled — set GOPRIVATE for that path. Fork pull requests do not receive repository secrets, so a GOPROXY token that works on push is empty on a fork.",
        ],
        list: [
          "setup-go: the setup step is red, or the first line is go: go.mod requires go >= …. Point go-version or go-version-file at the same version as the go line. GOTOOLCHAIN=local will not float upward.",
          "go.sum: missing go.sum entry for go.mod file, often wrapped as go: updates to go.sum needed, disabled by -mod=readonly. The error suggests go mod download. Run go mod tidy and commit both files.",
          "Cache: a module cache keyed only on go.mod (not go.sum) can restore a zip that no longer matches. Include go.sum in the key, or leave caching to setup-go. A miss is not a failure.",
          "Vendor: go: inconsistent vendoring … To sync the vendor directory, run: go mod vendor. Commit the result. -mod=mod skips vendor and hides the drift until the next machine.",
          "Not a module: package … is not in std (…/src/…) or cannot find package … (from $GOROOT) / (from $GOPATH). The job is outside the module, or GO111MODULE=off. Run from the directory that contains go.mod. go test ./... is not a GOPATH lookup.",
          "Compile: [build failed] with undefined: or a type error. Fix the Go file. There is no TestName yet.",
          "Test: --- FAIL: TestName after the package built. Re-run that package.",
          "Constraints: build constraints exclude all Go files, a _linux.go file while GOOS=windows, or //go:build integration tests that CI compiled with -tags=integration and then failed. A tag that is missing usually omits the package ([no test files]) and stays green — that is a coverage gap, not this red job.",
          "CGO and race: cgo: C compiler \"gcc\" not found, CGO_ENABLED=0 on a cgo file, or go: -race requires cgo; enable cgo by setting CGO_ENABLED=1. The race detector runs on linux/amd64 and linux/arm64 GitHub runners when gcc is installed. It is not a substitute for an assertion failure.",
        ],
        code: {
          label: "Same exit code, different first errors",
          content: `# Module / go.sum — tests never ran
go: updates to go.sum needed, disabled by -mod=readonly:
	github.com/stretchr/testify@v1.9.0: missing go.sum entry for go.mod file; to add it:
	go mod download github.com/stretchr/testify
##[error]Process completed with exit code 1

# Vendoring — tests never ran
go: inconsistent vendoring in /home/runner/work/checkout/checkout:
	github.com/stretchr/testify@v1.9.0: is explicitly required in go.mod, but not marked as explicit in vendor/modules.txt

	To ignore the vendor directory, use -mod=readonly or -mod=mod.
	To sync the vendor directory, run:
		go mod vendor
##[error]Process completed with exit code 1

# Toolchain — go test never started grading
go: go.mod requires go >= 1.23.0 (running go 1.22.5; GOTOOLCHAIN=local)
##[error]Process completed with exit code 1

# Outside a module — package not in GOROOT (modules off, or no go.mod)
package github.com/acme/checkout/internal/billing is not in std (/opt/hostedtoolcache/go/1.22.5/x64/src/github.com/acme/checkout/internal/billing)
##[error]Process completed with exit code 1

# Older GOPATH wording of the same miss
cannot find package "github.com/acme/checkout/internal/billing" in any of:
	/opt/hostedtoolcache/go/1.22.5/x64/src/github.com/acme/checkout/internal/billing (from $GOROOT)
	/home/runner/go/src/github.com/acme/checkout/internal/billing (from $GOPATH)
##[error]Process completed with exit code 1

# Compile — no Test function ran
# github.com/acme/checkout/internal/billing
internal/billing/coupon.go:14:2: undefined: applyDiscount
FAIL	github.com/acme/checkout/internal/billing [build failed]
FAIL
##[error]Process completed with exit code 1

# Build constraints — files excluded for this GOOS/GOARCH/tags
package github.com/acme/checkout/cmd/checkout
	imports github.com/acme/checkout/internal/unix: build constraints exclude all Go files in /home/runner/work/checkout/checkout/internal/unix
FAIL	github.com/acme/checkout/cmd/checkout [build failed]
FAIL
##[error]Process completed with exit code 1

# CGO — compiler missing, tests never ran
cgo: C compiler "gcc" not found: exec: "gcc": executable file not found in $PATH
##[error]Process completed with exit code 1

# Race detector without cgo — tests never ran
go: -race requires cgo; enable cgo by setting CGO_ENABLED=1
##[error]Process completed with exit code 1

# Race detector — the test ran; the detector failed it
WARNING: DATA RACE
Read at 0x00c0001a4048 by goroutine 8:
  github.com/acme/checkout/internal/cart.(*Cart).Total()
      /home/runner/work/checkout/checkout/internal/cart/cart.go:42 +0x64
--- FAIL: TestConcurrentAdd (0.05s)
    race detected during execution of test
FAIL
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Reproduce with the same CI command",
        paragraphs: [
          "A laptop that already ran go mod tidy, has a warm module cache, and lets GOTOOLCHAIN download a newer Go is not the CI gate. Match the runner: same Go version as actions/setup-go (read it from the setup step, or from the go line when the workflow uses go-version-file: go.mod), GOTOOLCHAIN=local if CI sets that, then the exact go test arguments. If CI runs go test ./..., run that — not go test on one package after a local go get already rewrote go.mod.",
          "Pass the same -tags, GOOS, GOARCH, CGO_ENABLED, and -race the workflow used. -count=1 avoids a cached PASS from a previous local run. One package, once the full ./... fails the same way: go test -count=1 ./internal/billing. For one test: go test -count=1 -run TestAppliesSummerCoupon ./internal/billing. If the workflow vendors, do not pass -mod=mod locally and then wonder why CI is the only red job.",
        ],
        list: [
          "Go: install the version from setup-go. Confirm with go version. Export GOTOOLCHAIN=local when CI does.",
          "Modules: go mod tidy, then commit go.mod and go.sum. If vendor/ is committed, go mod vendor and commit that too. Do not delete go.sum.",
          "Test: go test ./... . One package: go test -count=1 ./internal/billing. One test: go test -count=1 -run '^TestAppliesSummerCoupon$' ./internal/billing.",
          "Race and tags: CGO_ENABLED=1 go test -race ./... and go test -tags=integration ./... only when the workflow passes those flags. Set GOOS and GOARCH to the job's values before you compare.",
        ],
        code: {
          label: "Same commands the runner used",
          content: `go version
GOTOOLCHAIN=local go test ./...
# one package, no cached PASS:
go test -count=1 ./internal/billing
# one test:
go test -count=1 -run '^TestAppliesSummerCoupon$' ./internal/billing
# only if CI passed these:
CGO_ENABLED=1 go test -race ./...
go test -tags=integration ./...`,
        },
      },
      {
        heading: "Paste the log when the first error is still unclear",
        paragraphs: [
          "If the log is long or the first error is buried under module download noise, paste the failed job output at /analyze. CauseCI returns a teaser with the top cause free. Remaining ranks and a patch draft stay locked until you unlock the artifact. The Action does not upload your log — a human still pastes it.",
          "An optional teaser Action can post a truncated excerpt and a paste link when a job fails. It is not a Marketplace publish. Install from the public repo path uses: ipinney/causeci/action@main. Notes live at /guides/install-github-action-failure-teaser. All of the notes, including this one, are listed at /guides.",
        ],
        links: [
          { href: "/analyze", label: "Paste a log on CauseCI" },
          {
            href: ACTION_INSTALL_PATH,
            label: "Optional: install the failure-teaser Action",
          },
          { href: "/guides", label: "All CI failure guides" },
          {
            href: "/guides/cypress-failed-github-actions",
            label: "Cypress failed in GitHub Actions",
          },
          {
            href: "/guides/playwright-failed-github-actions",
            label: "Playwright failed in GitHub Actions",
          },
          {
            href: "/guides/vitest-failed-github-actions",
            label: "Vitest failed in GitHub Actions",
          },
          {
            href: "/guides/jest-failed-github-actions",
            label: "Jest failed in GitHub Actions",
          },
          {
            href: "/guides/npm-test-failed-github-actions",
            label: "npm test failed in GitHub Actions",
          },
          {
            href: "/guides/typescript-failed-github-actions",
            label: "TypeScript / tsc failed in GitHub Actions",
          },
          {
            href: "/guides/eslint-failed-github-actions",
            label: "ESLint failed in GitHub Actions",
          },
          {
            href: "/guides/pytest-failed-github-actions",
            label: "pytest failed in GitHub Actions",
          },
          {
            href: "/guides/explain-github-actions-failure",
            label: "Explain this GitHub Actions failure",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Why does GitHub say Process completed with exit code 1 after go test?",
        answer:
          "That line is a wrapper. The phrase go test Process completed with exit code 1 is the wrapper, not the diagnosis. Scroll up to the first --- FAIL:, [build failed], missing go.sum entry, go: inconsistent vendoring, package not in GOROOT/GOPATH, build constraints exclude all Go files, or ##[error] — that is the cause.",
      },
      {
        question:
          "How do I tell a module, go.sum, cache, or setup-go failure from a compile error or a real test FAIL?",
        answer:
          "If actions/setup-go is red, or the log prints go: go.mod requires go >=, missing go.sum entry, checksum mismatch, go: inconsistent vendoring, or package … is not in std / (from $GOROOT) / (from $GOPATH), go test never graded your suite. [build failed] with no --- FAIL: TestName is a compile or vet error — the test binary did not run. A real go test ./... failed CI log shows --- FAIL: TestName and a file:line after that package compiled. build constraints exclude all Go files, a GOOS/GOARCH mismatch, cgo: C compiler \"gcc\" not found, and go: -race requires cgo are environment gates. WARNING: DATA RACE is a test that ran under -race and failed the detector.",
      },
      {
        question: "Why do Go tests pass locally and fail in GitHub Actions?",
        answer:
          "The laptop often has a newer toolchain (GOTOOLCHAIN downloaded it), a warm module cache, a go.sum that was never committed, and CGO_ENABLED=1 with gcc on the PATH. ubuntu-latest uses the setup-go version with GOTOOLCHAIN=local, refuses to edit go.sum (-mod=readonly), and may cross-compile with GOOS/GOARCH or -tags the laptop did not set. A vendor directory that is stale only on CI fails with inconsistent vendoring. -race finds a DATA RACE the plain go test hid. Fork pull requests also drop secrets, so a private GOPROXY credential is empty.",
      },
      {
        question: "What does FAIL [build failed] mean compared with --- FAIL:?",
        answer:
          "[build failed] on the package line means the compiler or vet stopped the package. No test function ran, so there is no --- FAIL: TestName. --- FAIL: TestAppliesSummerCoupon means the test binary started and that test failed. Fix the first one you see. A later package's FAIL can be a consequence of the first package not building.",
      },
      {
        question: "Do I need to install a GitHub Action to explain go test failed GitHub Actions?",
        answer:
          "No. Paste the log at /analyze. The top cause is free. An optional teaser Action can comment a truncated excerpt and a link back; it does not upload the log and is not on the Marketplace. Public callers use ipinney/causeci/action@main.",
      },
    ],
  },
  {
    slug: "rust-test-failed-github-actions",
    path: "/guides/rust-test-failed-github-actions",
    title: "Rust cargo test failed in GitHub Actions",
    description:
      "How to read a red cargo test step in GitHub Actions: distinguish a Cargo.lock, registry, cache, or rustup / dtolnay / actions-rs toolchain failure from a compile error, and from a real test FAIL or panic, and ignore Process completed with exit code 101.",
    eyebrow: "cargo test · Cargo.lock · rustup",
    lede:
      "When cargo test fails in GitHub Actions, the last line is almost always Process completed with exit code 101. Cargo's own error code is 101; a shell or an old actions-rs wrapper may print exit code 1 instead. Either line is a wrapper. The cause is the first real error — a lockfile or registry miss, a cache or toolchain (rustup, actions-rs, dtolnay) failure, a compile error, or a real test FAIL / panic.",
    keywords: [
      "cargo test failed GitHub Actions",
      "cargo test Process completed with exit code 1",
      "cargo test --locked failed CI",
      "registry / Cargo.lock / cache drift",
      "rustup / dtolnay toolchain",
    ],
    updatedAt: "2026-09-28",
    sections: [
      {
        heading: "Start at the first error, not the exit code",
        paragraphs: [
          "A red cargo test step almost always ends with Process completed with exit code 101. Ignore that wrapper line. Cargo exits 101 when the command failed for any reason — a download, a compiler error, or a test. A workflow that shells through actions-rs/cargo, or a script that turns any failure into exit 1, prints Process completed with exit code 1 for the same death. Scroll up in the failing step to the first error: could not compile, error[E0425], failed to run custom build command, the lock file … --locked was passed, failed to get \`serde\`, rustup could not choose a version of cargo, or test result: FAILED. That sentence is the diagnosis you are trying to name.",
          "Cargo does not print Jest's FAIL path or Test Suites: line, Vitest's RUN  v banner, Playwright's Running N tests using M workers, Cypress's Running: spec.cy.js, or Go's --- FAIL:. A cargo test --locked failed CI log prints running N tests, then test tests::name ... FAILED or ok, then test result: FAILED and error: test failed, to rerun pass \`--lib\`. A panic is inside that block: thread 'tests::…' panicked at, often assertion \`left == right\` failed. If the compiler stopped first, there is no running N tests line — only error: could not compile. If you only see FAIL path, RUN  v, [chromium] ›, AssertionError: Timed out retrying, or --- FAIL:, you are looking at Jest, Vitest, Playwright, Cypress, or Go.",
        ],
        list: [
          "Search the raw job log for test result: FAILED, panicked at, error: could not compile, --locked was passed, failed to get \`, Unable to update registry, rustup could not choose a version, and ##[error].",
          "Quote the first of those lines — do not paraphrase the wrapper Process completed with exit code 101 or exit code 1.",
          "If the first error is in dtolnay/rust-toolchain or actions-rs/toolchain, or the log stops at a rustup or cargo fetch line before any running N tests, cargo test never graded your suite. Treat that as a toolchain, registry, lockfile, or cache failure.",
        ],
      },
      {
        heading: "Common cargo test CI failures",
        paragraphs: [
          "After the crates downloaded and the package compiled, the first red block is one of a short list. Rank it in this order. A compile error, a build-script failure, or a missing link library fails before any test function runs, and the log says could not compile with no test result: line. A test name ending in FAILED, a panicked at line, or test result: FAILED means that test ran. The Go guide is the same split for go test; this page is Cargo, the crate, and the test name.",
          "cargo test --locked builds the tests, then runs them. A line that says test tests::hits_staging ... ignored is not a failure — that test is marked #[ignore] and this command did not pass -- --ignored. ok means it passed. FAILED, followed by a stdout section and panicked at, is a test that ran and failed. The job exits 101 if any test fails. GitHub then appends Process completed with exit code 101. Read the first FAILED test, not the wrapper. A later package in a workspace can fail because an earlier crate did not compile; fix the first error: could not compile.",
        ],
        list: [
          "Real test: test tests::applies_summer_coupon ... FAILED, then thread 'tests::applies_summer_coupon' panicked at src/billing.rs:21:9: and assertion \`left == right\` failed with left: 20 and right: 18. The crate compiled. Open that test.",
          "Panic: the same FAILED line for called \`Result::unwrap()\` on an \`Err\` value, or an explicit panic. It is still a test that ran. RUST_BACKTRACE=1 only prints the stack; it does not change the verdict.",
          "should_panic: test tests::rejects_empty - should panic ... FAILED and note: test did not panic as expected. The test ran and the expected panic did not happen.",
          "Compile: error[E0425]: cannot find function \`apply_discount\` in this scope, then error: could not compile \`checkout\` (lib test) due to 1 previous error. No running N tests, because the test binary was never linked.",
          "Build script / link: error: failed to run custom build command for \`openssl-sys\`, or error: linking with \`cc\` failed: exit status: 1. The test body never ran. A missing system library is this class, not an assertion.",
          "Doctest: test src/lib.rs - applies_summer_coupon (line 12) ... FAILED and error: doctest failed, to rerun pass \`--doc\`. That is a rustdoc example, not lib.rs unit tests.",
        ],
        code: {
          label: "Cargo test failure log excerpt",
          content: `cargo test --locked
   Compiling checkout v0.1.0 (/home/runner/work/checkout/checkout)
    Finished \`test\` profile [unoptimized + debuginfo] target(s) in 1.42s
     Running unittests src/lib.rs (target/debug/deps/checkout-…)

running 4 tests
test tests::keeps_winter_rate ... ok
test tests::applies_summer_coupon ... FAILED
test tests::rejects_negative ... ok
test tests::rounds_half_up ... ok

failures:

---- tests::applies_summer_coupon stdout ----

thread 'tests::applies_summer_coupon' panicked at src/billing.rs:21:9:
assertion \`left == right\` failed
  left: 20
  right: 18
note: run with \`RUST_BACKTRACE=1\` environment variable to display a backtrace


failures:
    tests::applies_summer_coupon

test result: FAILED. 3 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s

error: test failed, to rerun pass \`--lib\`
##[error]Process completed with exit code 101`,
        },
      },
      {
        heading: "Registry, lockfile, cache, and toolchain versus a compile error or a real FAIL",
        paragraphs: [
          "A broken download and a failing test look the same in the Checks UI: a red job and a non-zero exit. They are not the same failure. error: the lock file …/Cargo.lock needs to be updated but --locked was passed to prevent this, error: failed to select a version for the requirement, error: failed to get \`serde\` as a dependency, Unable to update registry \`crates-io\`, or error: checksum for \`serde v1.0.210\` changed between lock files means cargo test never graded that crate. error: could not compile and error[E0…] mean the crates resolved and rustc rejected the code. test result: FAILED and panicked at mean a test ran. If a fetch error and a FAILED both appear in one paste, rank the earlier step first.",
          "The toolchain step installs rustc before your test step. dtolnay/rust-toolchain is the maintained install. actions-rs/toolchain and actions-rs/cargo are unmaintained; a red actions-rs step means cargo test never started — replace it with dtolnay/rust-toolchain and a plain run: cargo test --locked. The ref after @, or the toolchain input, selects the compiler. A rust-toolchain.toml channel is used when that input is omitted. If the workflow pins @stable and the file pins 1.81.0, the log's rustc --version is stable, not the file. A hand-rolled rustup default stable next to a file that pins another channel dies before any test with error: override toolchain '1.81.0-x86_64-unknown-linux-gnu' is not installed. No toolchain at all is error: rustup could not choose a version of cargo to run, because one wasn't specified explicitly, and no default is configured. A missing target is error: Error loading target specification: Could not find specification for target \"wasm32-unknown-unknown\". A rustfmt or clippy step that prints toolchain 'stable-x86_64-unknown-linux-gnu' does not have the binary \`rustfmt\` failed before cargo test. Those are toolchain failures, not test failures.",
          "Registry, Cargo.lock, and cache drift are the other install family. CI should pass --locked so the runner cannot rewrite Cargo.lock the way a laptop's cargo test does. A dependency added in Cargo.toml and not committed in Cargo.lock fails with the lock file needs to be updated but --locked was passed to prevent this. Run cargo update -p <crate> or cargo generate-lockfile locally — usually cargo test once without --locked — and commit Cargo.lock with Cargo.toml. Do not delete Cargo.lock to silence the error. A vendor directory from cargo vendor, wired with [source.crates-io] replace-with, fails with error: no matching package named \`serde\` found and perhaps a crate was updated and forgotten to be re-vendored? Commit the vendor directory again. A checksum mismatch is not ordinary drift: the download does not match the sum already committed. Do not force the lockfile to the new hash until you know why the bytes changed. A private registry that needs CARGO_REGISTRIES_<NAME>_TOKEN fails the fetch on a fork pull request because that secret is empty. The log stops at failed to get / Unable to update registry before any running N tests.",
          "Swatinem/rust-cache (or an actions/cache entry on ~/.cargo and target/) is not a failure when it misses — the job just downloads crates again. It keys the cache on the compiler and Cargo.lock. An actions/cache entry keyed only on Cargo.toml can restore crates the lockfile no longer lists, and --locked then refuses to update. A restored registry or target/ that cargo cannot read dies during the fetch or the compile, still with no test result: FAILED line. Bump the cache key or delete that cache and re-run. Do not treat a cache miss as the root cause of a panicked at.",
        ],
        list: [
          "Toolchain: the dtolnay/rust-toolchain or actions-rs/toolchain step is red, or the first line is rustup could not choose a version of cargo / override toolchain … is not installed / does not have the binary \`rustfmt\`. Install the same channel as rust-toolchain.toml, including components and targets. Prefer dtolnay/rust-toolchain over actions-rs.",
          "Cargo.lock: error: the lock file … needs to be updated but --locked was passed to prevent this. Commit Cargo.lock. Do not drop --locked on CI to hide it.",
          "Registry: error: failed to get \`…\` as a dependency, Unable to update registry \`crates-io\`, or failed to download from \`https://index.crates.io/config.json\`. A network or index failure. Re-run once. A private registry 401 on a fork is a missing token, not a flaky test.",
          "Vendor: perhaps a crate was updated and forgotten to be re-vendored? Run cargo vendor and commit vendor/ with the lockfile.",
          "Checksum: error: checksum for \`serde v1.0.210\` changed between lock files. Do not rewrite the sum until the source of the bytes is known.",
          "Cache: a miss is not a failure. A key that omits Cargo.lock or the rustc version restores the wrong crates or a stale target/. Fix the key. The test suite has not run yet.",
          "Compile: error: could not compile \`checkout\` (lib test) with error[E0425] or another E0 code. Fix the Rust file. There is no test result: yet.",
          "Build script: error: failed to run custom build command for a -sys crate, or error: linking with \`cc\` failed. Install the system library (pkg-config, libssl-dev, a C compiler) on the runner. The tests did not run.",
          "Test: test result: FAILED, a tests::name ... FAILED line, and panicked at after the crate built. Re-run that test.",
        ],
        code: {
          label: "Same exit code, different first errors",
          content: `# Toolchain — cargo test never started
error: rustup could not choose a version of cargo to run, because one wasn't specified explicitly, and no default is configured.
help: run 'rustup default stable' to download the latest stable release of Rust and set it as your default toolchain.
##[error]Process completed with exit code 1

# rust-toolchain.toml override — tests never ran
error: override toolchain '1.81.0-x86_64-unknown-linux-gnu' is not installed
help: run \`rustup toolchain install 1.81.0-x86_64-unknown-linux-gnu\` to install it
##[error]Process completed with exit code 1

# Lockfile — tests never ran
error: the lock file /home/runner/work/checkout/checkout/Cargo.lock needs to be updated but --locked was passed to prevent this
If you want to try to generate the lock file without accessing the network, remove the --locked flag and use --offline instead.
##[error]Process completed with exit code 101

# Registry — tests never ran
error: failed to get \`serde\` as a dependency of package \`checkout v0.1.0 (/home/runner/work/checkout/checkout)\`

Caused by:
  failed to load source for dependency \`serde\`

Caused by:
  Unable to update registry \`crates-io\`

Caused by:
  failed to download from \`https://index.crates.io/config.json\`
##[error]Process completed with exit code 101

# Vendor — tests never ran
error: no matching package named \`serde\` found
location searched: directory source \`/home/runner/work/checkout/checkout/vendor\` (which is replacing registry \`crates-io\`)
required by package \`checkout v0.1.0 (/home/runner/work/checkout/checkout)\`
perhaps a crate was updated and forgotten to be re-vendored?
##[error]Process completed with exit code 101

# Compile — no test function ran
error[E0425]: cannot find function \`apply_discount\` in this scope
 --> src/billing.rs:14:5
  |
14 |     apply_discount(total)
  |     ^^^^^^^^^^^^^^ not found in this scope

error: could not compile \`checkout\` (lib test) due to 1 previous error
##[error]Process completed with exit code 101

# Build script — tests never ran
error: failed to run custom build command for \`openssl-sys v0.9.104\`

Caused by:
  process didn't exit successfully: \`…/build-script-build\` (exit status: 101)
  --- stderr
  Could not find directory of OpenSSL installation
##[error]Process completed with exit code 101

# Real test — the binary ran and panicked
test tests::applies_summer_coupon ... FAILED
thread 'tests::applies_summer_coupon' panicked at src/billing.rs:21:9:
assertion \`left == right\` failed
  left: 20
  right: 18
test result: FAILED. 3 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
error: test failed, to rerun pass \`--lib\`
##[error]Process completed with exit code 101`,
        },
      },
      {
        heading: "Reproduce with the same CI command",
        paragraphs: [
          "A laptop that already ran cargo test without --locked, has a warm ~/.cargo, and lets rustup float to a newer stable is not the CI gate. Match the runner: the same toolchain the dtolnay/rust-toolchain step installed (read rustc --version from that step, or from rust-toolchain.toml when the workflow does not override it), then the exact cargo test arguments. If CI runs cargo test --locked --workspace, run that — not cargo test on one crate after a local cargo add already rewrote Cargo.lock.",
          "Pass the same --features, --target, and RUSTFLAGS the workflow used. One test, once the full command fails the same way: cargo test --locked applies_summer_coupon -- --nocapture. The arguments after -- go to the test binary. -- --test-threads=1 avoids a second test interleaving with the panic you are reading. If the workflow vendors, do not delete .cargo/config.toml locally and then wonder why CI is the only red job.",
        ],
        list: [
          "Toolchain: install the version from dtolnay/rust-toolchain. Confirm with rustc --version and rustup show. Add the same components and rustup target add values the workflow installs.",
          "Lockfile: commit Cargo.lock. Reproduce the gate with cargo test --locked, not a bare cargo test that rewrites the file.",
          "Test: cargo test --locked. One test: cargo test --locked applies_summer_coupon -- --nocapture. One integration test: cargo test --locked --test billing. Doctests: cargo test --locked --doc.",
          "Features and target: cargo test --locked --features integration --target wasm32-unknown-unknown only when the workflow passes those flags. Export the same RUSTFLAGS.",
        ],
        code: {
          label: "Same commands the runner used",
          content: `rustc --version
rustup show
cargo test --locked
# one test, with its println:
cargo test --locked applies_summer_coupon -- --nocapture
# one integration test:
cargo test --locked --test billing
# only if CI passed these:
cargo test --locked --workspace --all-targets
cargo test --locked --features integration`,
        },
      },
      {
        heading: "Paste the log when the first error is still unclear",
        paragraphs: [
          "If the log is long or the first error is buried under crate download noise, paste the failed job output at /analyze. CauseCI returns a teaser with the top cause free. Remaining ranks and a patch draft stay locked until you unlock the artifact. The Action does not upload your log — a human still pastes it.",
          "An optional teaser Action can post a truncated excerpt and a paste link when a job fails. It is not a Marketplace publish. Install from the public repo path uses: ipinney/causeci/action@main. Notes live at /guides/install-github-action-failure-teaser. All of the notes, including this one, are listed at /guides.",
        ],
        links: [
          { href: "/analyze", label: "Paste a log on CauseCI" },
          {
            href: ACTION_INSTALL_PATH,
            label: "Optional: install the failure-teaser Action",
          },
          { href: "/guides", label: "All CI failure guides" },
          {
            href: "/guides/go-test-failed-github-actions",
            label: "Go test failed in GitHub Actions",
          },
          {
            href: "/guides/cypress-failed-github-actions",
            label: "Cypress failed in GitHub Actions",
          },
          {
            href: "/guides/playwright-failed-github-actions",
            label: "Playwright failed in GitHub Actions",
          },
          {
            href: "/guides/vitest-failed-github-actions",
            label: "Vitest failed in GitHub Actions",
          },
          {
            href: "/guides/jest-failed-github-actions",
            label: "Jest failed in GitHub Actions",
          },
          {
            href: "/guides/npm-test-failed-github-actions",
            label: "npm test failed in GitHub Actions",
          },
          {
            href: "/guides/typescript-failed-github-actions",
            label: "TypeScript / tsc failed in GitHub Actions",
          },
          {
            href: "/guides/eslint-failed-github-actions",
            label: "ESLint failed in GitHub Actions",
          },
          {
            href: "/guides/pytest-failed-github-actions",
            label: "pytest failed in GitHub Actions",
          },
          {
            href: "/guides/explain-github-actions-failure",
            label: "Explain this GitHub Actions failure",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Why does GitHub say Process completed with exit code 101 after cargo test?",
        answer:
          "That line is a wrapper. Cargo exits 101 for every failure, so the phrase Process completed with exit code 101 is not the diagnosis. A shell or actions-rs/cargo wrapper may print Process completed with exit code 1 instead. Scroll up to the first test result: FAILED, panicked at, error: could not compile, --locked was passed, failed to get, or rustup error — that is the cause.",
      },
      {
        question:
          "How do I tell a cargo, registry, cache, or toolchain failure from a compile error or a real test FAIL?",
        answer:
          "If dtolnay/rust-toolchain or actions-rs/toolchain is red, or the log prints rustup could not choose a version of cargo, override toolchain … is not installed, or does not have the binary rustfmt, cargo test never graded your suite. the lock file … --locked was passed, failed to get, Unable to update registry, perhaps a crate was updated and forgotten to be re-vendored?, and checksum for … changed between lock files are registry, Cargo.lock, vendor, or cache failures — no test ran. error: could not compile and error[E0425], or error: failed to run custom build command, mean rustc or a build script stopped the crate. A real cargo test failure shows test tests::name ... FAILED, panicked at, and test result: FAILED after that crate compiled.",
      },
      {
        question: "Why do Rust tests pass locally and fail in GitHub Actions?",
        answer:
          "The laptop often has a newer rustc (rustup updated stable), a warm ~/.cargo, and a Cargo.lock that was never committed. ubuntu-latest uses the dtolnay/rust-toolchain channel with --locked, so it will not rewrite the lockfile, and a rust-toolchain.toml channel the workflow overrode is a different compiler. A vendor directory that is stale only on CI fails with perhaps a crate was updated and forgotten to be re-vendored? A -sys crate that found OpenSSL on the laptop fails with failed to run custom build command when the runner image lacks the library. Fork pull requests also drop secrets, so a private registry token is empty.",
      },
      {
        question: "What does could not compile mean compared with test result: FAILED?",
        answer:
          "error: could not compile \`checkout\` (lib test) means rustc stopped the crate. No test function ran, so there is no test result: line and no panicked at. test result: FAILED with thread 'tests::applies_summer_coupon' panicked at means the test binary started and that test failed. note: test did not panic as expected is a #[should_panic] test that ran and stayed calm. Fix the first one you see.",
      },
      {
        question: "Do I need to install a GitHub Action to explain cargo test failed GitHub Actions?",
        answer:
          "No. Paste the log at /analyze. The top cause is free. An optional teaser Action can comment a truncated excerpt and a link back; it does not upload the log and is not on the Marketplace. Public callers use ipinney/causeci/action@main.",
      },
    ],
  },
  {
    slug: "maven-test-failed-github-actions",
    path: "/guides/maven-test-failed-github-actions",
    title: "Maven / Surefire test failed in GitHub Actions",
    description:
      "How to read a red mvn test / Surefire step in GitHub Actions: distinguish a dependency, plugin, settings.xml, JDK, toolchain, or ~/.m2 cache failure from a compiler error and from a real Surefire <<< FAILURE!, and ignore Process completed with exit code 1.",
    eyebrow: "mvn test · Surefire · JDK",
    lede:
      "When Maven test fails in GitHub Actions, the last line is almost always Process completed with exit code 1. That is a wrapper. The cause is the first real error — a dependency or plugin that did not resolve, a settings.xml 401, a JDK or toolchain mismatch, a bad ~/.m2 cache, a compilation error, or a real Surefire <<< FAILURE!.",
    keywords: [
      "maven test failed GitHub Actions",
      "maven surefire Process completed with exit code 1",
      "mvn test failed CI",
      "settings.xml / dependency / cache drift",
      "JDK / toolchain",
    ],
    updatedAt: "2026-09-29",
    sections: [
      {
        heading: "Start at the first error, not exit code 1",
        paragraphs: [
          "A red mvn test or mvn verify step almost always ends with Process completed with exit code 1. Ignore that wrapper line. Maven exits 1 for every build failure — a download, a compiler error, or a test — and GitHub then prints the wrapper. Scroll up in the failing step to the first <<< FAILURE!, <<< ERROR!, There are test failures, COMPILATION ERROR, Could not resolve dependencies, Plugin … could not be resolved, status code: 401, release version … not supported, or Cannot find matching toolchain definitions. That sentence is the diagnosis you are trying to name.",
          "Maven does not print Jest's FAIL path or Test Suites: line, Vitest's RUN  v banner, Playwright's Running N tests using M workers, Cypress's Running: spec.cy.js, Go's --- FAIL:, or Cargo's test result: FAILED. A real Surefire log prints T E S T S, then Running com.acme.checkout.BillingTest, then Tests run: N, Failures: 1 and <<< FAILURE! with the assertion under it. BUILD FAILURE and [Help 1] are the summary, not the cause. If you never see the T E S T S banner, Surefire did not grade the suite.",
        ],
        list: [
          "Search the raw job log for <<< FAILURE!, <<< ERROR!, There are test failures, COMPILATION ERROR, Could not resolve dependencies, could not be resolved, status code: 401, Blocked mirror for repositories, release version, toolchains.xml, invalid LOC header, and ##[error].",
          "Quote the first of those lines — do not paraphrase the wrapper Process completed with exit code 1, and do not stop at BUILD FAILURE.",
          "If the first error is in actions/setup-java, or the log stops at a resolve, plugin, enforcer, or compiler line before T E S T S, mvn test never graded your suite. Treat that as a JDK, settings, dependency, plugin, or cache failure.",
        ],
      },
      {
        heading: "Common Surefire CI failures",
        paragraphs: [
          "After the reactor resolved its artifacts and the main and test sources compiled, the first red block is one of a short list. Rank it in this order. A compiler error fails in maven-compiler-plugin, before the T E S T S banner, and the line says COMPILATION ERROR or cannot find symbol. A <<< FAILURE! line, a <<< ERROR! line, or There are test failures means that test method ran (or its @BeforeEach / @BeforeAll did). The Go and Cargo guides are the same split for their runners; this page is Maven, the module, and the test method.",
          "mvn -B test runs the surefire:test goal on each module that has tests. A module line in the reactor summary that says SKIPPED did not fail — an earlier module already failed and Maven stopped the reactor. FAILURE on a module is the pointer. Open that module's first error, which is above the summary. Tests run: 4, Failures: 1, Errors: 0 is an assertion. Errors: 1 with Failures: 0 is an unexpected exception, often in a lifecycle method. The job exits 1 either way. GitHub then appends Process completed with exit code 1. Read the first <<< FAILURE! or <<< ERROR!, not the wrapper.",
        ],
        list: [
          "Real assertion: Tests run: 4, Failures: 1, Errors: 0, Skipped: 0 <<< FAILURE! -- in com.acme.checkout.BillingTest, then BillingTest.appliesSummerCoupon -- Time elapsed: 0.012 s <<< FAILURE! and org.opentest4j.AssertionFailedError: expected: <18> but was: <20>. The test class compiled. Open that method. JUnit 4 prints java.lang.AssertionError: expected:<18> but was:<20> for the same outcome.",
          "Unexpected throw: <<< ERROR! and a stack that is not an assertion (NullPointerException, a failed assumption, an exception from @BeforeEach). The test runtime started. It is still a Surefire result, not a missing dependency.",
          "No tests matched: Tests run: 0, Failures: 0, Errors: 0, Skipped: 0 and No tests were executed! or No tests matching pattern. The -Dtest= filter, the includes, or the JUnit Platform provider did not see a class. Nothing asserted.",
          "Compile: COMPILATION ERROR, then cannot find symbol for applyDiscount, then Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin … compile. No T E S T S banner, because test classes were never run. testCompile is the same gate for src/test/java.",
          "Fork crash: The forked VM terminated without properly saying goodbye. VM crash or System.exit called? Surefire started a JVM and it died. Look above that line for insufficient memory or a System.exit in a test. There is often no <<< FAILURE!.",
          "Failsafe, if the goal is verify: the same There are test failures phrase from maven-failsafe-plugin, with reports under target/failsafe-reports. Read it the same way. It is not the unit-test goal.",
        ],
        code: {
          label: "Surefire failure log excerpt",
          content: `[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.acme.checkout.BillingTest
[ERROR] Tests run: 4, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 0.042 s <<< FAILURE! -- in com.acme.checkout.BillingTest
[ERROR] com.acme.checkout.BillingTest.appliesSummerCoupon -- Time elapsed: 0.012 s <<< FAILURE!
org.opentest4j.AssertionFailedError: expected: <18> but was: <20>
	at com.acme.checkout.BillingTest.appliesSummerCoupon(BillingTest.java:21)

[ERROR] Failures:
[ERROR]   BillingTest.appliesSummerCoupon:21 expected: <18> but was: <20>
[ERROR] Tests run: 4, Failures: 1, Errors: 0, Skipped: 0
[INFO] BUILD FAILURE
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-surefire-plugin:3.5.2:test (default-test) on project checkout: There are test failures.
[ERROR] Please refer to /home/runner/work/checkout/checkout/target/surefire-reports for the individual test results.
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Dependency, plugin, settings.xml, JDK, toolchain, and cache versus a real FAIL",
        paragraphs: [
          "A broken download and a failing test look the same in the Checks UI: a red job and exit code 1. They are not the same failure. Could not resolve dependencies, Could not find artifact, Failed to collect dependencies, Non-resolvable parent POM, Plugin org.apache.maven.plugins:maven-surefire-plugin … or one of its dependencies could not be resolved, status code: 401, and Blocked mirror for repositories mean Maven never reached the test goal. COMPILATION ERROR means the artifacts resolved and javac rejected a source file. <<< FAILURE! and There are test failures, after T E S T S, mean a test ran. If a resolve error and a FAILURE both appear in one paste, rank the earlier module first. Later modules marked SKIPPED are the symptom.",
          "actions/setup-java selects the JDK before your test step. A red setup-java step — Could not find Java version, or a java-version that the distribution does not publish — means mvn never started. When the step is green, read its java-version and distribution anyway. The compiler uses that JAVA_HOME. A pom with maven.compiler.release set to 21, run on a Temurin 17 that the workflow pinned, dies with Fatal error compiling: error: release version 21 not supported. An older source/target pair prints invalid target release: 21. maven-enforcer-plugin prints Rule 0: org.apache.maven.plugins.enforcer.RequireJavaVersion failed and Detected JDK version 17 … is not in the allowed range [21,). Those are JDK mismatches, not test failures. Ubuntu-latest also ships a preinstalled JDK and mvn. A workflow that skips setup-java compiles with whatever the image default is, and that default moves when GitHub bumps the runner image.",
          "maven-toolchains-plugin is a separate gate. setup-java exports JAVA_HOME. It does not write ~/.m2/toolchains.xml. A pom that binds the toolchain goal fails before any test with Cannot find matching toolchain definitions for the following toolchain types: jdk [ version='21' ] and Please make sure you define the required toolchains in your ~/.m2/toolchains.xml file. Write a toolchains file that points that version at the setup-java installation, or drop the plugin if the build should just use JAVA_HOME. A ./mvnw download that cannot fetch the distribution in .mvn/wrapper/maven-wrapper.properties also dies before tests — the Maven version is the wrapper's distributionUrl, not the mvn your laptop installed with SDKMAN.",
          "Dependencies, plugins, settings.xml, and the local repository are the other install family. Could not find artifact com.acme:billing-api:jar:2.4.0 in central means the coordinate is not in any repository the build asked. A private repository that answers status code: 401, reason phrase: Unauthorized (401) — or 403 — means settings.xml did not authenticate. The <server><id> must equal the repository id in the pom (or the server-id you passed to setup-java). A password that works on push is empty on a fork pull request, because repository secrets are not shared with forks, so the same 401 appears only on those PRs. Maven 3.8.1 and newer block HTTP repositories: Blocked mirror for repositories, often via maven-default-http-blocker. Point the repository at https, or the runner will not download it. A <mirror> of central at a host the runner cannot resolve fails the same way, with no T E S T S banner.",
          "actions/setup-java with cache: maven stores ~/.m2/repository, keyed from the pom files. A cache miss only slows the job. A hit that restores a truncated jar fails while loading a plugin or a test dependency with java.util.zip.ZipException: invalid LOC header (bad signature). That is a corrupt cache entry, not an assertion. Delete that artifact from the local repo or bust the setup-java cache and re-run. Do not treat the miss itself as the root cause of a <<< FAILURE!. A SNAPSHOT that the cache still holds, while the pom version did not change, can also test the wrong bytes — publish and resolve again, or stop caching that snapshot path.",
        ],
        list: [
          "setup-java: the setup step is red, or the first compiler line is release version 21 not supported, invalid target release: 21, or RequireJavaVersion failed. Set java-version to the same release the pom compiles for. Confirm JAVA_HOME in that step.",
          "Toolchains: Cannot find matching toolchain definitions for the following toolchain types. Add ~/.m2/toolchains.xml for that jdk version, pointing at the setup-java home. setup-java alone does not write this file.",
          "Wrapper: a failure to download the distributionUrl, or Could not find or load main class org.apache.maven.wrapper.MavenWrapperMain, means ./mvnw never ran Maven. Commit the wrapper files the script expects, and reproduce with ./mvnw, not a different local mvn.",
          "Dependency: Could not resolve dependencies, Could not find artifact, Failed to read artifact descriptor, or Non-resolvable parent POM. The test goal did not run. Fix the coordinate, the repository, or the parent relativePath.",
          "Plugin: Plugin … or one of its dependencies could not be resolved. Surefire (or the compiler) was not even downloaded. Same family as a dependency miss.",
          "settings.xml: status code: 401 or 403, authentication failed, or Blocked mirror for repositories. Match server id to repository id. Use https. Fork pull requests do not receive the password secret.",
          "Cache: invalid LOC header (bad signature) while reading a jar under ~/.m2/repository. Purge that artifact or the setup-java cache. A miss is not a failure.",
          "Compile: COMPILATION ERROR and cannot find symbol, from maven-compiler-plugin compile or testCompile. Fix the Java file. There is no <<< FAILURE! yet.",
          "Test: <<< FAILURE! or <<< ERROR! after T E S T S, then There are test failures and a surefire-reports path. Re-run that test class.",
        ],
        code: {
          label: "Same exit code, different first errors",
          content: `# Dependency — tests never ran
[ERROR] Failed to execute goal on project checkout: Could not resolve dependencies for project com.acme:checkout:jar:1.0.0
[ERROR] dependency: com.acme:billing-api:jar:2.4.0 (compile)
[ERROR] 	Could not find artifact com.acme:billing-api:jar:2.4.0 in central (https://repo.maven.apache.org/maven2)
##[error]Process completed with exit code 1

# Plugin — Surefire never started
[ERROR] Plugin org.apache.maven.plugins:maven-surefire-plugin:3.5.2 or one of its dependencies could not be resolved:
[ERROR] 	Could not find artifact org.apache.maven.plugins:maven-surefire-plugin:jar:3.5.2 in central (https://repo.maven.apache.org/maven2)
##[error]Process completed with exit code 1

# settings.xml — 401, tests never ran
[ERROR] Failed to execute goal on project checkout: Could not resolve dependencies for project com.acme:checkout:jar:1.0.0: Failed to collect dependencies at com.acme:billing-api:jar:2.4.0: Could not transfer artifact com.acme:billing-api:pom:2.4.0 from/to acme-releases (https://maven.acme.example/releases): status code: 401, reason phrase: Unauthorized (401)
##[error]Process completed with exit code 1

# HTTP repository blocked since Maven 3.8.1 — tests never ran
[ERROR] Could not transfer artifact com.acme:billing-api:pom:2.4.0 from/to maven-default-http-blocker (http://0.0.0.0/): Blocked mirror for repositories: [legacy-releases (http://repo.acme.example/releases, default, releases)]
##[error]Process completed with exit code 1

# JDK — compiler never accepted the release
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.13.0:compile (default-compile) on project checkout: Fatal error compiling: error: release version 21 not supported -> [Help 1]
##[error]Process completed with exit code 1

# Toolchain — no toolchains.xml on the runner
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-toolchains-plugin:3.2.0:toolchain (default) on project checkout: Cannot find matching toolchain definitions for the following toolchain types:
[ERROR] jdk [ version='21' ]
[ERROR] Please make sure you define the required toolchains in your ~/.m2/toolchains.xml file.
##[error]Process completed with exit code 1

# Corrupt Maven cache — jar in ~/.m2 did not load
java.util.zip.ZipException: invalid LOC header (bad signature)
##[error]Process completed with exit code 1

# Compile — no test method ran
[ERROR] COMPILATION ERROR :
[ERROR] /home/runner/work/checkout/checkout/src/main/java/com/acme/checkout/Billing.java:[14,9] cannot find symbol
[ERROR]   symbol:   method applyDiscount(int)
[ERROR]   location: class com.acme.checkout.Billing
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.13.0:compile (default-compile) on project checkout: Compilation failure
##[error]Process completed with exit code 1

# Fork crash — Surefire started a JVM; it is not an assertion
[ERROR] The forked VM terminated without properly saying goodbye. VM crash or System.exit called?
[ERROR] org.apache.maven.surefire.booter.SurefireBooterForkException: The forked VM terminated without properly saying goodbye. VM crash or System.exit called?
##[error]Process completed with exit code 1

# Real test — the class ran and the assertion failed
[ERROR] com.acme.checkout.BillingTest.appliesSummerCoupon -- Time elapsed: 0.012 s <<< FAILURE!
org.opentest4j.AssertionFailedError: expected: <18> but was: <20>
	at com.acme.checkout.BillingTest.appliesSummerCoupon(BillingTest.java:21)
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-surefire-plugin:3.5.2:test (default-test) on project checkout: There are test failures.
[ERROR] Please refer to /home/runner/work/checkout/checkout/target/surefire-reports for the individual test results.
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Reproduce with the same CI command",
        paragraphs: [
          "A laptop that already has a warm ~/.m2, a settings.xml with the private server password, and a newer JDK than the workflow is not the CI gate. Match the runner: the same distribution and java-version as actions/setup-java (read them from that step), then the exact Maven invocation. If CI runs ./mvnw -B -ntp -s .github/maven-settings.xml test, run that — not mvn test after a local install already filled the repository with a SNAPSHOT the runner will not see.",
          "Pass the same -P profiles, -D arguments, and goals. test and verify are different plugins. -Dtest=BillingTest#appliesSummerCoupon reruns one method once the full build fails the same way. --also-make (-am) matters in a reactor: a failure in an upstream module never reaches the module you re-ran alone. If the workflow uses the wrapper, ./mvnw -v is the Maven version to match, from distributionUrl.",
        ],
        list: [
          "JDK: install the version from setup-java. Confirm with java -version and echo \"$JAVA_HOME\". The release in the pom must be less than or equal to that JDK.",
          "Settings: use the same -s file CI uses. The server id matches the repository id. Do not commit passwords. Fork PRs still will not have the secret.",
          "Test: ./mvnw -B -ntp test. One class: ./mvnw -B -ntp -Dtest=BillingTest test. One method: ./mvnw -B -ntp -Dtest=BillingTest#appliesSummerCoupon test.",
          "Profiles and verify: add -Pci only when the workflow does. Use verify when CI does — that is failsafe, and the report directory is target/failsafe-reports.",
        ],
        code: {
          label: "Same commands the runner used",
          content: `java -version
echo "$JAVA_HOME"
./mvnw -v
./mvnw -B -ntp test
# one class:
./mvnw -B -ntp -Dtest=BillingTest test
# one method:
./mvnw -B -ntp -Dtest=BillingTest#appliesSummerCoupon test
# only if CI passed these:
./mvnw -B -ntp -s .github/maven-settings.xml -Pci verify`,
        },
      },
      {
        heading: "Paste the log when the first error is still unclear",
        paragraphs: [
          "If the log is long or the first error is buried under dependency download noise, paste the failed job output at /analyze. CauseCI returns a teaser with the top cause free. Remaining ranks and a patch draft stay locked until you unlock the artifact. The Action does not upload your log — a human still pastes it.",
          "An optional teaser Action can post a truncated excerpt and a paste link when a job fails. It is not a Marketplace publish. Install from the public repo path uses: ipinney/causeci/action@main. Notes live at /guides/install-github-action-failure-teaser. All of the notes, including this one, are listed at /guides.",
        ],
        links: [
          { href: "/analyze", label: "Paste a log on CauseCI" },
          {
            href: ACTION_INSTALL_PATH,
            label: "Optional: install the failure-teaser Action",
          },
          { href: "/guides", label: "All CI failure guides" },
          {
            href: "/guides/rust-test-failed-github-actions",
            label: "Rust cargo test failed in GitHub Actions",
          },
          {
            href: "/guides/go-test-failed-github-actions",
            label: "Go test failed in GitHub Actions",
          },
          {
            href: "/guides/cypress-failed-github-actions",
            label: "Cypress failed in GitHub Actions",
          },
          {
            href: "/guides/playwright-failed-github-actions",
            label: "Playwright failed in GitHub Actions",
          },
          {
            href: "/guides/vitest-failed-github-actions",
            label: "Vitest failed in GitHub Actions",
          },
          {
            href: "/guides/jest-failed-github-actions",
            label: "Jest failed in GitHub Actions",
          },
          {
            href: "/guides/npm-test-failed-github-actions",
            label: "npm test failed in GitHub Actions",
          },
          {
            href: "/guides/typescript-failed-github-actions",
            label: "TypeScript / tsc failed in GitHub Actions",
          },
          {
            href: "/guides/eslint-failed-github-actions",
            label: "ESLint failed in GitHub Actions",
          },
          {
            href: "/guides/pytest-failed-github-actions",
            label: "pytest failed in GitHub Actions",
          },
          {
            href: "/guides/explain-github-actions-failure",
            label: "Explain this GitHub Actions failure",
          },
        ],
      },
    ],
    faqs: [
      {
        question:
          "Why does GitHub say Process completed with exit code 1 after Maven?",
        answer:
          "That line is a wrapper. Maven exits 1 for every failure, so the phrase mvn test Process completed with exit code 1 is not the diagnosis. BUILD FAILURE and [Help 1] are the summary under it. Scroll up to the first <<< FAILURE!, <<< ERROR!, There are test failures, Could not resolve dependencies, COMPILATION ERROR, status code: 401, or release version … not supported — that is the cause.",
      },
      {
        question:
          "How do I tell a dependency, plugin, settings.xml, JDK, toolchain, or cache failure from a real Surefire FAIL?",
        answer:
          "If actions/setup-java is red, or the log prints Could not resolve dependencies, Could not find artifact, Plugin … could not be resolved, status code: 401, Blocked mirror for repositories, release version 21 not supported, invalid target release, RequireJavaVersion failed, or Cannot find matching toolchain definitions, mvn test never graded your suite. invalid LOC header (bad signature) is a corrupt ~/.m2 jar. COMPILATION ERROR and cannot find symbol mean javac stopped the module. A real Surefire failure shows T E S T S, <<< FAILURE! or <<< ERROR!, There are test failures, and a target/surefire-reports path. The forked VM terminated without properly saying goodbye is a Surefire JVM crash, not an assertion.",
      },
      {
        question: "Why do Maven tests pass locally and fail in GitHub Actions?",
        answer:
          "The laptop often has a newer JDK, a warm ~/.m2, and a settings.xml whose server password the runner does not have. ubuntu-latest uses the setup-java version, refuses an HTTP repository (Blocked mirror for repositories), and does not create toolchains.xml for you. A pom release of 21 on a workflow that pins Java 17 fails with release version 21 not supported before any test. Fork pull requests also drop secrets, so a private repository returns 401 only on those builds. A cached SNAPSHOT or a jar with an invalid LOC header fails on the runner and not on the laptop.",
      },
      {
        question:
          "What does There are test failures mean compared with Could not resolve dependencies?",
        answer:
          "Could not resolve dependencies, Could not find artifact, and Plugin … could not be resolved mean Maven stopped during the download. No test method ran, so there is no <<< FAILURE! and no T E S T S banner. COMPILATION ERROR is the same split one step later: javac failed, Surefire did not run. There are test failures, printed by maven-surefire-plugin after <<< FAILURE! or <<< ERROR!, means the test JVM started and a test failed. Please refer to …/target/surefire-reports is where that result was written. Fix the first one you see. A later module marked SKIPPED is a consequence.",
      },
      {
        question:
          "Do I need to install a GitHub Action to explain Maven test failed GitHub Actions?",
        answer:
          "No. Paste the log at /analyze. The top cause is free. An optional teaser Action can comment a truncated excerpt and a link back; it does not upload the log and is not on the Marketplace. Public callers use ipinney/causeci/action@main.",
      },
    ],
  },
  {
    slug: "gradle-test-failed-github-actions",
    path: "/guides/gradle-test-failed-github-actions",
    title: "Gradle / JUnit test failed in GitHub Actions",
    description:
      "How to read a red ./gradlew test / JUnit step in GitHub Actions: distinguish a dependency, settings, credentials, JDK toolchain, or ~/.gradle cache failure from a compiler error and from a real test FAILED, and ignore Process completed with exit code 1.",
    eyebrow: "gradlew test · JUnit · JDK",
    lede:
      "When Gradle test fails in GitHub Actions, the last line is almost always Process completed with exit code 1. That is a wrapper. The cause is the first real error — a dependency that did not resolve, a settings or credentials 401, a JDK or toolchain mismatch, a bad ~/.gradle cache, a compilation error, or a real JUnit FAILED.",
    keywords: [
      "gradle test failed GitHub Actions",
      "gradlew test Process completed with exit code 1",
      "gradle test failed CI",
      "dependency / cache / credentials drift",
      "JDK / toolchain",
    ],
    updatedAt: "2026-09-30",
    sections: [
      {
        heading: "Start at the first error, not exit code 1",
        paragraphs: [
          "A red ./gradlew test or gradle test step almost always ends with Process completed with exit code 1. Ignore that wrapper line. Gradle exits 1 for every build failure — a download, a compiler error, or a test — and GitHub then prints the wrapper. Scroll up in the failing step to the first What went wrong, Execution failed for task ':test', FAILED, Could not resolve, Received status code 401, No matching toolchains found, Compilation failed, or Cannot create Launcher without at least one TestEngine. That sentence is the diagnosis you are trying to name.",
          "Gradle does not print Jest's FAIL path or Test Suites: line, Vitest's RUN  v banner, Playwright's Running N tests using M workers, Cypress's Running: spec.cy.js, Go's --- FAIL:, Cargo's test result: FAILED, or Maven's <<< FAILURE! and T E S T S banner. A real Gradle test log prints > Task :test, then com.acme.checkout.BillingTest > appliesSummerCoupon() FAILED, then 4 tests completed, 1 failed, then FAILURE: Build failed with an exception, * What went wrong:, Execution failed for task ':test'., and There were failing tests. See the report at: file:///…/build/reports/tests/test/index.html. BUILD FAILED is the summary, not the cause. If you never see a test class FAILED line or that report path after the test task, the JUnit Platform (or TestNG) did not grade the suite. A JUnit Platform ConsoleLauncher run prints a Failures (1): banner instead. ./gradlew test does not.",
        ],
        list: [
          "Search the raw job log for What went wrong, Execution failed for task, FAILED, There were failing tests, Could not resolve, Received status code 401, No matching toolchains found, Compilation failed, cannot find symbol, invalid LOC header, GradleWrapperMain, and ##[error].",
          "Quote the first of those lines — do not paraphrase the wrapper Process completed with exit code 1, and do not stop at BUILD FAILED.",
          "If the first error is in actions/setup-java or gradle/actions/setup-gradle, or the log stops at a resolve, settings, toolchain, or compiler line before > Task :test, ./gradlew test never graded your suite. Treat that as a JDK, settings, dependency, or cache failure.",
        ],
      },
      {
        heading: "Common Gradle and JUnit CI failures",
        paragraphs: [
          "After the build resolved its artifacts and the main and test sources compiled, the first red block is one of a short list. Rank it in this order. A compiler error fails in :compileJava or :compileTestJava, before any test worker, and the line says Compilation failed; see the compiler error output for details or cannot find symbol. A class > method() FAILED line, or There were failing tests after > Task :test, means that test method ran (or its @BeforeEach / @BeforeAll did). The Maven guide is the same split for Surefire; this page is Gradle, the task, and the test method.",
          "./gradlew test runs the test task. useJUnitPlatform() selects the JUnit Platform (JUnit 5). useJUnit() selects JUnit 4. useTestNG() selects TestNG. A task line that says UP-TO-DATE or SKIPPED did not fail. FAILED on a task is the pointer. Open that task's first error, which is above FAILURE: Build failed with an exception. 4 tests completed, 1 failed with an AssertionFailedError is an assertion. A FAILED line whose exception is not an assertion — a NullPointerException from @BeforeEach, or a test worker that died — is still a test-task result. The job exits 1 either way. GitHub then appends Process completed with exit code 1. Read the first FAILED test or the first What went wrong, not the wrapper. Gradle's short exception format prints the exception type and the file, and leaves expected: <18> but was: <20> in the HTML report. exceptionFormat = full, or --info, prints that message on the console.",
        ],
        list: [
          "Real assertion (JUnit Platform): com.acme.checkout.BillingTest > appliesSummerCoupon() FAILED, then org.opentest4j.AssertionFailedError: expected: <18> but was: <20>, then 4 tests completed, 1 failed, then Execution failed for task ':test'. and There were failing tests. See the report at: file:///home/runner/work/checkout/checkout/build/reports/tests/test/index.html. The XML is under build/test-results/test/. The test class compiled. Open that method. JUnit 4 (useJUnit()) prints java.lang.AssertionError: expected:<18> but was:<20> for the same outcome.",
          "TestNG: useTestNG() prints com.acme.checkout.BillingTest > appliesSummerCoupon FAILED and java.lang.AssertionError: expected [18] but found [20] from org.testng.Assert. The task is still :test, and the job still exits 1. Read the assertion, not the wrapper.",
          "Unexpected throw: a FAILED line whose type is not an assertion (NullPointerException, an exception from @BeforeEach / @BeforeAll). The test runtime started. It is still a test-task result, not a missing dependency.",
          "No tests matched: No tests found for given includes, or Cannot create Launcher without at least one TestEngine; consider adding an engine implementation JAR to the classpath. useJUnitPlatform() without junit-jupiter-engine on the test runtime classpath discovers nothing. Nothing asserted.",
          "Compile: > Task :compileJava FAILED, then cannot find symbol for applyDiscount, then Execution failed for task ':compileJava'. and Compilation failed; see the compiler error output for details. No test worker, because test classes were never run. :compileTestJava is the same gate for src/test/java.",
          "Worker crash: Process 'Gradle Test Executor 1' finished with non-zero exit value 1 (or 137 when the kernel killed it). Gradle started a test JVM and it died. Look above that line for Java heap space. There is often no assertion message. The Gradle build daemon disappeared unexpectedly is the same family for the daemon JVM, before a test result exists.",
        ],
        code: {
          label: "JUnit failure log excerpt",
          content: `> Task :test

com.acme.checkout.BillingTest > appliesSummerCoupon() FAILED
    org.opentest4j.AssertionFailedError: expected: <18> but was: <20>
        at app//com.acme.checkout.BillingTest.appliesSummerCoupon(BillingTest.java:21)

4 tests completed, 1 failed

> Task :test FAILED

FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':test'.
> There were failing tests. See the report at: file:///home/runner/work/checkout/checkout/build/reports/tests/test/index.html

BUILD FAILED in 18s
4 actionable tasks: 4 executed
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Dependency, credentials, JDK toolchain, and cache versus a real assertion",
        paragraphs: [
          "A broken download and a failing test look the same in the Checks UI: a red job and exit code 1. They are not the same failure. Could not resolve all files for configuration, Could not find com.acme:billing-api:2.4.0, Plugin [id: …] was not found, and Received status code 401 from server: Unauthorized mean Gradle never reached a passing test worker. Compilation failed means the artifacts resolved and javac rejected a source file. A class > method() FAILED line, after > Task :test, means a test ran. If a resolve error and a FAILED test both appear in one paste, rank the earlier task first. Later tasks marked SKIPPED are the symptom.",
          "actions/setup-java selects the JDK before your test step. A red setup-java step — Could not find Java version, or a java-version that the distribution does not publish — means ./gradlew never started. When the step is green, read its java-version and distribution anyway. Gradle itself runs on that JAVA_HOME. A build that sets options.release.set(21), or sourceCompatibility = 21, on a Temurin 17 that the workflow pinned, dies with error: release version 21 not supported and then Execution failed for task ':compileJava'. An older Gradle that cannot read the JDK the workflow selected fails while evaluating the build script with Unsupported class file major version 65 (Java 21 bytecode). That is a Gradle/JDK mismatch, not a test failure. ubuntu-latest also ships a preinstalled JDK. A workflow that skips setup-java runs Gradle on whatever the image default is, and that default moves when GitHub bumps the runner image.",
          "java.toolchain.languageVersion is a separate gate. setup-java exports JAVA_HOME. It does not satisfy a toolchain request for a different version, and it does not configure a download repository. Gradle 8 and newer fail before any test with No matching toolchains found for requested specification: {languageVersion=21, vendor=any, implementation=vendor-specific} and No locally installed toolchains match and toolchain download repositories have not been configured. Install that JDK with setup-java so auto-detection sees it, or apply a toolchain resolver such as org.gradle.toolchains.foojay-resolver-convention in settings. A ./gradlew download that cannot fetch the distributionUrl in gradle/wrapper/gradle-wrapper.properties also dies before tests — the Gradle version is the wrapper's distributionUrl, not a gradle binary your laptop installed with SDKMAN. Could not install Gradle distribution from 'https://services.gradle.org/distributions/…' and Error: Could not find or load main class org.gradle.wrapper.GradleWrapperMain mean the wrapper never started a build.",
          "Dependencies, settings, and credentials are the other install family. Could not find com.acme:billing-api:2.4.0. Searched in the following locations means the coordinate is not in any repository the build asked. A private repository that answers Received status code 401 from server: Unauthorized — or 403 — means settings.gradle or gradle.properties did not authenticate. The username and password on that maven repository must be present on the runner. Gradle reads them from gradle.properties, from ~/.gradle/gradle.properties, or from environment variables prefixed with ORG_GRADLE_PROJECT_. A password that works on push is empty on a fork pull request, because repository secrets are not shared with forks, so the same 401 appears only on those PRs. A settings script that calls providers.gradleProperty(\"mavenPassword\").get() when the property is missing fails earlier, with Cannot query the value of this provider because it has no value available, or Could not get unknown property 'mavenPassword'. Gradle 7 and newer refuse an HTTP repository unless the repository opts in: Using insecure protocols with repositories, without explicit opt-in, is unsupported. Point the repository at https, or the runner will not download it.",
          "gradle/actions/setup-gradle, and actions/setup-java with cache: gradle, store ~/.gradle/caches and the wrapper dists. A cache miss only slows the job. A hit that restores a truncated jar fails while resolving with java.util.zip.ZipException: invalid LOC header (bad signature), or Could not unzip a path under ~/.gradle/caches/modules-2/files-2.1. That is a corrupt cache entry, not an assertion. Delete that artifact from the Gradle user home or bust the action cache and re-run. Do not treat the miss itself as the root cause of a FAILED test. A configuration-cache run that prints Configuration cache problems found in this build failed while storing or loading the configuration cache. No test method asserted.",
        ],
        list: [
          "setup-java: the setup step is red, or the first compiler line is release version 21 not supported, or the build script dies with Unsupported class file major version 65. Set java-version to a JDK Gradle can run on, and to a JDK that can compile the release the build requests. Confirm JAVA_HOME in that step.",
          "Toolchain: No matching toolchains found for requested specification and toolchain download repositories have not been configured. Install that languageVersion with setup-java, or apply a toolchain resolver in settings. setup-java alone does not download a different toolchain.",
          "Wrapper: Could not install Gradle distribution, ./gradlew: Permission denied, or Could not find or load main class org.gradle.wrapper.GradleWrapperMain means ./gradlew never ran Gradle. Commit gradlew, gradle/wrapper/gradle-wrapper.jar, and gradle/wrapper/gradle-wrapper.properties. Reproduce with ./gradlew, not a different local gradle.",
          "Dependency: Could not resolve all files for configuration, Could not find …, or Plugin [id: …] was not found. The test task did not grade the suite. Fix the coordinate or the repository in settings.gradle.",
          "Credentials: Received status code 401 or 403, Could not get unknown property 'mavenPassword', or Cannot query the value of this provider because it has no value available. Pass the property the repository block reads. Do not commit the password. Fork pull requests do not receive the secret.",
          "Cache: invalid LOC header (bad signature) or Could not unzip while reading a jar under ~/.gradle/caches. Purge that artifact or the setup-gradle cache. A miss is not a failure. Configuration cache problems found in this build is a cache failure, not an assertion.",
          "Compile: Compilation failed; see the compiler error output for details and cannot find symbol, from :compileJava or :compileTestJava. Fix the Java file. There is no test FAILED line yet.",
          "Test: a class > method() FAILED line after > Task :test, then There were failing tests and a build/reports/tests/test path. Re-run that test class.",
        ],
        code: {
          label: "Same exit code, different first errors",
          content: `# Dependency — tests never ran
* What went wrong:
Execution failed for task ':compileJava'.
> Could not resolve all files for configuration ':compileClasspath'.
   > Could not find com.acme:billing-api:2.4.0.
     Searched in the following locations:
       - https://repo.maven.apache.org/maven2/com/acme/billing-api/2.4.0/billing-api-2.4.0.pom
     Required by:
         project :
##[error]Process completed with exit code 1

# Plugin — the build never configured
* What went wrong:
Plugin [id: 'com.acme.billing', version: '2.4.0'] was not found in any of the following sources:
- Plugin Repositories (could not resolve plugin artifact 'com.acme.billing:com.acme.billing.gradle.plugin:2.4.0')
##[error]Process completed with exit code 1

# Credentials — 401, tests never ran
* What went wrong:
Execution failed for task ':compileJava'.
> Could not resolve all files for configuration ':compileClasspath'.
   > Could not resolve com.acme:billing-api:2.4.0.
      > Could not get resource 'https://maven.acme.example/releases/com/acme/billing-api/2.4.0/billing-api-2.4.0.pom'.
         > Could not GET 'https://maven.acme.example/releases/com/acme/billing-api/2.4.0/billing-api-2.4.0.pom'. Received status code 401 from server: Unauthorized
##[error]Process completed with exit code 1

# HTTP repository — tests never ran
* What went wrong:
Execution failed for task ':compileJava'.
> Could not resolve all files for configuration ':compileClasspath'.
   > Using insecure protocols with repositories, without explicit opt-in, is unsupported.
##[error]Process completed with exit code 1

# JDK — compiler never accepted the release
> Task :compileJava FAILED
/home/runner/work/checkout/checkout/src/main/java/com/acme/checkout/Billing.java:14: error: release version 21 not supported
* What went wrong:
Execution failed for task ':compileJava'.
> Compilation failed; see the compiler error output for details.
##[error]Process completed with exit code 1

# Toolchain — no JDK 21 on the runner, and no download repository
* What went wrong:
Could not determine the dependencies of task ':test'.
> Failed to calculate the value of task ':compileJava' property 'javaCompiler'.
   > No matching toolchains found for requested specification: {languageVersion=21, vendor=any, implementation=vendor-specific}.
      > No locally installed toolchains match and toolchain download repositories have not been configured.
##[error]Process completed with exit code 1

# Wrapper — ./gradlew never started Gradle
Error: Could not find or load main class org.gradle.wrapper.GradleWrapperMain
##[error]Process completed with exit code 1

# Corrupt Gradle cache — jar in ~/.gradle/caches did not load
java.util.zip.ZipException: invalid LOC header (bad signature)
##[error]Process completed with exit code 1

# Compile — no test method ran
> Task :compileJava FAILED
/home/runner/work/checkout/checkout/src/main/java/com/acme/checkout/Billing.java:14: error: cannot find symbol
        return applyDiscount(total);
               ^
  symbol:   method applyDiscount(int)
  location: class Billing
* What went wrong:
Execution failed for task ':compileJava'.
> Compilation failed; see the compiler error output for details.
##[error]Process completed with exit code 1

# Worker crash — a test JVM started; it is not an assertion
* What went wrong:
Execution failed for task ':test'.
> Process 'Gradle Test Executor 1' finished with non-zero exit value 1
##[error]Process completed with exit code 1

# Real test — the class ran and the assertion failed
com.acme.checkout.BillingTest > appliesSummerCoupon() FAILED
    org.opentest4j.AssertionFailedError: expected: <18> but was: <20>
        at app//com.acme.checkout.BillingTest.appliesSummerCoupon(BillingTest.java:21)
* What went wrong:
Execution failed for task ':test'.
> There were failing tests. See the report at: file:///home/runner/work/checkout/checkout/build/reports/tests/test/index.html
##[error]Process completed with exit code 1`,
        },
      },
      {
        heading: "Reproduce with the same CI command",
        paragraphs: [
          "A laptop that already has a warm ~/.gradle/caches, a ~/.gradle/gradle.properties with the private repository password, and a newer JDK than the workflow is not the CI gate. Match the runner: the same distribution and java-version as actions/setup-java (read them from that step), then the exact Gradle invocation. If CI runs ./gradlew test --no-daemon, run that — not gradle test after a local install already filled the cache with a snapshot the runner will not see.",
          "Pass the same -P properties and tasks. test and check are different task graphs. check also runs other verification tasks, so a red check can be :checkstyleMain rather than :test. ./gradlew test --tests com.acme.checkout.BillingTest.appliesSummerCoupon reruns one method once the full build fails the same way. The separator is a dot, not Maven's #. In a multi-project build, :checkout:test does not rebuild a failing upstream project unless you ask for it. If the workflow uses the wrapper, ./gradlew -v is the Gradle version to match, from distributionUrl.",
        ],
        list: [
          "JDK: install the version from setup-java. Confirm with java -version and echo \"$JAVA_HOME\". The toolchain languageVersion and the compiler release must be a JDK that is actually installed, or a toolchain the settings file can download.",
          "Credentials: export the same ORG_GRADLE_PROJECT_ variables CI uses, or pass the same -P flags. Do not commit passwords. Fork PRs still will not have the secret.",
          "Test: ./gradlew test --no-daemon. One class: ./gradlew test --tests com.acme.checkout.BillingTest --no-daemon. One method: ./gradlew test --tests com.acme.checkout.BillingTest.appliesSummerCoupon --no-daemon.",
          "Properties and check: add -Penv=ci only when the workflow does. Use check when CI does — then read which task FAILED. A :checkstyleMain failure is not a JUnit assertion.",
        ],
        code: {
          label: "Same commands the runner used",
          content: `java -version
echo "$JAVA_HOME"
./gradlew -v
./gradlew test --no-daemon
# one class:
./gradlew test --tests com.acme.checkout.BillingTest --no-daemon
# one method:
./gradlew test --tests com.acme.checkout.BillingTest.appliesSummerCoupon --no-daemon
# only if CI passed these:
./gradlew test --no-daemon -Penv=ci`,
        },
      },
      {
        heading: "Paste the log when the first error is still unclear",
        paragraphs: [
          "If the log is long or the first error is buried under dependency download noise, paste the failed job output at /analyze. CauseCI returns a teaser with the top cause free. Remaining ranks and a patch draft stay locked until you unlock the artifact. The Action does not upload your log — a human still pastes it.",
          "An optional teaser Action can post a truncated excerpt and a paste link when a job fails. It is not a Marketplace publish. Install from the public repo path uses: ipinney/causeci/action@main. Notes live at /guides/install-github-action-failure-teaser. All of the notes, including this one, are listed at /guides.",
        ],
        links: [
          { href: "/analyze", label: "Paste a log on CauseCI" },
          {
            href: ACTION_INSTALL_PATH,
            label: "Optional: install the failure-teaser Action",
          },
          { href: "/guides", label: "All CI failure guides" },
          {
            href: "/guides/maven-test-failed-github-actions",
            label: "Maven / Surefire test failed in GitHub Actions",
          },
          {
            href: "/guides/rust-test-failed-github-actions",
            label: "Rust cargo test failed in GitHub Actions",
          },
          {
            href: "/guides/go-test-failed-github-actions",
            label: "Go test failed in GitHub Actions",
          },
          {
            href: "/guides/cypress-failed-github-actions",
            label: "Cypress failed in GitHub Actions",
          },
          {
            href: "/guides/playwright-failed-github-actions",
            label: "Playwright failed in GitHub Actions",
          },
          {
            href: "/guides/vitest-failed-github-actions",
            label: "Vitest failed in GitHub Actions",
          },
          {
            href: "/guides/jest-failed-github-actions",
            label: "Jest failed in GitHub Actions",
          },
          {
            href: "/guides/npm-test-failed-github-actions",
            label: "npm test failed in GitHub Actions",
          },
          {
            href: "/guides/typescript-failed-github-actions",
            label: "TypeScript / tsc failed in GitHub Actions",
          },
          {
            href: "/guides/eslint-failed-github-actions",
            label: "ESLint failed in GitHub Actions",
          },
          {
            href: "/guides/pytest-failed-github-actions",
            label: "pytest failed in GitHub Actions",
          },
          {
            href: "/guides/explain-github-actions-failure",
            label: "Explain this GitHub Actions failure",
          },
        ],
      },
    ],
    faqs: [
      {
        question:
          "Why does GitHub say Process completed with exit code 1 after Gradle?",
        answer:
          "That line is a wrapper. Gradle exits 1 for every failure, so the phrase gradlew test Process completed with exit code 1 is not the diagnosis. BUILD FAILED is the summary under it. Scroll up to the first What went wrong, Execution failed for task ':test', FAILED, There were failing tests, Could not resolve, Received status code 401, No matching toolchains found, or Compilation failed — that is the cause.",
      },
      {
        question:
          "How do I tell a dependency, credentials, JDK toolchain, or cache failure from a real JUnit assertion?",
        answer:
          "If actions/setup-java is red, or the log prints Could not resolve, Could not find, Plugin [id: …] was not found, Received status code 401, Using insecure protocols with repositories, release version 21 not supported, Unsupported class file major version 65, No matching toolchains found, or toolchain download repositories have not been configured, ./gradlew test never graded your suite. invalid LOC header (bad signature) is a corrupt jar under ~/.gradle/caches. Compilation failed and cannot find symbol mean javac stopped the project. A real JUnit failure shows > Task :test, a class > method() FAILED line, org.opentest4j.AssertionFailedError or a TestNG expected [18] but found [20], There were failing tests, and a build/reports/tests/test path. Process 'Gradle Test Executor 1' finished with non-zero exit value 1 is a test JVM crash, not an assertion.",
      },
      {
        question: "Why do Gradle tests pass locally and fail in GitHub Actions?",
        answer:
          "The laptop often has a newer JDK, a warm ~/.gradle/caches, and a ~/.gradle/gradle.properties whose repository password the runner does not have. ubuntu-latest uses the setup-java version, refuses an HTTP repository unless it opts in (Using insecure protocols with repositories, without explicit opt-in, is unsupported), and does not download a toolchain unless settings configure a repository. A languageVersion of 21 on a workflow that pins Java 17 fails with No matching toolchains found before any test. Fork pull requests also drop secrets, so a private repository returns 401 only on those builds. A cached jar with an invalid LOC header fails on the runner and not on the laptop.",
      },
      {
        question:
          "What does Execution failed for task ':test' mean compared with Could not resolve?",
        answer:
          "Could not resolve all files for configuration, Could not find, and Plugin [id: …] was not found mean Gradle stopped during the download. No test method ran, so there is no FAILED test line and no build/reports/tests/test report. Compilation failed is the same split one step later: javac failed, the test task did not run. Execution failed for task ':test' together with There were failing tests, after a class > method() FAILED line, means the test JVM started and a test failed. The report path under build/reports/tests/test is where that result was written. Fix the first one you see. A later task marked SKIPPED is a consequence.",
      },
      {
        question:
          "Do I need to install a GitHub Action to explain Gradle test failed GitHub Actions?",
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
