# Frontend Test Plan

How we test the frontend. This is the **strategy** that every feature's `test-cases.md`
must follow. For the workflow (when tests are written), see
[`../../docs/development-process.md`](../../docs/development-process.md); for Jest setup, see
[`lib-setup/jest.md`](./lib-setup/jest.md).

> **Tooling status:** ⚠️ not yet installed in `frontend/package.json`. Target stack:
> **Jest** (+ ts/swc), **React Testing Library** (component tests), **Playwright** (E2E).
> Setting these up is a prerequisite task; until then, treat this as the target policy.

## Test types & scope

| Type | Tool | What it covers | Where |
|---|---|---|---|
| **Unit** | Jest | Pure logic: `utils/`, `services/`, feature `logics/`, hook logic | co-located `*.test.ts` or feature `test/` |
| **Component** | Jest + RTL | Render + interaction of components | co-located `Component.test.tsx` |
| **Integration** | Jest | Server Actions + `logics/` with mocked Prisma/IO | feature `test/` |
| **E2E** | Playwright | Critical user flows in a real browser | `frontend/e2e/` |

## Priorities (test pyramid)

1. **Business logic first** — `logics/`, `actions/`, `services/`, `utils/`, and custom hooks.
   This is where bugs hide and tests pay off most.
2. **Components** — test behavior (states, events, conditional rendering), not styling.
3. **A few E2E** — only the highest-value end-to-end flows; keep them lean.

Don't chase 100% coverage on presentational components; do cover logic thoroughly.

## Where test code lives

- Feature **business-logic** tests (`actions/`, `logics/`, feature `services`/`utils`) →
  the feature's `test/` folder.
- **Component** tests → co-located next to the component.
- **Global** `utils/` / `services/` / `hooks/` → co-located `*.test.ts`.
- **E2E** → `frontend/e2e/`.
- Naming: `<unit>.test.ts` / `<Component>.test.tsx`; E2E `<flow>.spec.ts`.

```
frontend/
├── e2e/
│   └── engineers.spec.ts                 # Playwright E2E
└── src/
    ├── features/engineers/
    │   ├── logics/getEngineers.ts
    │   ├── components/EngineerList.tsx
    │   ├── components/EngineerList.test.tsx   # co-located component test
    │   └── test/
    │       └── getEngineers.test.ts           # feature business-logic test
    ├── utils/formatDate.ts
    └── utils/formatDate.test.ts               # co-located global unit test
```

## Mocking strategy

- **Prisma** — mock the client (e.g. `jest-mock-extended`); never hit a real DB in unit/integration.
- **Server Actions / `next/navigation` / `next/headers`** — mock at the module boundary.
- **`fetch` / external APIs** — mock; no network in unit/integration.
- **Pino logger** (`@/lib/pino/logger`) — mock or silence in tests (note: logger warns in client
  components — see `conventions.md` §4).
- **Time/Date** — use Jest fake timers for deterministic results.

## Coverage expectations

- `logics/`, `actions/`, `services/`, `utils/`: **≥ 80%** lines/branches.
- Hooks with logic: cover the logic paths.
- Presentational-only components: not mandated.
- Coverage is a guardrail, not a target to game — prefer meaningful assertions.

## How to run

```bash
# once tooling is installed:
npm test              # run unit/component tests
npm run test:watch    # watch mode (TDD)
npm run test:coverage # coverage report
npm run e2e           # Playwright E2E
```

## TDD loop & mapping from `test-cases.md`

Implement **test-first** (red → green → refactor). Each entry in a feature's `test-cases.md`
(`TC-n`, Given/When/Then) becomes one or more `describe/it` blocks; reference the id so tests
trace back to requirements:

```ts
// TC-1 (Req 1.1): lists all engineers
it('TC-1: displays every engineer returned by the action', () => { /* ... */ });
```

## Definition of done (tests)

- Every acceptance criterion in `requirements.md` has a passing test (per `test-cases.md`).
- `npm test` and lint pass locally and in CI before a PR is mergeable.
