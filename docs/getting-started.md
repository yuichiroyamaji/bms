# Getting Started

Steps to get this project deployable from a fresh clone.

## 1. Project identity — one file to edit

Edit `infra/config/app-config.ts`. This is the **only file** you need to change to point this
template at your own AWS accounts and GitHub repo:

```typescript
export const githubRepo = 'my-org/my-repo';
export const resourcePrefix = 'myapp';

export const devConfig: AppConfig = {
  awsAccountId: '111111111111',
  alarmEmail: 'me@example.com',
  // ...
};

export const prodConfig: AppConfig = {
  awsAccountId: '222222222222', // same as dev if you don't need account isolation
  // ...
};
```

- **`awsAccountId`** (in both `devConfig` and `prodConfig`) — **Required**, enforced by CDK, not
  just a documented convention. `infra/bin/app.ts` pins each stack's `env.account` to this value
  and throws immediately if it's still a `REPLACE_...` placeholder — it won't silently fall back
  to whatever AWS credentials happen to be active. If `dev` and `prod` should share one account,
  set the same ID in both.
- **`githubRepo`** — your GitHub repo in `owner/repo` format. Scopes the OIDC trust policy for
  the CI/CD deploy role (`infra/lib/constructs/github-oidc-role.ts`) — GitHub Actions in a
  differently named repo can't assume the role until this matches.
- **`resourcePrefix`** — **Required if more than one project from this template shares an AWS
  account.** Prefixes every physical name that is scoped to the *account* rather than the stack:
  the three CloudFormation stack names (`<prefix>-infra-<env>`, `<prefix>-app-<env>`,
  `<prefix>-monitoring-<env>`) and the CI/CD IAM role (`<prefix>-github-oidc-deploy-role`). Leave
  two deployments on the same prefix and the second doesn't just fail — it **updates the first
  one's stacks**, because CDK matches deployments by stack name. Related account-global resources
  that this prefix does *not* cover, but that also can't be duplicated: the GitHub OIDC provider
  (imported, not created) and CloudFormation export names (this template deliberately declares
  none).
- **`alarmEmail`** (optional) — email that receives CloudWatch alarm notifications. Setting it
  also deploys `MonitoringStack-<env>` alongside `AppStack-<env>` (see comment on the field).
- `domainNames`, `certificateArn`, `awsRegion`, `environmentVariables`, `serverMemoryMb`,
  `imageMemoryMb` — optional; see the inline comments on `AppConfig` in the file.

Everything past this point is manual setup that lives *outside* the repo — AWS account access
and GitHub repo settings — so it can't be captured in a config file, but the steps below are
exhaustive.

## 2. Build the OpenNext frontend bundle

`AppStack` (`infra/lib/constructs/open-next-site.ts`) reads Lambda code and static assets
straight out of `frontend/.open-next` — unlike setups built on `cdk-nextjs-standalone`, this
construct is hand-rolled and does **not** build the frontend for you during `cdk synth`/`deploy`.
Every CDK command loads `app.js`, which synthesizes all stacks, so even a command that only
touches `InfraStack` (like `bootstrap`) fails immediately with `ENOENT`/`Cannot find asset` if
`frontend/.open-next` doesn't exist yet. Build it first:

```bash
cd frontend
npm install
npm run build:open-next                # open-next build → creates frontend/.open-next
```

> Re-run this whenever frontend code changes and you're about to run any `cdk`
> command — `npm run deploy:dev`/`deploy:prod` do **not** rebuild it for you (they only run
> `npm run build` for the infra TypeScript, not the frontend). Skipping this step is the most
> common cause of a stale or missing deploy.

## 3. Compile the infra TypeScript

CDK does not run TypeScript directly — `cdk.json` invokes `node dist/bin/app.js`. Compile the
infra package so `dist/` exists before any `bootstrap`/`deploy`/`synth`/`diff`:

```bash
cd infra
npm install
npm run build                          # tsc → compiles infra to dist/
```

## 4. Bootstrap your AWS environment

The `environment` context is mandatory — there's no default. `npx cdk deploy` (or
`synth`/`diff`/`bootstrap`) without `-c environment=dev|prod` throws immediately, because CDK
still has to load `app.js` to figure out which environment's account to target.

**You still have to manually select the right AWS credentials yourself** — the account pinning
from step 1 doesn't do this for you, it only catches it if you get it wrong:

**bash / Git Bash / macOS / Linux:**
```bash
export AWS_PROFILE=bms   # or log in via SSO, etc. - whatever gives you credentials for the right account
aws sts get-caller-identity     # optional early sanity check
```

