# Test Cases

> Phase 3 of [Spec-Driven Development](../../development-process.md). Defines the **tests that
> prove the requirements** — written before implementation (TDD: red → green → refactor).
> Requires **Gate 2** (design) approved. Get **Gate 3** approval before planning tasks.

Each test case maps to acceptance criteria in `requirements.md`. Cover the happy path,
edge cases, and error handling. During implementation these become the actual automated tests
(Jest for units, Playwright for E2E) — write them first and watch them fail before coding.

## Unit / component tests

### TC-1 — `<short title>`  ·  (Req 1.1)
- **Given** `<precondition>`
- **When** `<action>`
- **Then** `<expected result>`

### TC-2 — `<short title>`  ·  (Req 1.2, 2.1)
- **Given** …
- **When** …
- **Then** …

## Integration / E2E tests (if any)

### TC-3 — `<short title>`  ·  (Req 3.1)
- **Given / When / Then** …

## Coverage check

Every acceptance criterion must be covered by at least one test case.

| Requirement | Test case(s) |
|---|---|
| Req 1.1 | TC-1 |
| Req 1.2 | TC-2 |
| Req 2.1 | TC-2 |
| Req 3.1 | TC-3 |
