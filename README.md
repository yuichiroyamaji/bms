# BMS — Bar Management System

A full-stack admin dashboard built with **Next.js 15** and deployed serverlessly on AWS via
**OpenNext** (CloudFront + Lambda + S3). Monorepo with a frontend app, serverless backend, and
infrastructure as code.

## Repository structure

```
/
├── frontend/   # Next.js 15 app (React 19, TypeScript, TailAdmin)
├── backend/    # AWS Lambda functions
├── infra/      # AWS CDK infrastructure (OpenNext)
└── docs/       # Project documentation
```

More detail: [`docs/structure.md`](./docs/structure.md).

## Tech stack (summary)

- **Frontend:** Next.js 15 (App Router, RSC), React 19, TypeScript, Tailwind CSS v4, TailAdmin
- **Backend:** AWS Lambda
- **Infra:** AWS CDK 2.x → OpenNext (CloudFront + Lambda + S3); Cognito (planned)
- **Tooling:** Biome (lint/format), Jest, Playwright (planned), Prisma

Full stack and the hosting-choice rationale: [`docs/tech-stack.md`](./docs/tech-stack.md).

## Prerequisites

- Node.js 20+ and npm
- AWS CLI (for deployment) and the GitHub CLI `gh` (for the issue/PR workflow)

## Getting started

```bash
cd frontend
npm install            # add --legacy-peer-deps if you hit peer-dependency errors
npm run dev            # http://localhost:3000
```

## Common commands

```bash
# Frontend (run in frontend/)
npm run dev            # dev server
npm run build          # production build
npm run lint           # Biome / ESLint

# Infrastructure (run in infra/)
npm run build          # compile CDK
npm test               # CDK assertion/snapshot tests
npm run diff:dev       # preview changes
npm run deploy:dev     # deploy dev
```

## Development workflow

This project uses **GitFlow** + **Spec-Driven & Test-Driven Development**. Features are
specified before they're built and implemented test-first.

- Start a feature: run **`/new-feature <name>`** in Claude Code — it interviews you and produces
  `requirements.md → design.md → test-cases.md → tasks.md`, then creates the issue and branch.
- Branching: features off `develop`; `develop` → `release` → `main`. See [`docs/git-flow.md`](./docs/git-flow.md).
- Full process: [`docs/development-process.md`](./docs/development-process.md)
  (quick start: [`docs/new-feature-workflow.md`](./docs/new-feature-workflow.md)).

## Testing

Each domain has its own strategy — see the per-domain test plans:
[`frontend/docs/test-plan.md`](./frontend/docs/test-plan.md),
[`backend/docs/test-plan.md`](./backend/docs/test-plan.md),
[`infra/docs/test-plan.md`](./infra/docs/test-plan.md).

> Note: frontend test tooling (Jest/RTL/Playwright) is not yet installed — see the plan.

## Deployment

Deployed on **OpenNext** via AWS CDK. Quick deploy:

```bash
cd infra
npm install
npx cdk bootstrap      # first time only
npm run deploy:dev
```

Full guide: [`infra/docs/deployment.md`](./infra/docs/deployment.md).
CI/CD: GitHub Actions deploys `develop` → dev and `main` → production.

## Documentation

- Product overview: [`docs/product.md`](./docs/product.md)
- Tech stack: [`docs/tech-stack.md`](./docs/tech-stack.md)
- Repo & docs layout: [`docs/structure.md`](./docs/structure.md)
- Development process: [`docs/development-process.md`](./docs/development-process.md)
- Backlog / TODO: [`docs/todo.md`](./docs/todo.md)
- AI assistance: `CLAUDE.md` files (root + each domain) provide context for Claude Code.

## License

See [`frontend/LICENSE`](./frontend/LICENSE).
