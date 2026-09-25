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
