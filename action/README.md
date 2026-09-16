# CauseCI failure teaser Action

Post a **truncated teaser** and a link back to [CauseCI](https://causeci.vercel.app) when a GitHub Actions job fails.

This directory is the Action source. **It is not published to the GitHub Marketplace.** Install it from this repository path. No CauseCI API key, no outbound email, and no secrets belong in this folder.

The Action does **not** upload your log to CauseCI. It writes a job summary (and an optional pull-request comment) that tells a human to paste the log themselves. The top cause on the site is free.

## Install from this repo

```yaml
# .github/workflows/ci.yml
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
          log-path: ci.log
```

Pin a commit SHA instead of `@main` if you want a frozen install:

```yaml
uses: ipinney/causeci/action@<commit-sha>
```

Private callers need access to this repository. Public callers can use the path as-is.

A copy-paste workflow also lives in [`example-workflow.yml`](./example-workflow.yml). Do not put that file under `.github/workflows/` unless you intend this repo to run it.

## Inputs

| Name | Default | Purpose |
| --- | --- | --- |
| `github-token` | `${{ github.token }}` | Optional PR comments. Job summaries work without a comment. |
| `app-url` | `https://causeci.vercel.app` | Origin used in the paste link. |
| `log-path` | _(empty)_ | Optional file to excerpt. Prefer `tee` on the failing step. |
| `comment-on-pr` | `true` | Set `false` to write only `$GITHUB_STEP_SUMMARY`. |
| `max-excerpt-chars` | `600` | Tail of the redacted log, not the full file. |

## What gets posted

- A short explanation plus `[Paste the log](https://causeci.vercel.app/analyze)`.
- Repo / workflow / run metadata when GitHub provides it.
- An optional `<details>` excerpt from `log-path`, after a conservative secret redaction (PATs, `sk_live_`, `AKIA…`, PEM blocks, `Bearer`, `token=` / `password=` assignments).

The Action upserts a single comment marked `<!-- causeci-teaser -->` so retries do not spam the pull request.

## Local check

```bash
node action/post-teaser.js --print
INPUT_LOG_PATH=/tmp/fail.log node action/post-teaser.js --print
```

`npm test` covers excerpt + redaction helpers.

## Out of scope

- Marketplace listing
- Uploading logs to CauseCI
- Email or other outbound messaging
- Paid analytics
