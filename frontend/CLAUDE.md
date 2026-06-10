# Frontend (Next.js 15 + React 19 + TypeScript)

Admin dashboard UI based on TailAdmin. App Router + React Server Components.

## Documentation

@docs/conventions.md
@docs/structure.md

Deeper references:
- Next.js App Router: `docs/reference/nextjs/app-router.md`
- Server Actions: `docs/reference/nextjs/server-actions.md`
- Library setup: `docs/reference/lib-setup/` (biome, jest, pino, prisma)
- UI template: `docs/reference/ui-template/tailadmin-readme.md`
- Testing strategy: `docs/test-plan.md` (how we test the frontend; `test-cases.md` follows it)

Feature specs live next to the feature, e.g. `src/features/engineers/docs/` →
`requirements.md`, `design.md`, `test-cases.md`, `tasks.md`.

## Commands (run from `frontend/`)

```bash
npm run dev      # dev server at http://localhost:3000
npm run build    # production build
npm start        # serve production build
npm run lint     # Biome / ESLint
```

## Key conventions (see docs/conventions.md for full detail)

- Components: `function` declarations with `export default` at declaration time.
- Arrow functions for functions inside components and for `services/` & `utils/` helpers.
- `interface` for component Props, `type` for everything else.
- Prefer **Server Actions** over API Routes.
- Server-side logging via Pino (`@/lib/pino/logger`); client-side uses `console.log`.
- File/folder naming: see the table in `docs/conventions.md` §9.
- Feature code is co-located under `src/features/<feature>/` (components, hooks, actions,
  types, services, utils, logics, test).
