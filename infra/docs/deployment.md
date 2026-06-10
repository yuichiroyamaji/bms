# OpenNext Deployment Guide

Complete guide to deploy this Next.js admin dashboard to AWS using OpenNext (CloudFront + Lambda + S3).

## What Gets Deployed

OpenNext transforms the Next.js build output into serverless AWS resources:

| Resource | Role |
|---|---|
| CloudFront | CDN + request routing |
| S3 (assets) | Static files (`_next/static/`, `public/`) |
| S3 (cache) | ISR cache storage |
| Lambda (server) | SSR rendering + API routes |
| Lambda (image) | `next/image` optimization |
| Lambda (revalidation) | On-demand ISR revalidation |
| SQS | Revalidation queue |

No Docker, no ECR, no always-on container.

## Quick Deploy

### Step 1: Configure AWS

```bash
# Install AWS CLI if needed
brew install awscli  # macOS

# Configure credentials
aws configure
```

### Step 2: Update Configuration

Edit `infra/config/app-config.ts`:

```typescript
export const devConfig: AppConfig = {
  alarmEmail: 'your-email@example.com',  // ← Change this
  environmentVariables: {
    // NEXT_PUBLIC_API_URL: 'https://api.example.com',
  },
};
```

### Step 3: Bootstrap CDK (First Time Only)

```bash
cd infra
npm install
npx cdk bootstrap
```

### Step 4: Preview Changes (Optional)

```bash
npx cdk diff AppStack-dev -c environment=dev
```

View the generated CloudFormation template:

```bash
npx cdk synth AppStack-dev -c environment=dev
```

### Step 5: Deploy

```bash
npm run deploy:dev
```

This will:
1. Build the Next.js app with `open-next build`
2. Upload static assets to S3
3. Deploy Lambda functions (server, image, revalidation)
4. Create/update CloudFront distribution
5. Output your CloudFront URL

### Step 6: Access Your App

After deployment completes, you'll see:

```
Outputs:
AppStack-dev.CloudFrontUrl = https://xxxxxxxxxx.cloudfront.net
```

## Testing Locally First

No Docker needed. Test the Next.js app directly:

```bash
cd frontend
npm run build
npm start
```

Visit http://localhost:3000

## Environment Variables

### Adding Variables

Edit `infra/config/app-config.ts`:

```typescript
environmentVariables: {
  DATABASE_URL: 'postgresql://user:pass@host:5432/db',
  API_KEY: 'your-api-key',
  NEXT_PUBLIC_API_URL: 'https://api.example.com',
}
```

Then redeploy:

```bash
cd infra
npm run deploy:dev
```

### Sensitive Data (Recommended)

For passwords and secrets, use AWS Secrets Manager:

1. Create secret in AWS Console
2. Reference in Lambda environment via CDK
3. Access in app code via AWS SDK

## Custom Domain Setup

### Step 1: Update Config

```typescript
// infra/config/app-config.ts
customDomain: 'admin.example.com'
```

### Step 2: Deploy

```bash
cd infra
npm run deploy:dev
```

### Step 3: Add DNS Records

Point your domain's CNAME to the CloudFront URL output from the deploy.

## Monitoring & Alarms

### Email Notifications

You'll receive emails when:
- Lambda error rate exceeds threshold
- CloudFront 5xx error rate exceeds threshold

### View Logs

**AWS Console:**
CloudWatch → Log groups → Lambda function log groups

**CLI:**
```bash
# Server function logs
aws logs tail /aws/lambda/AppStack-dev-ServerFunction --follow
```

## Scaling

OpenNext scales automatically:
- Lambda concurrency scales with traffic (no manual sizing)
- CloudFront caches static assets globally
- ISR pages are cached in S3 and served from CloudFront

To control Lambda memory (affects both memory and CPU):

```typescript
// infra/config/app-config.ts
lambdaConfig: {
  serverMemoryMB: 1024,   // default: 512
  imageMemoryMB: 1024,    // default: 512
}
```

## Cost Breakdown

At low traffic (admin dashboard):

| Resource | Cost |
|---|---|
| Lambda | ~$0.20 per 1M requests |
| S3 | ~$0.023 per GB/month |
| CloudFront | First 1 TB/month free |
| SQS | First 1M requests/month free |
| **Total** | **< $1 USD/month** |

vs. AppRunner: ~$3–5/month always-on.

## Production Deployment

```bash
cd infra
npm run deploy:prod
```

### Production Checklist

- [ ] Update `prodConfig` in `app-config.ts`
- [ ] Set production environment variables
- [ ] Configure custom domain
- [ ] Set up alarm email
- [ ] Test thoroughly in dev first
- [ ] Review CloudFormation changes with `npm run diff:prod`
- [ ] Deploy during low-traffic period
- [ ] Monitor Lambda error rates after deployment

## CI/CD with GitHub Actions

### Setup

1. Create IAM role for GitHub Actions (OIDC) — handled by InfraStack
2. Add secrets to GitHub repository:
   - `AWS_ROLE_ARN`
   - `AWS_REGION`

3. Push to branches:
   - `develop` → deploys to dev
   - `main` → deploys to prod

### Manual Trigger

GitHub → Actions → Deploy → Run workflow

## Updating Your App

```bash
cd infra
npm run deploy:dev
```

CDK will:
1. Rebuild Next.js with `open-next build`
2. Sync changed assets to S3
3. Update Lambda function code
4. Invalidate CloudFront cache for changed paths

## Troubleshooting

> Note: the older `_archive-apprunner/troubleshooting.md` covers the retired AppRunner setup and no longer applies to this OpenNext deployment.

### Quick Fixes

**Build Fails:**
```bash
cd frontend
npm run build   # Check for Next.js build errors first
```

**Deployment Fails:**
```bash
aws sts get-caller-identity   # Verify AWS credentials
cd infra
npx cdk deploy AppStack-dev -c environment=dev --verbose
```

**Lambda Cold Starts (slow first response):**
- Expected behavior on first request after inactivity
- Admin dashboard use case: acceptable
- If unacceptable: configure Lambda provisioned concurrency in CDK

**CloudFront Serving Stale Content:**
```bash
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

## Cleanup

### Delete Development Stack

```bash
cd infra
npm run destroy:dev
```

### Delete All Resources

```bash
npx cdk destroy --all -c environment=dev
```

Note: S3 buckets with content must be emptied before deletion. CDK will handle this automatically if `removalPolicy: DESTROY` is set.

## Next Steps

1. **Database**: Add RDS or DynamoDB in `InfraStack`
2. **Authentication**: Set up Cognito
3. **Security**: Configure WAF on CloudFront
4. **Backup**: S3 versioning for cache bucket

## Architecture Overview

```
Users → CloudFront
  ├── _next/static/*, public/*  → S3 (assets)
  ├── /_next/image*             → Lambda (image)
  ├── middleware                → CloudFront Function
  └── SSR / API routes          → Lambda (server)
                                      ↕ ISR cache
                                    S3 (cache)
                                      ↓ revalidation
                                    SQS → Lambda (revalidation)

GitHub Actions → OIDC → IAM Role → CDK → CloudFormation
```

## Support & Resources

- **OpenNext Docs**: https://opennext.js.org
- **cdk-nextjs-standalone**: https://github.com/jetbridge/cdk-nextjs
- **AWS CDK Docs**: https://docs.aws.amazon.com/cdk/
- **Next.js Docs**: https://nextjs.org/docs
- **Migration Plan**: See [`reference/migration-plan.md`](./reference/migration-plan.md)
