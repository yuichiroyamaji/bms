# Development Process — Spec-Driven Development (SDD)

This project uses **Spec-Driven Development**: every non-trivial change is specified before
it is built. The AI agent (Claude Code) drafts each artifact; a human approves at defined
gates before the next phase begins. This keeps AI-written code aligned with intent.

## TL;DR

```
Idea ─▶ GitHub Issue ─▶ requirements.md ─▶ design.md ─▶ tasks.md ─▶ code (PRs) ─▶ merge
                         └─ GATE 1 ─┘      └─ GATE 2 ┘  └─ GATE 3 ┘   each task = branch + PR
```

- Spec lives **in the repo**, next to the code it describes.
- **GitHub Issues** track execution (epic + sub-issues).
- **Notion** tracks portfolio/roadmap only — not individual work items.

## Roles

| Actor | Responsibility |
|---|---|
| **Human** | Approves each gate, makes product/architecture calls, reviews PRs |
| **AI (Claude Code)** | Drafts requirements/design/tasks, implements tasks, opens PRs, self-verifies |

The AI **stops at each gate** and waits for explicit approval. It does not skip ahead to code.

## The 5 phases

### Phase 0 — Intake
A need is captured as a **GitHub Issue** (Feature Request or Bug). This is the "ask"; it does
not yet contain a solution.

### Phase 1 — Requirements → `requirements.md`  ·  **GATE 1**
Defines **WHAT & WHY**. Uses EARS-style acceptance criteria.
- Introduction, glossary
- User stories: _As a `<role>`, I want `<capability>`, so that `<benefit>`._
- Acceptance criteria: `WHEN <trigger>, THE <system> SHALL <response>` (and `WHERE` / `IF` forms)

> **Gate 1:** human approves the requirements before any design work.

### Phase 2 — Design → `design.md`  ·  **GATE 2**
Defines **HOW**.
- Architecture & component breakdown
- Data model / types, API or Server Action contracts
- Sequence/flow diagrams where useful
- Key decisions and trade-offs (and rejected alternatives)
- Maps each design element back to requirement ids

> **Gate 2:** human approves the design before planning tasks.

### Phase 3 — Tasks → `tasks.md`  ·  **GATE 3**
Defines **THE PLAN**: an ordered, checkable list of implementation steps.
- Each task is small enough to land in one PR
- Each task cites the requirement id(s) it satisfies, e.g. `(Req 1.2, 3.4)`
- Substantial tasks become GitHub **sub-issues** (see GitHub mapping below)

> **Gate 3:** human approves the plan before implementation starts.

### Phase 4 — Implementation
- One task → one branch → one PR (GitFlow, see [`git-flow.md`](./git-flow.md))
- PR references the spec and `Closes #<issue>`
- The AI self-verifies: lint + typecheck (+ tests where they exist) must pass

### Phase 5 — Verify & Done
- PR reviewed and merged; issue auto-closes
- `tasks.md` checkbox ticked; epic issue updates
- Specs are updated if implementation revealed changes (specs are living docs)

## File naming & location (the rule)

Spec files are **always** named:

| File | Phase | Purpose |
|---|---|---|
| `requirements.md` | 1 | WHAT & WHY (user stories + EARS criteria) |
| `design.md` | 2 | HOW (architecture, data, decisions) |
| `tasks.md` | 3 | THE PLAN (checklist → requirement ids) |

Location follows the repo's locality rule (see [`structure.md`](./structure.md)):

- **Feature-scoped** → `<domain>/src/features/<feature>/docs/`
  (e.g. `frontend/src/features/engineers/docs/`)
- **Cross-cutting initiative** (spans domains) → `docs/specs/<initiative>/`

Skeletons to copy from: [`specs/_template/`](./specs/_template/).

## GitHub Issues mapping (hybrid model)

| Artifact | GitHub | Label |
|---|---|---|
| A feature/initiative | **Spec issue** (epic) — links the 3 spec docs, tracks phase gates as checkboxes | `spec` |
| A substantial task in `tasks.md` | **Task sub-issue** of the epic — cites requirement ids | `task` |
| A small task | Just a checkbox in `tasks.md` (no separate issue) | — |
| A defect | **Bug** issue | `bug` |

Phase labels track where a spec is: `phase:requirements`, `phase:design`, `phase:tasks`,
`phase:implementation`.

**Branch & PR conventions**
- Branch: `feature/<issue#>-<short-slug>` (or `fix/<issue#>-…`), per GitFlow
- PR title references the work; PR body links the spec and `Closes #<issue>`
- Closing task sub-issues auto-updates the epic's checklist

## Authority — who owns what (avoids triple-tracking)

| Source of truth for… | Lives in |
|---|---|
| Requirements, design, task breakdown | **Repo spec docs** (versioned with code) |
| Execution & code review | **GitHub Issues / PRs** |
| Portfolio status & roadmap | **Notion** (project level only) |

Do not duplicate individual work items into Notion; link the GitHub epic instead.

## Starting a new spec

1. `/new-feature <name>` (Claude Code command) scaffolds the spec folder from
   `docs/specs/_template/` and opens the Spec (epic) issue. _(see Next Agenda E)_
2. Or manually: copy `docs/specs/_template/` to the feature/initiative location and open a
   Spec issue from the **📋 Spec / Epic** template.

## References
- Repo & docs layout: [`structure.md`](./structure.md)
- Branching: [`git-flow.md`](./git-flow.md)
- AI-coding setup record: [`ai-coding-transformation.md`](./ai-coding-transformation.md)
