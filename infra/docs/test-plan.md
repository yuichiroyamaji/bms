# Infrastructure Test Plan

How we test the AWS CDK infrastructure. This is the **strategy** that infra `test-cases.md`
must follow. For the workflow, see
[`../../docs/development-process.md`](../../docs/development-process.md).

> **Status:** Jest + ts-jest are configured (`npm test`), `aws-cdk-lib/assertions` is available,
> and `infra/test/infra.test.ts` exists as a (currently disabled) example.

## Test types & scope

| Type | Tool | What it covers |
|---|---|---|
| **Fine-grained assertions** | `aws-cdk-lib/assertions` `Template` | Critical resources exist with the right properties |
| **Snapshot** | Jest snapshot of `Template.toJSON()` | Catches **unintended** changes to the synthesized CloudFormation |
| **Config/unit** | Jest | Logic in `config/app-config.ts` (env selection, sizing) as plain functions |
| **Synth check** | `cdk synth` | The app must synthesize without error (also run in CI) |

## Priorities

1. **Security-sensitive resources** — IAM policies (least privilege), S3 public-access blocks,
   CloudFront, OIDC role for GitHub Actions.
2. **Env-specific config** — dev vs prod differences (sizing, removal policies, alarm email).
3. **Core OpenNext resources** — CloudFront distribution, Lambda (server/image/revalidation)
   memory & timeout, S3 buckets, SQS queue, CloudWatch alarms.

## Where test code lives

- All tests live under `infra/test/`, **one file per stack/construct**, named
  `<stack-or-construct>.test.ts`. Jest writes snapshots to `infra/test/__snapshots__/`.

```
infra/
├── lib/
│   ├── stacks/app-stack.ts
│   └── constructs/<construct>.ts
└── test/
    ├── app-stack.test.ts        # assertions + snapshot for the stack
    ├── <construct>.test.ts
    └── __snapshots__/           # auto-generated Jest snapshots (committed)
```

## Conventions

- Build the stack in a test `App`, then `Template.fromStack(stack)` and assert with
  `hasResourceProperties` / `resourceCountIs`.
- Keep one **snapshot** per stack; update it deliberately (review the diff) when changes are intended.
- No AWS calls — synthesis is fully local.

## Coverage expectations

- Every stack has at least: assertions for its security-sensitive + core resources, and a snapshot.
- `config/app-config.ts` logic: unit-tested for each environment.

## How to run

```bash
npm test               # Jest assertion + snapshot tests
npm test -- -u         # update snapshots (only when changes are intentional)
npm run synth:dev      # must succeed
npm run diff:dev       # review changes before deploy / in CI
```

## How this differs from the other domains

Infra tests assert the **generated CloudFormation template**, not runtime behavior — there is no
app to run and no real cloud resources are created. The "unit under test" is a stack/construct.

## TDD & mapping from `test-cases.md`

Write/adjust the assertion **before** changing a construct (red → green → refactor). Each `TC-n`
in an initiative's `test-cases.md` maps to an assertion or snapshot expectation, referencing the id.
