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

// Infrastructure stack (databases, caching, etc.)
new InfraStack(app, `InfraStack-${environment}`, {
  env,
  stackName: `admin-infra-${environment}`,
  // GitHub repository for CI/CD - UPDATE THIS if your repo name is different
  githubRepo: 'yuichiroyamaji/serverless-admin-template',
});

// AppRunner stack for Next.js frontend
new AppStack(app, `AppStack-${environment}`, {
  env,
  stackName: `admin-app-${environment}`,
  ...config,
});
