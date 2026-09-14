import type { Autopsy, PatchDraft, RootCause } from "./types";

type Signal = {
  id: string;
  weight: number;
  test: (log: string) => boolean;
  cause: (log: string) => RootCause;
  patch?: (log: string) => PatchDraft | undefined;
};

function excerpt(log: string, needle: RegExp | string, window = 180): string {
  const text = log.replace(/\r\n/g, "\n");
  if (typeof needle === "string") {
    const idx = text.toLowerCase().indexOf(needle.toLowerCase());
    if (idx === -1) return needle;
    const start = Math.max(0, idx - 40);
    return text.slice(start, start + window).replace(/\s+/g, " ").trim();
  }
  const match = text.match(needle);
  if (!match || match.index === undefined) return needle.source;
  const start = Math.max(0, match.index - 40);
  return text.slice(start, start + window).replace(/\s+/g, " ").trim();
}

function detectCiSystem(log: string): string {
  if (/##\[error]|actions\/checkout|github\.com\/actions/i.test(log)) {
    return "GitHub Actions";
  }
  if (/gitlab-ci|section_start:|ERROR: Job failed/i.test(log)) {
    return "GitLab CI";
  }
  if (/circleci|CIRCLE_JOB/i.test(log)) return "CircleCI";
  if (/azure pipelines|##\[section]/i.test(log)) return "Azure Pipelines";
  if (/BUILDKITE/i.test(log)) return "Buildkite";
  if (/jenkins|hudson\./i.test(log)) return "Jenkins";
  return "Unknown CI";
}

const SIGNALS: Signal[] = [
  {
    id: "lockfile",
    weight: 95,
    test: (log) =>
      /npm ci` can only install|package-lock.json are in sync|Missing: .+ from lock file|lock file is not up to date|ERR_PNPM_OUTDATED_LOCKFILE|yarn.lock is outdated/i.test(
        log,
      ),
    cause: (log) => ({
      rank: 1,
      title: "Lockfile is out of sync with package.json",
      summary:
        "The installer refused to proceed because declared dependencies do not match the committed lockfile. This is the most common GitHub Actions `npm ci` failure after a local `npm install` that was never committed.",
      confidence: 93,
      evidence: [
        excerpt(log, /Missing: .+ from lock file|out of sync|outdated lockfile/i),
        "Installers used in CI (`npm ci`, `pnpm i --frozen-lockfile`, `yarn --frozen-lockfile`) fail closed when the lockfile drifts.",
      ],
      fixSteps: [
        "Reproduce locally with the same command CI uses (`npm ci`, not `npm install`).",
        "Run `npm install` (or the package-manager equivalent) so the lockfile updates.",
        "Commit `package.json` and the lockfile together, then re-run the workflow.",
        "If this keeps happening, add a required check that diffs the lockfile on PRs.",
      ],
    }),
    patch: () => ({
      filename: ".github/workflows/ci.yml",
      language: "yaml",
      notes:
        "Pin the install step to a frozen lockfile so the failure stays explicit, and document the local command.",
      content: `      - name: Install
        run: npm ci
      - name: Test
        run: npm test
`,
    }),
  },
  {
    id: "assertion",
    weight: 88,
    test: (log) =>
      /AssertionError|expected .+ to (be|equal|strictEqual)|Expected:|Received:|FAIL\s+\S+\.(test|spec)\./i.test(
        log,
      ),
    cause: (log) => ({
      rank: 1,
      title: "A unit or integration assertion failed",
      summary:
        "The pipeline reached the test runner; a specific expectation did not match. Treat this as product/code drift, not infrastructure, unless the assertion is flaky or environment-dependent.",
      confidence: 90,
      evidence: [
        excerpt(log, /AssertionError|expected .+ to |FAIL\s+\S+\.(test|spec)/i),
        excerpt(log, /Expected:|Received:|expected \d+ to be \d+/i),
      ],
      fixSteps: [
        "Open the failing file and line cited in the stack (search for `FAIL` / `❯`).",
        "Decide whether the test or the implementation is the source of truth.",
        "Re-run only that file locally with the same Node and timezone CI uses.",
        "If the value is money, dates, or locale-sensitive, pin fixtures instead of live clocks.",
      ],
    }),
    patch: (log) => {
      const file =
        log.match(/FAIL\s+([^\s]+\.(test|spec)\.[a-z]+)/i)?.[1] ??
        "src/example.test.ts";
      return {
        filename: file,
        language: "ts",
        notes:
          "Draft only — confirm whether the expected value or the production code should change.",
        content: `// Failing expectation spotted in CI.
// Align the fixture with the current pricing/tax rules, then re-run:
//   npx vitest run ${file}
`,
      };
    },
  },
  {
    id: "typescript",
    weight: 86,
    test: (log) => /error TS\d{3,5}|Type error:|tsc\s+--/i.test(log),
    cause: (log) => ({
      rank: 1,
      title: "TypeScript compiler rejected the build",
      summary:
        "A type error failed `tsc` or `next build`. These are deterministic: the same commit will fail again until the type or tsconfig changes.",
      confidence: 91,
      evidence: [excerpt(log, /error TS\d+|Type error:/i)],
      fixSteps: [
        "Copy the `error TSxxxx` code and file:line from the log.",
        "Fix the type at the source rather than adding `any` unless you are unblocking a generated file.",
        "Run `npx tsc --noEmit` locally with the same `tsconfig` as CI.",
      ],
    }),
  },
  {
    id: "env",
    weight: 84,
    test: (log) =>
      /Environment variable .+ (is )?not (set|defined)|Missing required (env|secret)|process\.env\.\w+ is undefined|Error: secret .+ not found/i.test(
        log,
      ),
    cause: (log) => ({
      rank: 1,
      title: "Required secret or environment variable is missing",
      summary:
        "A job step expected a repository/environment secret that is unset in this context (fork PRs, new environment, or renamed key).",
      confidence: 88,
      evidence: [
        excerpt(
          log,
          /Environment variable|secret .+ not found|Missing required/i,
        ),
      ],
      fixSteps: [
        "Compare the names in code (`process.env.X`) with GitHub Actions `env:` / repository secrets.",
        "Remember fork PRs do not receive secrets unless you use `pull_request_target` carefully (prefer OIDC or labeled workflows).",
        "Add the missing secret in the correct environment (production vs preview).",
      ],
    }),
  },
  {
    id: "module",
    weight: 80,
    test: (log) =>
      /Cannot find module|Module not found:|ERR_MODULE_NOT_FOUND|Cannot find package/i.test(
        log,
      ),
    cause: (log) => ({
      rank: 1,
      title: "A required module or package was not installed",
      summary:
        "Node could not resolve an import. Typical causes: dependency listed in `devDependencies` but CI runs `NODE_ENV=production`, a path alias mismatch, or an install step that was skipped.",
      confidence: 86,
      evidence: [excerpt(log, /Cannot find module|ERR_MODULE_NOT_FOUND|Module not found/i)],
      fixSteps: [
        "Confirm the package is in `dependencies` if production install is used.",
        "Ensure the install step ran before build/test and used the same package manager as the lockfile.",
        "If this is a local path (`@/…`), verify `tsconfig` paths and bundler aliases.",
      ],
    }),
  },
  {
    id: "timeout",
    weight: 78,
    test: (log) =>
      /The operation was canceled|timeout|ETIMEDOUT|exceeded the maximum execution time|job timed out/i.test(
        log,
      ),
    cause: (log) => ({
      rank: 1,
      title: "The job hit a timeout or was canceled",
      summary:
        "The runner stopped the step before it finished. That usually means a hung test, a waiting network call, or a workflow `timeout-minutes` that is too aggressive.",
      confidence: 82,
      evidence: [excerpt(log, /timeout|canceled|ETIMEDOUT|execution time/i)],
      fixSteps: [
        "Find the last successful step — the hang is usually the next command.",
        "Add `timeout-minutes` on the suspect step and a tighter test timeout to fail faster.",
        "Check for missing CI env that causes a client to retry an API forever.",
      ],
    }),
  },
  {
    id: "oom",
    weight: 77,
    test: (log) =>
      /JavaScript heap out of memory|ENOSPC|Killed|exit code 137|OOM/i.test(log),
    cause: (log) => ({
      rank: 1,
      title: "The runner ran out of memory or disk",
      summary:
        "Exit 137 / heap OOM / ENOSPC means the machine, not the test assertion, killed the process. GitHub-hosted runners are easy to exhaust with `next build` + Jest in parallel.",
      confidence: 85,
      evidence: [excerpt(log, /heap out of memory|ENOSPC|exit code 137|Killed/i)],
      fixSteps: [
        "Reduce Jest/Vitest workers (`--maxWorkers=2`) and Next.js parallel builds.",
        "Raise `NODE_OPTIONS=--max-old-space-size=4096` only after you cut parallelism.",
        "Clear caches (`actions/cache`) if disk filled (`ENOSPC`).",
      ],
    }),
  },
  {
    id: "permission",
    weight: 74,
    test: (log) => /EACCES|permission denied|Operation not permitted/i.test(log),
    cause: (log) => ({
      rank: 1,
      title: "The job lacked filesystem or token permission",
      summary:
        "A write, chmod, or GitHub API call was rejected. On Actions this is often a missing `permissions:` block or a checkout that did not persist credentials.",
      confidence: 80,
      evidence: [excerpt(log, /EACCES|permission denied|not permitted/i)],
      fixSteps: [
        "Add an explicit `permissions:` map on the job (contents, pull-requests, id-token).",
        "Avoid writing to system paths; use the workspace directory.",
        "If publishing, confirm `GITHUB_TOKEN` vs a PAT with the right scopes.",
      ],
    }),
  },
  {
    id: "checkout",
    weight: 72,
    test: (log) =>
      /actions\/checkout|local changes to the following files would be overwritten|could not read Username|Authentication failed/i.test(
        log,
      ),
    cause: (log) => ({
      rank: 1,
      title: "Checkout or git state is dirty / unauthenticated",
      summary:
        "The runner could not switch to the requested ref. Dirty workspace leftovers, missing credentials on a private submodule, or a force-checkout over a mutated lockfile are typical.",
      confidence: 79,
      evidence: [
        excerpt(
          log,
          /overwritten by checkout|could not read Username|Authentication failed|actions\/checkout/i,
        ),
      ],
      fixSteps: [
        "Do not mutate tracked files before a later `checkout` in the same job.",
        "For private submodules, pass a PAT or GitHub App token to `actions/checkout`.",
        "Split generate-lockfile steps into a separate job that commits via PR.",
      ],
    }),
  },
  {
    id: "lint",
    weight: 68,
    test: (log) => /eslint|prettier.*error|Failed to load config|✖ \d+ problems/i.test(log),
    cause: (log) => ({
      rank: 1,
      title: "Lint or format check failed the gate",
      summary:
        "ESLint/Prettier exited non-zero. These are usually one-line fixes but will keep the build red until the same rules run locally.",
      confidence: 76,
      evidence: [excerpt(log, /eslint|✖ \d+ problems|prettier/i)],
      fixSteps: [
        "Run the exact CI script (`npm run lint`) rather than a looser editor integration.",
        "If the config failed to load, a plugin is missing from the lockfile.",
        "Apply `--fix` only when the rule is auto-fixable; commit the result.",
      ],
    }),
  },
];

function fallbackCause(log: string): RootCause {
  const exit = log.match(/exit code (\d+)/i)?.[1];
  const lastError =
    log
      .split("\n")
      .reverse()
      .find((line) => /error|fail|fatal/i.test(line)) ??
    "No explicit error line — inspect the last command before the runner stopped.";

  return {
    rank: 1,
    title: exit
      ? `Command failed with exit code ${exit}`
      : "The pipeline exited with an unclassified error",
    summary:
      "CauseCI could not match a high-confidence pattern. The ranked items below are conservative reads of the tail of the log — use them as a starting point, not a verdict.",
    confidence: 42,
    evidence: [lastError.replace(/\s+/g, " ").trim().slice(0, 240)],
    fixSteps: [
      "Scroll to the first `##[error]` / `FAIL` / `Error:` — that is usually the real root, not the final `Process completed` line.",
      "Re-run the same command locally with CI env (`CI=true`).",
      "If the log is truncated, re-export the full job log and paste again.",
    ],
  };
}

