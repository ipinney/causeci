export const SAMPLE_LOG = `Run npm ci
npm error code EUSAGE
npm error
npm error \`npm ci\` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with \`npm install\` before continuing.
npm error
npm error Missing: typescript@5.6.3 from lock file
npm error Missing: eslint@9.12.0 from lock file

Error: Process completed with exit code 1

Run npm test
> vitest run

 FAIL  src/billing.test.ts > Checkout > applies summer coupon
AssertionError: expected 20 to be 18
 ❯ src/billing.test.ts:42:22

    40|   expect(total).toBe(18)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { expected: 18, actual: 20 }

Test Files  1 failed | 12 passed (13)
Tests  1 failed | 84 passed (85)

##[error]Process completed with exit code 1.

0s
Run actions/checkout@v4
/usr/bin/git checkout --progress --force refs/remotes/origin/main
error: Your local changes to the following files would be overwritten by checkout:
	package-lock.json
Please commit your changes or stash them before you switch branches.
Aborting
##[error]The process 'git' failed with exit code 1
`;
