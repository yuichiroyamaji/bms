# Migration Plan: AppRunner → OpenNext

## Background

AWS announced that App Runner will stop accepting new customers effective April 30, 2026, and will not receive new features going forward. AWS recommends migrating to ECS Express Mode, but for this Next.js project, OpenNext is the better fit (see rationale in `docs/tech-stack.md`).

## Architecture Comparison

### Before (AppRunner)

```
Users → AppRunner (always-on container) → Next.js
           ↑
         ECR (Docker image)
```

| Resource | Role |
|---|---|
| ECR | Stores Docker image |
| AppRunner | Runs Next.js container (always-on) |
| CloudWatch Logs | App logs |
| CloudWatch Alarms | CPU, memory, 4xx monitoring |

### After (OpenNext)

```
Users → CloudFront → S3 (static assets: _next/static/*)
                   → Lambda (SSR / API routes)
                   → Lambda (image optimization: /_next/image)
                   → CloudFront Function (middleware)

Lambda (SSR) ↔ S3 (ISR cache)
             → SQS → Lambda (revalidation handler) → S3 (ISR cache)
```

| Resource | Role |
|---|---|
| S3 (assets) | Static files (`_next/static/`, public/) |
| S3 (cache) | ISR cache storage |
| CloudFront | CDN + routing to correct origin |
| CloudFront Function | Next.js middleware execution |
| Lambda (server) | SSR rendering + API routes |
| Lambda (image) | `next/image` optimization |
| Lambda (revalidation) | ISR on-demand revalidation handler |
| SQS | Revalidation queue |

## Key Differences

| | AppRunner | OpenNext |
|---|---|---|
| Docker / Dockerfile | Required | Not needed |
| ECR | Required | Not needed |
| Always-on cost | ~$3-5/month | Near-zero at low traffic |
| Cold starts | None | Lambda cold starts (~200-500ms) |
| CDN | None (direct URL) | CloudFront built-in |
| SSR | Yes (container) | Yes (Lambda) |
| ISR | Yes | Yes (S3 cache) |
| Image optimization | Yes (container) | Yes (dedicated Lambda) |
| Middleware | Yes | Yes (CloudFront Function) |

## CDK Changes Required

### Files to remove
- `infra/lib/constructs/apprunner-service.ts` — replaced by OpenNext construct
- `frontend/Dockerfile` — no longer needed

### Files to update
- `infra/lib/stacks/app-stack.ts` — swap `AppRunnerService` for `NextjsSite`
- `infra/config/app-config.ts` — remove `instanceConfig` (CPU/memory), add `environment` vars
- `infra/lib/constructs/monitoring.ts` — update metric namespaces (Lambda/CloudFront instead of AppRunner)
- `infra/package.json` — add `cdk-nextjs-standalone` dependency

### New CDK construct
Use `cdk-nextjs-standalone` (wraps OpenNext under the hood):

```typescript
import { Nextjs } from 'cdk-nextjs-standalone';

const site = new Nextjs(this, 'NextjsSite', {
  nextjsPath: '../frontend',
  environment: props?.environmentVariables,
});
```

This single construct provisions: CloudFront, S3 (assets + cache), Lambda (server + image + revalidation), SQS, and all required IAM roles.

## Migration Steps

- [ ] 1. Remove `frontend/Dockerfile`
- [ ] 2. Add `cdk-nextjs-standalone` to `infra/package.json`
- [ ] 3. Create `infra/lib/constructs/opennext-site.ts` using `Nextjs` construct
- [ ] 4. Update `infra/lib/stacks/app-stack.ts` to use new construct
- [ ] 5. Update `infra/config/app-config.ts` — remove CPU/memory config
- [ ] 6. Update `infra/lib/constructs/monitoring.ts` — Lambda + CloudFront metrics
- [ ] 7. Update `infra/lib/stacks/infra-stack.ts` if AppRunner-specific permissions exist
- [ ] 8. Destroy old AppRunner stack: `npm run destroy:dev`
- [ ] 9. Deploy new OpenNext stack: `npm run deploy:dev`
- [ ] 10. Update CI/CD workflow in `.github/workflows/deploy.yml`
- [ ] 11. Update `infra/docs/DEPLOYMENT_GUIDE.md` with final commands

## Rollback Plan

The new and old stacks are independent CloudFormation stacks. If the OpenNext deployment fails:
1. Old AppRunner stack can be redeployed: `npx cdk deploy AppStack-dev -c environment=dev`
2. No data migration risk (stateless frontend app)
