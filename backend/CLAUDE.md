# Backend (AWS Lambda)

Serverless backend functions. Lambda handlers live under `backend/lambda/`.

This domain is in early stages. Add backend-specific documentation to `backend/docs/`
as the codebase grows (handler conventions, shared utilities, local invocation, etc.).

## Documentation

- Testing strategy: `docs/test-plan.md` (Lambda event-in/result-out; `test-cases.md` follows it)

## Conventions

- TypeScript, matching the repo-wide conventions where applicable.
- See `../docs/tech-stack.md` for the overall stack and `../infra/docs/deployment.md`
  for how Lambdas are deployed.
