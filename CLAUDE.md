# BMS — Bar Management System

Full-stack admin dashboard. Monorepo with three deployable domains: `frontend/` (Next.js 15),
`backend/` (AWS Lambda), `infra/` (AWS CDK → OpenNext on AWS).

## Project documentation

@docs/product.md
@docs/tech-stack.md
@docs/structure.md

- Git workflow: @docs/git-flow.md
- Project backlog / TODOs: @docs/todo.md
- AI-coding transformation record & roadmap: `docs/ai-coding-transformation.md`

## Domain docs (loaded automatically when you work in each subtree)

- Frontend → `frontend/CLAUDE.md` (conventions, structure, Next.js guides)
- Infrastructure → `infra/CLAUDE.md` (deployment, migration, troubleshooting)
- Backend → `backend/CLAUDE.md`

## Documentation policy (keep this true as the code evolves)

Docs live at the **narrowest scope that fully contains their subject**:
- Project-wide → `docs/`
- One domain → `<domain>/docs/`
- One feature → `<domain>/src/features/<feature>/docs/` (files: `requirement.md`, `design.md`, `task.md`)

When you change structure, conventions, or deployment, update the matching doc in the same change.

## Rules of engagement

- Hosting is **OpenNext (CloudFront + Lambda + S3)**, not AppRunner. Anything under
  `infra/docs/_archive-apprunner/` is obsolete — do not follow it.
- Run lint + typecheck (and tests where they exist) before considering a change done.
- Prefer Server Actions over API Routes on the frontend (see `frontend/docs/conventions.md`).
- Run commands from the relevant domain directory; see each domain's `CLAUDE.md`.
