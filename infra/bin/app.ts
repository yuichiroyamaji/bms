#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfraStack } from '../lib/stacks/infra-stack';
import { AppStack } from '../lib/stacks/app-stack';
import { getConfig } from '../config/app-config';

const app = new cdk.App();

// Environment is required - no default. Pass -c environment=dev or -c environment=prod
// (e.g. `npx cdk deploy ... -c environment=dev`, or use npm run deploy:dev / deploy:prod).
const environment = app.node.tryGetContext('environment');
if (environment !== 'dev' && environment !== 'prod') {
  throw new Error(
    'Missing or invalid required CDK context "environment". ' +
      'Pass -c environment=dev or -c environment=prod ' +
      `(received: ${JSON.stringify(environment)}).`
  );
}
const config = getConfig(environment);

if (config.awsAccountId.startsWith('REPLACE_')) {
  throw new Error(
    `infra/config/app-config.ts: awsAccountId for "${environment}" is still a placeholder. ` +
      'Set it to the actual AWS account ID for this environment before deploying.'
  );
}

// Account/region are pinned per environment (not read from ambient AWS credentials),
// so CDK refuses to deploy if the active AWS profile doesn't match this environment's account.
const env = {
  account: config.awsAccountId,
  region: config.awsRegion || process.env.CDK_DEFAULT_REGION,
};

// Infrastructure stack (databases, caching, CI/CD OIDC role, etc.)
// NOTE: stackName is `bms-*` so this repo's deployments stay fully isolated from
// the `admin-*` stacks created by the original template repo in the same account.
new InfraStack(app, `InfraStack-${environment}`, {
  env,
  stackName: `bms-infra-${environment}`,
  // GitHub repository for CI/CD - UPDATE THIS if your repo name is different
  githubRepo: 'yuichiroyamaji/bms',
  // The account-wide GitHub OIDC provider already exists (created by the original
  // repo). Import it instead of creating a duplicate (only one allowed per account).
  createOidcProvider: false,
});

// OpenNext stack for the Next.js frontend (CloudFront + Lambda + S3)
new AppStack(app, `AppStack-${environment}`, {
  env,
  stackName: `bms-app-${environment}`,
  ...config,
});
