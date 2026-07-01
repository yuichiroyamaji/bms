#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfraStack } from '../lib/stacks/infra-stack';
import { AppStack } from '../lib/stacks/app-stack';
import { getConfig } from '../config/app-config';

const app = new cdk.App();

// Get environment from context or default to 'dev'
const environment = app.node.tryGetContext('environment') || 'dev';
const config = getConfig(environment as 'dev' | 'prod');

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
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
