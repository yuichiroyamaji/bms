# Getting Started

Steps to get this project deployable from a fresh clone.

## 1. AWS account per environment

**Required** — enforced by CDK, not just a documented convention. Edit `awsAccountId` in
`infra/config/app-config.ts`, for both `devConfig` and `prodConfig`:

```typescript
export const devConfig: AppConfig = {
  awsAccountId: '111111111111',
  // ...
};

export const prodConfig: AppConfig = {
  awsAccountId: '222222222222', // same as dev if you don't need account isolation
  // ...
};
```

`infra/bin/app.ts` pins each stack's `env.account` to this value. If you leave the placeholder
(`REPLACE_WITH_DEV_ACCOUNT_ID` / `REPLACE_WITH_PROD_ACCOUNT_ID`) in place, synth fails
immediately with a clear error — it won't silently fall back to whatever AWS credentials happen
to be active. If `dev` and `prod` should share one account, just set the same ID in both.

> This is currently unset for this repo — both `devConfig` and `prodConfig` still have the
> placeholder values. Nothing will deploy until real account IDs are filled in here.

## 2. Deploy the infra stack

The `environment` context is mandatory — there's no default. `npx cdk deploy` (or
`synth`/`diff`) without `-c environment=dev|prod` throws immediately.

**You still have to manually select the right AWS credentials yourself** — the account pinning
(below) doesn't do this for you, it only catches it if you get it wrong:

**bash / Git Bash / macOS / Linux:**
```bash
export AWS_PROFILE=bms   # or log in via SSO, etc. - whatever gives you credentials for the right account
aws sts get-caller-identity     # optional early sanity check
```

**PowerShell (Windows):**
```powershell
$env:AWS_PROFILE = "bms"   # note: quotes are required - $env:AWS_PROFILE = bms fails
aws sts get-caller-identity
```

Either way, this only lasts for the current terminal session/window — you'll need to set it
again in a new one.

```bash
cd infra
npm install
npx cdk bootstrap -c environment=dev   # first time only, per AWS account/region
npx cdk deploy InfraStack-dev -c environment=dev
```

`-c environment=` is required on `bootstrap` too, not just `deploy`/`synth`/`diff` — without an
explicit `aws://ACCOUNT/REGION` target, the CDK CLI still loads `app.js` to figure out which
environment to bootstrap, so it hits the same mandatory-environment check.

Because `env.account` is pinned from `app-config.ts` (not read from ambient credentials),
**CDK itself refuses to deploy if your active AWS credentials resolve to a different account
than the one configured for `dev`**. This changes what happens if you forget to set
`AWS_PROFILE` (or set the wrong one) from "silently deploys to whatever account happened to be
active" to "hard error, deploy refuses to proceed" — it's a guard against getting the profile
wrong, not a replacement for setting it.

This creates the GitHub OIDC provider + IAM role in that account (the trust policy is scoped to
the `githubRepo` constant in `infra/bin/app.ts` — currently `yuichiroyamaji/bms`; update it if
you ever fork/rename the repo). Copy the `GitHubActionsRoleArn` output, then in the GitHub repo
add these secrets (**Settings → Secrets and variables → Actions**):

- `AWS_ROLE_ARN` — the ARN from the output above
- `AWS_REGION` — the AWS region to deploy into (e.g. `ap-northeast-1`)

If `dev` and `prod` use **different** AWS accounts, repeat this step for prod
(`InfraStack-prod -c environment=prod`, using credentials for the prod account) and use
environment-specific secret names instead: `AWS_ROLE_ARN_DEV`/`AWS_ROLE_ARN_PROD`,
`AWS_REGION_DEV`/`AWS_REGION_PROD` — in which case `.github/workflows/deploy.yml`'s "Configure
AWS credentials" step also needs updating to pick between them based on the resolved
environment (it currently reads one fixed `AWS_ROLE_ARN`/`AWS_REGION` pair).

## 3. Deploy the app stack

```bash
cd infra
npm run deploy:dev     # cdk deploy AppStack-dev -c environment=dev
npm run deploy:prod    # cdk deploy AppStack-prod -c environment=prod
```

## 4. Push to `develop` and let GitHub Actions deploy

```bash
git checkout develop
git push origin develop
```

This triggers `.github/workflows/deploy.yml`, which assumes the IAM role via OIDC and deploys
`AppStack-dev` via CDK.

## Reference

- [docs/deployment-flows.md](./deployment-flows.md) — diagrams of the manual and CI deployment
  flows, including the account-pinning guard
- [infra/CLAUDE.md](../infra/CLAUDE.md) — CDK commands reference
- [infra/docs/deployment.md](../infra/docs/deployment.md) — complete OpenNext deployment guide
