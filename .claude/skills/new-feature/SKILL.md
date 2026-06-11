---
name: new-feature
description: Deeply interview the user and author the full SDD/TDD spec set (requirements/design/test-cases/tasks) for a new feature — no vague factors; then create the GitHub issue + implementation branch and switch to it
allowed-tools: Bash(mkdir:*), Bash(cp:*), Bash(ls:*), Bash(gh issue create:*), Bash(gh label list:*), Bash(git checkout:*), Read, Write, Edit
---

Drive a new feature from idea to a complete, **unambiguous** spec set, following this repo's
Spec-Driven + Test-Driven process. Interview the user thoroughly, then write the four documents.
**Leave no vague factors.**

## Input

Feature / initiative — plus optional scope `frontend | backend | infra | cross-cutting` — as
provided when this skill was invoked (e.g. `/new-feature <name> <scope>`): **$ARGUMENTS**

If no name was given, ask the user for the feature name and scope before scaffolding anything.

## Operating principles (apply throughout)

1. **No vague factors.** Never write placeholder, hedged, or "TBD" content. Every statement must
   be concrete and testable. If an answer is vague, ask follow-ups until it is specific:
   - "show the data nicely" → which fields, order, component, sortable?
   - "handle errors" → which errors, what the user sees, what is logged.
   - "should be fast" → a number (e.g. "list renders < 200ms for 500 rows").
2. **Ask, don't assume.** Never invent requirements, data shapes, or APIs. If you must propose a
   default, say so explicitly and ask the user to confirm.
3. **One phase at a time; stop at every gate.** Draft a doc, present it, get explicit approval,
   then continue.

## Before you start — read these

- @docs/development-process.md — phases, gates
- @frontend/docs/conventions.md — coding & **file/folder naming rules** (critical for design.md)
- `docs/structure.md` + the relevant `<domain>/docs/structure.md` — where code lives
- The relevant domain `test-plan.md` (`frontend`/`backend`/`infra`) — how tests are written

## Step 0 — Scope & scaffold

No GitHub issue is created yet — the issue and branch are created **after Gate 4** (see below).

1. **Resolve name & scope.** Derive a kebab-case `<slug>`. Map scope → spec path (ask if unclear):
   - frontend feature → `frontend/src/features/<slug>/docs/`
   - backend feature → `backend/<...>/docs/` (confirm exact path)
   - infra initiative → `infra/docs/specs/<slug>/`
   - cross-cutting → `docs/specs/<slug>/`
   - **Confirm the path before creating anything.**
2. **Scaffold.** If any target file exists, STOP and warn. Otherwise:
   ```
   mkdir -p <spec-path>
   cp docs/specs/_template/*.md <spec-path>/   # requirements, design, test-cases, tasks
   ```
   Fill each doc completely from the interview — no leftover `<...>`.

---

## Phase 1 — Requirements → `requirements.md`  ·  GATE 1

Ask until ALL of these are concrete:
- **Users/context:** what problem, for whom, which roles? What's out of scope?
- **Behavior:** entry points (route/button/nav); for each capability the trigger, inputs, exact output.
- **States:** loading, empty, populated, error, no-permission, partial data.
- **Data shown:** exact fields, labels, formatting, order, pagination, sort, filter.
- **Inputs:** each field — type, required/optional, validation rules, error messages.
- **Permissions:** who can see/do what.
- **Non-functional:** performance targets (numbers), data volume, i18n, accessibility, responsive.
- **Edge cases/rules:** business rules, limits, concurrency, idempotency, every failure path.

Write requirements.md (Introduction, Glossary, numbered Requirements with User Story + **EARS**
criteria `WHEN <trigger>, THE <system> SHALL <response>`, explicit **Out of scope**).

**Anti-vagueness check:** every criterion observable & testable; no "etc./appropriately/nicely/fast"
without specifics. Present for approval. Do not proceed until approved.

---

## Phase 2 — Design → `design.md`  ·  GATE 2

Requires Gate 1 approved. Ask until concrete:
- **Architecture:** route(s) & Next.js files; server vs client components; **Server Actions vs API
  Routes** (default Server Actions — confirm); data flow.
- **Data:** Prisma models/tables (new vs existing); each `type`/`interface` and where it lives;
  Server Action / DAO signatures (name, params, return shape).
