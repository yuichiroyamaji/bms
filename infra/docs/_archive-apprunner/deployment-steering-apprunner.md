# Deployment Configuration

## AWS AppRunner Deployment

This project is configured for deployment to AWS AppRunner using AWS CDK.

## Quick Deploy

```bash
cd infra
npm install
npx cdk bootstrap  # First time only
npm run deploy:dev
```

## Key Files

- **`frontend/Dockerfile`** - Container configuration
- **`infra/lib/stacks/app-stack.ts`** - AppRunner CDK stack
- **`infra/config/app-config.ts`** - Environment configuration
- **`infra/bin/cdk.ts`** - CDK entry point

## Configuration

Edit `infra/config/app-config.ts` for:
- Environment variables
- Instance sizing (CPU/Memory)
- Custom domain
- Alarm email

## Environments

- **Development**: `npm run deploy:dev`
- **Production**: `npm run deploy:prod`

## Monitoring

- CloudWatch Logs: `/aws/apprunner/nextjs-admin-dashboard`
- Alarms: CPU, Memory, HTTP errors
- Email notifications via SNS

## Cost

- Base: ~$3-5 USD/month (1 vCPU + 2 GB)
- Scales with traffic

## Documentation

- **[DEPLOYMENT_GUIDE.md](../../../DEPLOYMENT_GUIDE.md)** - Complete guide
- **[infra/README.md](../../../infra/README.md)** - Quick reference
- **[infra/docs/.kiro/DEPLOYMENT.md](../../../infra/docs/.kiro/DEPLOYMENT.md)** - Detailed docs (Kiro-generated)
- **[infra/docs/.kiro/TROUBLESHOOTING.md](../../../infra/docs/.kiro/TROUBLESHOOTING.md)** - Common issues (Kiro-generated)

## CI/CD

GitHub Actions workflow in `.github/workflows/deploy.yml`:
- `develop` branch → dev environment
- `main` branch → production environment

## Important Notes

1. Always test Docker build locally before deploying
2. Use `npm run diff:dev` to preview changes
3. Monitor CloudWatch logs during deployment
4. Keep dev and prod configurations separate
5. Delete dev stacks when not in use to save costs
