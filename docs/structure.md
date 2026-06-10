# Repository Structure (monorepo)

This repo is a monorepo with three deployable domains plus shared documentation.

```
/
├── frontend/   # Next.js application (see frontend/docs/)
├── backend/    # AWS Lambda functions (see backend/docs/)
├── infra/      # AWS CDK infrastructure as code (see infra/docs/)
└── docs/       # Project-wide documentation
```

## Documentation policy

Docs live at the **narrowest scope that fully contains their subject**:

| Scope | Location | Examples |
|---|---|---|
| Project-wide | `docs/` | product, tech stack, this file, git flow |
| One domain | `<domain>/docs/` | `frontend/docs/conventions.md`, `infra/docs/deployment.md` |
| One feature | `<domain>/src/features/<feature>/docs/` | `frontend/src/features/engineers/docs/` |

Each domain has its own `CLAUDE.md` that Claude Code auto-loads when working in that
subtree; it imports the relevant docs. Feature specs use the filenames
`requirements.md`, `design.md`, `test-cases.md`, `tasks.md`.

## Documentation map

```
CLAUDE.md                          # root entry → @imports project docs, points to domain CLAUDE.md
docs/                              # PROJECT-WIDE
├── product.md                     # what the product is
├── tech-stack.md                  # stack, hosting rationale, dev tools, install notes
├── structure.md                   # this file: repo layout + doc policy + this map
├── new-feature-workflow.md        # quick start: how to create a feature (/new-feature → docs → issue → PR)
├── development-process.md         # Spec-Driven + Test-Driven workflow (phases, gates, GitHub mapping)
├── git-flow.md                    # branching strategy
├── todo.md                        # project backlog
├── reference/                     # supporting / non-canonical docs (look-up material, not active rules)
│   └── ai-coding-transformation.md  # record of the AI-coding conversion + next agenda
├── specs/                         # cross-cutting (multi-domain) specs
│   ├── _template/                 # requirements/design/test-cases/tasks skeletons to copy
│   └── <initiative>/{requirements,design,test-cases,tasks}.md
└── assets/                        # diagrams & images (requirements.drawio, images/)

frontend/
├── CLAUDE.md                      # commands + key conventions (auto-loaded in this subtree)
├── docs/
│   ├── conventions.md             # coding conventions (canonical)
│   ├── structure.md               # frontend src/ layout
│   ├── test-plan.md               # frontend testing strategy (Jest/RTL/Playwright)
│   └── reference/                 # supporting / non-canonical docs (look-up material, not active rules)
│       ├── nextjs/{app-router,server-actions}.md
│       ├── lib-setup/{biome,jest,pino,prisma}.md
│       └── ui-template/tailadmin-readme.md
└── src/features/<feature>/docs/   # FEATURE scope
    └── requirements.md  design.md  test-cases.md  tasks.md

infra/
├── CLAUDE.md                      # cdk / OpenNext commands + layout
└── docs/
    ├── deployment.md              # current OpenNext deploy guide
    ├── test-plan.md               # infra testing strategy (CDK assertions + snapshots)
    ├── aws-infrastructure-diagram.md
    ├── assets/aws_diagram.drawio
    ├── reference/                 # supporting / non-canonical docs (look-up material, not active rules)
    │   └── migration-plan.md      # AppRunner → OpenNext history
    └── _archive-apprunner/        # retired AppRunner docs (obsolete; do not follow)

backend/
├── CLAUDE.md
└── docs/
    └── test-plan.md               # backend testing strategy (Lambda; starter policy)
```

## Domain structure details

- **Frontend** — see [`../frontend/docs/structure.md`](../frontend/docs/structure.md)
- **Infrastructure** — see [`../infra/docs/deployment.md`](../infra/docs/deployment.md)

## Naming conventions
Frontend file/folder naming conventions are documented in
[`../frontend/docs/conventions.md`](../frontend/docs/conventions.md).