**PowerShell (Windows):**
```powershell
$env:AWS_PROFILE = "opennext-serverless-user"   # note: quotes are required - $env:AWS_PROFILE = bms fails
aws sts get-caller-identity
```

Either way, this only lasts for the current terminal session/window — you'll need to set it
again in a new one.

```bash
cd infra
npx cdk bootstrap -c environment=dev   # first time only, per AWS account/region
```

Because `env.account` is pinned from `app-config.ts` (not read from ambient credentials), **CDK
itself refuses to deploy if your active AWS credentials resolve to a different account** than
the one configured for `dev` — a guard against getting the profile wrong, not a replacement for
setting it.

If `dev` and `prod` use **different** AWS accounts, repeat the bootstrap for prod too
(`npx cdk bootstrap -c environment=prod`, using credentials for the prod account).

## 5. Deploy `InfraStack` and wire up GitHub secrets

**This step is required before your first push to `develop`, not optional.**
`.github/workflows/deploy.yml` triggers on every push to `develop` unconditionally — it is not
something you opt into by choosing a "CI" workflow. So even if you only plan to deploy manually
(step 6), the moment you `git push origin develop` for any normal reason, GitHub Actions will
try to assume `AWS_ROLE_ARN` and deploy. If that role doesn't exist yet, the run fails with
"could not assume role" — a visible red X on your push, even though you never asked for a CI
deploy.

**i. Deploy `InfraStack`** to create the GitHub OIDC provider + IAM role that GitHub Actions will
assume (uses the credentials/bootstrap from step 4):

```bash
cd infra
npx cdk deploy InfraStack-dev -c environment=dev
```

This trusts the `githubRepo` you set in step 1. Copy the `GitHubActionsRoleArn` output. If `dev`
and `prod` use different AWS accounts, repeat this for prod (`InfraStack-prod`) too.

**ii. Add GitHub repo secrets** (**Settings → Secrets and variables → Actions**):

- `AWS_ROLE_ARN` — the ARN from the `GitHubActionsRoleArn` output above
- `AWS_REGION` — the AWS region to deploy into (e.g. `ap-northeast-1`)

> `.github/workflows/deploy.yml` currently reads one fixed `AWS_ROLE_ARN`/`AWS_REGION` pair for
> both `dev` and `prod`. That's fine as long as `dev` and `prod` resolve to the same
> `awsAccountId` in `app-config.ts`. If you later split them into separate AWS accounts, a single
> role ARN can only satisfy one of them — you'd need `AWS_ROLE_ARN_DEV`/`AWS_ROLE_ARN_PROD` (and
> matching region secrets), with the "Configure AWS credentials" step in the workflow updated to
> pick between them based on the resolved environment.

> **Don't want CI at all?** The only way out of this requirement is to remove or comment out the
> `push: branches: - develop` trigger in `.github/workflows/deploy.yml` (and skip
> `workflow_dispatch` too if you never want to trigger it manually from the Actions tab). Do that
> instead of skipping this step if you intend to deploy purely manually forever.

## 6. Deploy the app stack

With steps 2, 3, and 5 done, you can deploy `AppStack` either way — pick whichever fits the
moment, both are always available, they aren't mutually exclusive:

**Manually, whenever you want** (remember to re-run step 2 first if frontend code changed):

```bash
cd infra
npm run deploy:dev     # cdk deploy AppStack-dev MonitoringStack-dev -c environment=dev
npm run deploy:prod    # cdk deploy AppStack-prod MonitoringStack-prod -c environment=prod
```

(`MonitoringStack-<env>` only deploys if `alarmEmail` is set for that environment in step 1.)

**Automatically, by pushing to `develop`:**

```bash
git checkout develop
git push origin develop
```

This triggers `.github/workflows/deploy.yml`, which builds the OpenNext bundle, assumes the IAM
role via OIDC, and deploys `AppStack-dev`/`MonitoringStack-dev` via CDK. The `main` branch
auto-deploy trigger is commented out by default — uncomment it in the workflow if you want pushes
to `main` to auto-deploy prod; otherwise use the manual `workflow_dispatch` input with
`environment: prod`.

## Reference

- [docs/deployment-flows.md](./deployment-flows.md) — diagrams of the manual and CI deployment
  flows, including the account-pinning guard and the dev/prod secrets gap
- [infra/CLAUDE.md](../infra/CLAUDE.md) — CDK commands reference
- [infra/docs/deployment.md](../infra/docs/deployment.md) — complete OpenNext deployment guide