- **Cross-cutting:** state/contexts/hooks (Container/Presentational), error handling & Pino logging,
  external integrations, env vars, new dependencies.

### REQUIRED subsection: File & Folder Plan (per conventions.md)

Re-read `conventions.md` (naming) + the feature structure in `structure.md`, then list **every file
to create or modify** with its exact path and the convention it follows:

| Path | Type | Naming rule | Purpose |
|---|---|---|---|
| `src/features/<slug>/components/<Slug>List.tsx` | Component | PascalCase `.tsx` | … |
| `src/features/<slug>/components/children/<Slug>ListTable.tsx` | Child component | Parent + description | … |
| `src/features/<slug>/hooks/use<Slug>List.ts` | Hook | camelCase `use*` | … |
| `src/features/<slug>/actions/<Slug>ListActions.ts` | Server Action | Component + `Actions` | … |
| `src/features/<slug>/logics/<name>.ts` | Server logic | camelCase | … |
| `src/features/<slug>/services/<name>Service.ts` | Service | camelCase + `Service` | … |
| `src/features/<slug>/utils/<name>.ts` | Util | camelCase | … |
| `src/features/<slug>/types/<name>.ts` | Types | `type`/`interface` | … |
| `src/features/<slug>/data/get<Name>.ts` | DAO | camelCase `get*` | … |
| `src/app/(admin)/<route>/page.tsx` | Route | Next.js standard | … |
| `src/features/<slug>/test/<unit>.test.ts` | Test | per `test-plan.md` | … |

Folder rules: feature subfolders `components/{children,common,ui}`, `hooks`, `actions`, `contexts`,
`types`, `services`, `utils`, `logics`, `test`; folder names lowercase-hyphen. **Confirm the plan
matches conventions.md exactly.**

Also include **Decisions & trade-offs**, a **Requirements traceability** table (design → req id),
and risks/open questions. Present for approval.

---

## Phase 3 — Test cases → `test-cases.md`  ·  GATE 3

Requires Gate 2 approved. Follow the domain's `test-plan.md` (tooling, test types, **where test
files live**).
- For **every** acceptance criterion, write Given/When/Then cases (happy, edge, error), citing the
  req id. State each case's **type** (unit/component/integration/E2E) and its **test file path**
  (from the File & Folder Plan).
- Include the coverage table: every criterion → at least one `TC-n`.

Anti-vagueness check: concrete inputs and concrete expected results. Present for approval.

---

## Phase 4 — Tasks → `tasks.md`  ·  GATE 4

Requires Gate 3 approved.
- Ordered, checkable steps; each small enough for one PR; each cites `(Req x.y · TC-n)` and the
  exact files from the File & Folder Plan.
- Implementation is **test-first** (red → green → refactor) per the domain `test-plan.md`.
- Default to checkboxes in tasks.md; flag any task warranting its own GitHub issue (issue-
  granularity policy is currently undecided — keep as checkbox unless the user says otherwise).

Present for approval.

---

## After Gate 4 — create issue & branch, then implement

Once **all four documents are approved**, do this **first**, before writing any code:

1. **Create the GitHub issue** (the single tracking issue for this feature). Run `gh label list`
   first to confirm labels, then:
   ```
   gh issue create --title "<Feature name>" --label "enhancement,phase:implementation" \
     --body "Implements the approved spec at <spec-path>. See tasks.md. <one-line summary>"
   ```
   Capture the issue number `<N>` and report the URL.
2. **Create and switch to the implementation branch** off `develop`. Quote the name (it contains `#`):
   ```
   git checkout -b "feature/#<N>_<slug>" develop
   ```
   e.g. `feature/#4_new-feature-commands`. Confirm you are now on the new branch.
3. **Implement test-first** (red → green → refactor) per `tasks.md` and the domain `test-plan.md`.
   Commit / push / open a PR only when the user explicitly asks.

## Rules

- Fill every document completely — no leftover template placeholders / `<...>`.
- Keep filenames exactly: `requirements.md`, `design.md`, `test-cases.md`, `tasks.md`.
- Do **not** write feature/application code in this command — it produces the spec set only.
- Do **not** commit, push, or open/merge PRs unless the user explicitly asks.
