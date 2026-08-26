# AI-Coding Transformation

Record of converting this repo into an **AI-coding** project (Claude Code), plus remaining work.

| | |
|---|---|
| **Started** | 2026-06-07 |
| **Primary AI tool** | Claude Code (other AI configs removed) |
| **Status** | Documentation layer complete; tooling/workflow items still open (Next Agenda) |

## Goal

Make the repo safe for an AI agent to **read and write**:

- Docs the agent can find and trust
- Predictable structure
- Guardrails so it can verify its own work (next)

## Documentation locality

Put a doc at the **narrowest scope that fully contains its subject**.

| Scope | Location |
|---|---|
| Project-wide | `docs/` |
| One domain | `<domain>/docs/` |
| One feature | `<domain>/src/features/<feature>/docs/` |

Each domain `CLAUDE.md` auto-loads in that subtree and `@import`s its docs. Layout: [`structure.md`](./structure.md).

## Phase 1 — documentation layer

| # | What |
|---|---|
| 1 | **Claude Code only.** Root + per-domain `CLAUDE.md` (`frontend/`, `infra/`, `backend/`). Root `@import`s project docs; domain files `@import` their docs and hold run commands. |
| 2 | Locality policy recorded in `docs/structure.md` + documentation map. |
| 3 | Scattered docs (`.kiro/`, `docs/`, `frontend/docs/`, `infra/docs/`) merged into one non-duplicated tree. |
| 4 | Specs sit next to the feature: `requirements.md` / `design.md` / `tasks.md` (e.g. `frontend/src/features/engineers/docs/`). |
| 5 | Canonical detailed docs kept (`frontend/docs/conventions.md`, `structure.md`); overlapping `.kiro/steering/*` summaries dropped after unique content was migrated. |
| 6 | Stale AppRunner docs quarantined in `infra/docs/_archive-apprunner/`. Current deploy doc: `infra/docs/deployment.md` (OpenNext). |
| 7 | Removed `.kiro/`, `docs/notes/cursor.md`, `.agents/`, `skills-lock.json`, empty placeholder folders. |

## Phase 2 — Spec-Driven Development

| Decision | Choice |
|---|---|
| Spec filenames | **Plural** (`requirements.md`, `design.md`, `tasks.md`) |
| GitHub | **Hybrid** — Spec epic + sub-issues for large tasks |
| Notion | **Portfolio / roadmap only** — GitHub owns work items |

| # | What |
|---|---|
| 1 | Process in [`development-process.md`](./development-process.md): phases, gates, naming, GitHub mapping, authority split. |
| 2 | Filenames standardized; engineers spec renamed; references updated. |
| 3 | Templates at `docs/specs/_template/`; cross-cutting home `docs/specs/`. |
| 4 | GitHub: Spec/Epic + Implementation Task issue templates, PR template (spec + issue + verification), `config.yml` discussions link fixed. |
| 5 | Root `CLAUDE.md` `@import`s the process and includes the SDD rule of engagement. |

## Phase 3 — Test-Driven Development

Spec set is now **four** files:

```
requirements.md → design.md → test-cases.md → tasks.md
```

| # | What |
|---|---|
| 1 | **`test-cases.md`** — Given/When/Then, mapped to acceptance criteria, coverage check. In `_template/` and the engineers spec. |
| 2 | Process: test cases = Phase 3 / Gate 3; tasks = Gate 4. Implement **red → green → refactor** from `test-cases.md`. |
| 3 | Propagated: spec/epic template, `tasks.md` cites test ids, `/new-feature` scaffolds 4 files, root + frontend `CLAUDE.md`, `structure.md`, `phase:test-cases` label. |
| 4 | **Per-domain `test-plan.md`** (`frontend/` Jest+RTL+Playwright, `backend/` Lambda event-in/result-out, `infra/` CDK assertions + snapshots). Every `test-cases.md` follows its domain plan. Frontend test tooling was noted as not yet installed despite `tech-stack.md`. |

## Next Agenda

Items are independent unless noted.

| ID | Item | Notes |
|---|---|---|
| **A** | AppRunner → OpenNext content cleanup | Update `README.md` (still AppRunner / Docker). Strip leftover AppRunner mentions. After that, delete `infra/docs/_archive-apprunner/`. |
| **B** | Repository hygiene | `.gitignore`: `infra/node_modules`, `infra/cdk.out/`, `infra/dist/`, `.claude/settings.local.json`. |
| **C** | Settings split | Shareable perms in committed `.claude/settings.json`; personal overrides in gitignored `.claude/settings.local.json`. |
| **D** | Self-verification hook | Post-edit: Biome (format + lint) + `tsc --noEmit` on changed frontend files. |
| **E** | Spec-driven workflow | **DONE** — process, labels (`spec`, `task`, `phase:*`), `/new-feature` from `_template/` (stops at Gate 1). |

## See also

- [`structure.md`](./structure.md) — policy & map
- [`product.md`](./product.md)
- [`tech-stack.md`](./tech-stack.md)
