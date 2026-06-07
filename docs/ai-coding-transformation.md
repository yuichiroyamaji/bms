# AI-Coding Transformation

A record of converting this repository into an **AI-coding-based project** optimized for
Claude Code, plus the roadmap for remaining work.

- **Started:** 2026-06-07
- **Primary AI tool:** Claude Code (standardized; other AI tool configs removed)
- **Status:** documentation layer complete; tooling/workflow items pending (see Next Agenda)

## Goal

Make the repository easy for an AI agent to **read and write** safely:
documentation an agent can find and trust, a predictable structure, and (next) guardrails
so the agent can verify its own work.

## Guiding principle — documentation locality

Docs live at the **narrowest scope that fully contains their subject**:

| Scope | Location |
|---|---|
| Project-wide | `docs/` |
| One domain | `<domain>/docs/` |
| One feature | `<domain>/src/features/<feature>/docs/` |

Each domain has a `CLAUDE.md` that Claude Code auto-loads in that subtree and `@import`s the
relevant docs. Full layout: see [`structure.md`](./structure.md).

## What was done (Phase 1 — documentation layer)

1. **Adopted Claude Code as the single AI tool.** Created `CLAUDE.md` at the root and one per
   domain (`frontend/`, `infra/`, `backend/`). Root `CLAUDE.md` `@import`s the project docs;
   domain files `@import` their own docs and hold run commands.
2. **Established the locality policy** (above) and recorded it in `docs/structure.md` together
   with a documentation map.
3. **Consolidated scattered docs** that were split across `.kiro/`, `docs/`, `frontend/docs/`,
   and `infra/docs/` into a single, non-duplicated tree.
4. **Standardized spec naming and placement.** Feature specs moved next to their feature as
   `requirements.md` / `design.md` / `tasks.md`
   (e.g. `frontend/src/features/engineers/docs/`).
5. **Promoted canonical docs, removed redundant summaries.** The detailed source docs became
   canonical (e.g. `frontend/docs/conventions.md`, `structure.md`); overlapping
   `.kiro/steering/*` summaries were dropped after migrating their unique content.
6. **Quarantined stale AppRunner docs** into `infra/docs/_archive-apprunner/` (with a README)
   so they no longer mislead an agent. Current deployment doc is `infra/docs/deployment.md`
   (OpenNext).
7. **Removed non-Claude-Code tooling:** `.kiro/`, `docs/notes/cursor.md`, `.agents/` and
   `skills-lock.json` (vercel-labs `skills` CLI), and empty placeholder folders.

## What was done (Phase 2 — Spec-Driven Development)

Decisions: **plural** spec filenames; **hybrid** GitHub model (Spec epic + sub-issues for
substantial tasks); **Notion = portfolio/roadmap only** (GitHub Issues own work items).

1. **Defined the process** in [`development-process.md`](./development-process.md): 5 phases,
   3 approval gates, file naming rule, GitHub mapping, and authority split.
2. **Standardized spec filenames to plural** (`requirements.md` / `design.md` / `tasks.md`);
   renamed the engineers spec and updated all references.
3. **Added spec templates** under `docs/specs/_template/` and a `docs/specs/` home for
   cross-cutting (multi-domain) initiatives.
4. **Added GitHub SDD artifacts:** `📋 Spec / Epic` and `✅ Implementation Task` issue
   templates, a PR template (links spec + issue + verification checklist), and fixed the
   `config.yml` discussions link (was pointing at the wrong repo).
5. **Wired it in:** root `CLAUDE.md` now `@import`s the process and includes an SDD rule of
   engagement.

## Next Agenda

Tracked roadmap. Items are independent unless noted.

### A. AppRunner → OpenNext content cleanup  _(owner: project; in progress separately)_
- Update `README.md` (still describes AppRunner / Docker).
- Remove or rewrite remaining AppRunner mentions once the OpenNext migration is complete.
- After migration, the `infra/docs/_archive-apprunner/` folder can be deleted.

### B. Repository hygiene  _(quick, low risk)_
- `.gitignore` gaps: add `infra/node_modules`, `infra/cdk.out/`, `infra/dist/`.
- Gitignore `.claude/settings.local.json` (it is personal/local by Claude Code convention).

### C. Settings split — shared vs personal  _(was suggestion #3)_
- Move shareable permissions into a committed `.claude/settings.json` so they apply on every
  clone; keep personal overrides in the gitignored `.claude/settings.local.json`.

### D. Self-verification hook  _(was suggestion #4)_
- Add a Claude Code post-edit hook that runs Biome (format + lint) and `tsc --noEmit` on
  changed frontend files, so the agent catches its own type/lint errors automatically.

### E. Spec-driven workflow  _(was suggestion #5 — DONE)_
- ✅ Process defined (`development-process.md`), plural naming ruled, spec templates added,
  GitHub Spec/Task/PR templates added.
- ✅ GitHub labels created (`spec`, `task`, `phase:requirements|design|tasks|implementation`).
- ✅ `/new-feature` slash command (`.claude/commands/new-feature.md`) scaffolds the spec from
  `docs/specs/_template/`, opens the Spec (epic) issue, and starts Phase 1 — stopping at Gate 1.

## References

- Documentation policy & map: [`structure.md`](./structure.md)
- Product overview: [`product.md`](./product.md)
- Tech stack: [`tech-stack.md`](./tech-stack.md)
