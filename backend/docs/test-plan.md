# Backend Test Plan

How we test the backend (AWS Lambda functions). This is the **strategy** that backend
`test-cases.md` must follow. For the workflow, see
[`../../docs/development-process.md`](../../docs/development-process.md).

> **Status:** the backend is nascent (no `package.json` / handlers yet). This is the **starter
> policy** to apply as soon as Lambda code is added; refine it as the backend grows.

## Test types & scope

| Type | Tool | What it covers |
|---|---|---|
| **Unit** | Jest + ts-jest | Pure handler logic, event parsing, response shaping, error handling |
| **Integration** | Jest + `aws-sdk-client-mock` | Handler invoked with realistic event objects; AWS SDK calls mocked |
| **Contract** | Jest | Event/response payload schemas (input validation, output shape) |
| **Smoke** (optional) | script | Post-deploy checks against a real dev stack |

## Priorities

1. **Handler business logic** — extract logic from the AWS wiring so it can be unit-tested in isolation.
2. **Error & edge paths** — malformed events, missing fields, downstream failures, **idempotency**.
3. **Contracts** — the function's input/output shape (what callers/queues depend on).

## Where test code lives

- Tests are **co-located** with the function under `backend/lambda/<fn>/`, named `<unit>.test.ts`.
- Shared test helpers/fixtures → `backend/test/`.

```
backend/
├── lambda/
│   └── <fn>/
│       ├── handler.ts
│       ├── logic.ts
│       ├── logic.test.ts        # unit test of the pure logic
│       └── handler.test.ts      # integration test (event in, mocked AWS)
└── test/
    └── fixtures/                # shared events / helpers
```

## Conventions

- **No real AWS calls** in unit/integration — mock every SDK client with `aws-sdk-client-mock`.
- Keep handlers thin: `handler` parses/validates → delegates to a pure function → formats response.
  Test the pure function directly.
- Mock environment variables and time; no network.

## Coverage expectations

- Handler logic and error paths: aim **≥ 80%**.
- AWS wiring/glue: lighter — covered indirectly via integration tests.

## How to run

```bash
# once tooling is installed (Jest + ts-jest + aws-sdk-client-mock):
npm test
npm run test:watch
```

## How this differs from the other domains

Unlike the frontend (DOM/components) or infra (CloudFormation templates), backend testing is
**event-in → result-out**: given a Lambda event, assert the response and the (mocked)
side-effects. No browser, no real cloud resources.

## TDD & mapping from `test-cases.md`

Implement test-first (red → green → refactor). Each `TC-n` in a feature's `test-cases.md`
becomes a test that feeds an event and asserts the result/side-effects, referencing the id.
