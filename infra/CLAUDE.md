# Infrastructure (AWS CDK → OpenNext)

Infrastructure as code for deploying the Next.js app to AWS via **OpenNext
(CloudFront + Lambda + S3)**. CDK 2.x, TypeScript.

## Documentation

@docs/deployment.md

- Migration history (AppRunner → OpenNext): `docs/migration-plan.md`
- AWS architecture diagram: `docs/aws-infrastructure-diagram.md`

> `docs/_archive-apprunner/` holds the retired AppRunner setup — obsolete, do not follow it.

## Layout

```
infra/
├── bin/               # CDK app entry point
├── config/            # app-config.ts (env, sizing, domain, alarm email)
├── lib/
│   ├── constructs/    # reusable CDK constructs
│   └── stacks/        # app-stack.ts, infra-stack.ts
└── test/              # infrastructure tests
```

## Commands (run from `infra/`)

```bash
npm install
npm run build          # compile TypeScript
npm run watch          # watch mode
npm test               # Jest tests

npx cdk bootstrap      # first time only
npx cdk diff  AppStack-dev  -c environment=dev    # preview changes
npx cdk synth AppStack-dev  -c environment=dev    # view CloudFormation
npm run deploy:dev     # deploy to dev
npm run deploy:prod    # deploy to prod
npm run destroy:dev    # tear down dev stack
```

## Notes

- Config is edited in `config/app-config.ts` (alarm email, env vars, Lambda memory, custom domain).
- CI/CD: `.github/workflows/deploy.yml` — `develop` → dev, `main` → prod (OIDC IAM role).
- Test the Next.js build locally (`cd frontend && npm run build && npm start`) before deploying.