export function stubAutopsy(log: string): Autopsy {
  const ciSystem = detectCiSystem(log);
  const hits = SIGNALS.filter((signal) => signal.test(log)).sort(
    (a, b) => b.weight - a.weight,
  );

  const used = hits.slice(0, 4);
  const causes: RootCause[] =
    used.length > 0
      ? used.map((signal, index) => ({
          ...signal.cause(log),
          rank: index + 1,
          confidence: Math.max(35, signal.weight - index * 6),
        }))
      : [fallbackCause(log)];

  if (used.length === 1) {
    causes.push({
      rank: 2,
      title: "Secondary: confirm the failing step is the first red one",
      summary:
        "Later steps often echo the first failure (`Process completed with exit code 1`). Rank later errors lower unless they introduce a new stack.",
      confidence: 55,
      evidence: [
        excerpt(log, /Process completed with exit code|##\[error]/i),
      ],
      fixSteps: [
        "Collapse successful steps and start reading at the first non-zero exit.",
        "Avoid fixing a downstream symptom (failed upload, failed notify) before the compile/test step.",
      ],
    });
    causes.push({
      rank: 3,
      title: "Secondary: environment drift vs local",
      summary:
        "Even a clear error can be Node, OS, or dependency-cache drift between your laptop and the runner.",
      confidence: 48,
      evidence: [
        "CI logs rarely print `node -v` unless you add it — mismatches are cheap to rule out.",
      ],
      fixSteps: [
        "Print `node -v`, package-manager version, and `pwd` at the top of the job.",
        "Pin the runner (`ubuntu-24.04`) and Node version in the workflow.",
      ],
    });
  }

  const patch = used.find((signal) => signal.patch)?.patch?.(log);

  return {
    headline: causes[0]?.title ?? "CI failure autopsy",
    ciSystem,
    summary:
      used.length > 0
        ? `Detected ${used.length} high-signal pattern${used.length === 1 ? "" : "s"} in a ${ciSystem} log. Ranked causes below are ordered by how specifically the log matched.`
        : `No high-signal pattern matched this ${ciSystem} log. A conservative fallback autopsy is provided so you still have a starting point.`,
    rootCauses: causes,
    patchDraft: patch,
    generatedBy: "stub",
  };
}
