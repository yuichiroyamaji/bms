# Development Process — Spec-Driven + Test-Driven Development

This project combines **Spec-Driven Development (SDD)** and **Test-Driven Development (TDD)**:
every non-trivial change is specified *and* its tests are defined before it is built. The AI
agent (Claude Code) drafts each artifact; a human approves at defined gates before the next
phase begins. This keeps AI-written code aligned with intent and verifiable.

## TL;DR

```
Idea ─▶ requirements.md ─▶ design.md ─▶ test-cases.md ─▶ tasks.md ─▶ Issue + branch ─▶ code ─▶ merge
         └─ GATE 1 ──┘    └ GATE 2 ┘   └─ GATE 3 ──┘    └ GATE 4 ┘   (after all 4 approved)   TDD: red→green→refactor
```

- Spec + test cases live **in the repo**, next to the code they describe.
- The **GitHub Issue + implementation branch are created after Gate 4** (all 4 docs approved),
  then implementation happens on that branch.
- **Notion** tracks portfolio/roadmap only — not individual work items.

## The unit of work: 4 documents

Every feature/initiative is specified by these four files (the "spec set"):

| File | Phase | Purpose |
|---|---|---|
| `requirements.md` | 1 | WHAT & WHY — user stories + EARS acceptance criteria |
| `design.md` | 2 | HOW — architecture, data model, decisions |
| `test-cases.md` | 3 | PROOF — tests (Given/When/Then) mapped to each acceptance criterion |
| `tasks.md` | 4 | THE PLAN — ordered checklist → requirement & test ids |

## Roles

| Actor | Responsibility |
|---|---|
| **Human** | Approves each gate, makes product/architecture calls, reviews PRs |
| **AI (Claude Code)** | Drafts the spec set, implements tasks test-first, opens PRs, self-verifies |

The AI **stops at each gate** and waits for explicit approval. It does not skip ahead.

## The phases

### Phase 0 — Intake
A need/idea is captured (informally, or as a Feature Request / Bug). The "ask"; no solution yet.
The formal tracking **issue and implementation branch are created later, after Gate 4** — the
spec phase (Gates 1–4) happens in the repo first. (Bugs may still open a `bug` issue immediately.)

### Phase 1 — Requirements → `requirements.md`  ·  **GATE 1**
Defines **WHAT & WHY** with EARS acceptance criteria.
- Introduction, glossary
- User stories: _As a `<role>`, I want `<capability>`, so that `<benefit>`._
- Acceptance criteria: `WHEN <trigger>, THE <system> SHALL <response>` (+ `WHERE` / `IF`)

> **Gate 1:** human approves requirements before design.

### Phase 2 — Design → `design.md`  ·  **GATE 2**
Defines **HOW**: architecture, component breakdown, data model / contracts, sequence
diagrams, key decisions & rejected alternatives, mapped back to requirement ids.

> **Gate 2:** human approves design before test cases.

### Phase 3 — Test Cases → `test-cases.md`  ·  **GATE 3**
Defines the **tests that prove the requirements** — this is what makes the work test-driven.
- Each test case cites the acceptance criterion it verifies (`Req 1.1`)
- Covers happy path, edge cases, error handling
- Includes a coverage check: every acceptance criterion → at least one test case
- **Follows the domain's `test-plan.md`** (`frontend`/`backend`/`infra`) for tooling, test
  types, file locations, and coverage — each domain tests differently

> **Gate 3:** human approves the test cases before planning implementation.

### Phase 4 — Tasks → `tasks.md`  ·  **GATE 4**
Ordered, checkable implementation steps. Each task is small enough for one PR and cites the
requirement and test ids it covers (e.g. `(Req 1.2 · TC-2)`). Substantial tasks become GitHub
**sub-issues**.

> **Gate 4:** human approves the plan before implementation starts.

### Phase 5 — Implementation (TDD loop)
For each task, follow **red → green → refactor**:
1. **Red** — write the automated test(s) from `test-cases.md` first; watch them fail.
2. **Green** — write the minimum code to make them pass.
3. **Refactor** — clean up with tests staying green.

Work happens on the implementation branch created after Gate 4
(`feature/#<issue>_<slug>`, off `develop` — see GitHub mapping). PRs reference the spec and the
issue; tests live with the code (Jest units, Playwright E2E).

### Phase 6 — Verify & Done
PR reviewed and merged; issue auto-closes; `tasks.md` checkbox ticked; epic updates. Specs and
test cases are updated if implementation revealed changes (they are living docs).

## File naming & location (the rule)

Spec files are **always** named `requirements.md`, `design.md`, `test-cases.md`, `tasks.md`.

Location follows the repo's locality rule (see [`structure.md`](./structure.md)):

- **Feature-scoped** → `<domain>/src/features/<feature>/docs/`
  (e.g. `frontend/src/features/engineers/docs/`)
- **Cross-cutting initiative** (spans domains) → `docs/specs/<initiative>/`

Skeletons to copy from: [`specs/_template/`](./specs/_template/). Fastest path: run
`/new-feature <name>` in Claude Code.

## GitHub Issues mapping (hybrid model)

| Artifact | GitHub | Label |
|---|---|---|
| A feature/initiative | **Spec issue** (epic) — links the spec set, tracks gates as checkboxes | `spec` |
| A substantial task in `tasks.md` | **Task sub-issue** — cites requirement & test ids | `task` |
| A small task | Just a checkbox in `tasks.md` | — |
| A defect | **Bug** issue | `bug` |

Phase labels track progress: `phase:requirements`, `phase:design`, `phase:test-cases`,
`phase:tasks`, `phase:implementation`.

**Branch & PR conventions**
- Branch (created after Gate 4, off `develop`): `feature/#<issue>_<slug>` (or `fix/#<issue>_<slug>`).
  Quote it in shell commands because of the `#`, e.g. `git checkout -b "feature/#4_new-feature-commands" develop`.
- PR body links the spec and `Closes #<issue>`; closing sub-issues updates the epic checklist

## Authority — who owns what (avoids triple-tracking)

| Source of truth for… | Lives in |
|---|---|
| Requirements, design, test cases, task breakdown | **Repo spec set** (versioned with code) |
| Execution & code review | **GitHub Issues / PRs** |
| Portfolio status & roadmap | **Notion** (project level only) |

## Starting a new spec

1. `/new-feature <name>` (Claude Code) scaffolds the spec set from `docs/specs/_template/`,
   opens the Spec (epic) issue, and starts Phase 1.
2. Or manually: copy `docs/specs/_template/` to the location and open a Spec issue from the
   **📋 Spec / Epic** template.

## References
- Repo & docs layout: [`structure.md`](./structure.md)
- Branching: [`git-flow.md`](./git-flow.md)
- AI-coding setup record: [`ai-coding-transformation.md`](./ai-coding-transformation.md)
