# Creating a New Feature — workflow

The quick start for building a feature in this project. This summarizes the end-to-end flow;
the full reference is [`development-process.md`](./development-process.md).

```
/new-feature ─▶ interview ─▶ 4 docs (gates 1–4) ─▶ issue + branch ─▶ implement (TDD) ─▶ PR ─▶ develop
```

## Steps

1. **Run the command.** In Claude Code, type:
   ```
   /new-feature <feature-name> [frontend|backend|infra|cross-cutting]
   ```

2. **Answer the interview.** The command asks detailed questions and keeps asking until every
   answer is concrete — **no vague factors**. Don't expect it to assume; it will confirm defaults.

3. **Approve the 4 documents, one gate at a time.** Claude summarizes your answers into each doc
   and stops for your approval before moving on:
   | Doc | Gate | Notes |
   |---|---|---|
   | `requirements.md` | Gate 1 | user stories + EARS acceptance criteria |
   | `design.md` | Gate 2 | includes a **File & Folder Plan** per [`../frontend/docs/conventions.md`](../frontend/docs/conventions.md) |
   | `test-cases.md` | Gate 3 | follows the domain's `test-plan.md` |
   | `tasks.md` | Gate 4 | checklist citing `Req · TC` ids |

   The docs are written into the feature's `docs/` folder (e.g.
   `frontend/src/features/<slug>/docs/`).

4. **Issue + branch (after Gate 4).** Once all four docs are approved, Claude:
   - creates the GitHub **issue** for the feature, then
   - creates and switches to the implementation branch off `develop`:
     `feature/#<issue>_<slug>` (e.g. `feature/#4_new-feature-commands`).

5. **Implement test-first.** Work through `tasks.md` using **red → green → refactor** per the
   domain's `test-plan.md`. Tests live with the code.

6. **Land it.** Commit, push, and open a **PR into `develop`** (referencing the issue); merge
   after review. Per project rule, commits/pushes/PRs happen **only when you ask**.

## Gates = your control points
Claude never skips ahead. At each gate you review and approve before the next phase, so the
spec — and the AI-written code that follows it — stays aligned with your intent.

## See also
- Full process & rules: [`development-process.md`](./development-process.md)
- Branching: [`git-flow.md`](./git-flow.md)
- Conventions (naming, file placement): [`../frontend/docs/conventions.md`](../frontend/docs/conventions.md)
- Testing strategy per domain: `<domain>/docs/test-plan.md`
- The command itself: `.claude/commands/new-feature.md`
