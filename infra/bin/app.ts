#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfraStack } from '../lib/stacks/infra-stack';
import { AppStack } from '../lib/stacks/app-stack';
import { MonitoringStack } from '../lib/stacks/monitoring-stack';
import { getConfig, githubRepo, resourcePrefix } from '../config/app-config';

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

// Infrastructure stack (databases, caching, etc.)
new InfraStack(app, `InfraStack-${environment}`, {
  env,
  stackName: `${resourcePrefix}-infra-${environment}`,
  githubRepo,
});

// OpenNext stack for the Next.js frontend (CloudFront + Lambda + S3)
const appStack = new AppStack(app, `AppStack-${environment}`, {
  env,
  stackName: `${resourcePrefix}-app-${environment}`,
  crossRegionReferences: true,
  ...config,
});

// CloudFront's 5xx alarm must live in us-east-1, where CloudFront publishes
// its CloudWatch metrics — AppStack itself can deploy to any region.
if (config.alarmEmail) {
  const monitoringStack = new MonitoringStack(app, `MonitoringStack-${environment}`, {
    env: {
      account: config.awsAccountId,
      region: 'us-east-1',
    },
    stackName: `${resourcePrefix}-monitoring-${environment}`,
    crossRegionReferences: true,
    distributionId: appStack.distributionId,
    alarmEmail: config.alarmEmail,
  });
  monitoringStack.addDependency(appStack);
}
