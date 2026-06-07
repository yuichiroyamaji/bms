---
description: Scaffold a new SDD spec (requirements/design/test-cases/tasks) and open its Spec/Epic issue, then start Phase 1
argument-hint: <feature-name> [frontend|backend|infra|cross-cutting]
allowed-tools: Bash(mkdir:*), Bash(cp:*), Bash(ls:*), Bash(gh issue create:*), Bash(gh label list:*), Read, Write, Edit
---

You are starting a new feature/initiative using this repo's **Spec-Driven Development** process.
Read @docs/development-process.md for the full process, gates, and conventions.

## Input

Feature / initiative: **$ARGUMENTS**

## Steps

1. **Resolve name & scope.**
   - Derive a kebab-case `<slug>` from the feature name.
   - Determine scope from the arguments, or ask the user if it's unclear. Map scope → spec path:
     - `frontend` feature → `frontend/src/features/<slug>/docs/`
     - `backend` feature → `backend/src/features/<slug>/docs/`
     - `infra` initiative → `infra/docs/specs/<slug>/`
     - `cross-cutting` (spans domains) → `docs/specs/<slug>/`
   - **Confirm the final spec path with the user before creating anything.**

2. **Scaffold from the template.** Once confirmed:
   - If any target file already exists, STOP and warn — do not overwrite.
   - Otherwise:
     ```
     mkdir -p <spec-path>
     cp docs/specs/_template/*.md <spec-path>/
     ```
     This copies the full spec set: `requirements.md`, `design.md`, `test-cases.md`, `tasks.md`.

3. **Open the Spec / Epic issue.**
   - Run `gh label list` to confirm labels exist (`spec`, `phase:requirements`).
   - Create the issue:
     ```
     gh issue create --title "📋 <Feature name>" --label "spec,phase:requirements" \
       --body "<body>"
     ```
   - The `<body>` must include: the spec location (`<spec-path>`), a one-paragraph summary,
     and the phase-gate checklist:
     ```
     - [ ] Gate 1 — Requirements approved (requirements.md)
     - [ ] Gate 2 — Design approved (design.md)
     - [ ] Gate 3 — Test cases approved (test-cases.md)
     - [ ] Gate 4 — Tasks approved (tasks.md)
     - [ ] Implementation complete
     ```
   - Report the created issue number and URL.

4. **Begin Phase 1 — Requirements.** Draft `<spec-path>/requirements.md`:
   - Fill Introduction, Glossary, user stories, and EARS-style acceptance criteria
     (`WHEN <trigger>, THE <system> SHALL <response>`).
   - Ask the user targeted questions for anything ambiguous; do not invent requirements.

5. **STOP at Gate 1.** Present the drafted requirements and ask for approval.

## Rules

- **Do not** proceed to `design.md`, `tasks.md`, or any implementation until the user approves
  the requirements at Gate 1.
- **Do not** write feature/application code in this command — it only sets up the spec and the
  requirements draft.
- The spec docs in the repo are the source of truth; the GitHub issue tracks gates and links the spec.
