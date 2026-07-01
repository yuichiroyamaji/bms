import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { GitHubOidcRole } from '../constructs/github-oidc-role';

export interface InfraStackProps extends cdk.StackProps {
  /**
   * GitHub repository for CI/CD (format: owner/repo)
   */
  githubRepo?: string;

  /**
   * Whether to create the account-wide GitHub OIDC provider.
   * Only ONE provider per URL can exist per AWS account — set false to reuse an
   * existing one (e.g. created by another repo/stack in the same account).
   * Default: false.
   */
  createOidcProvider?: boolean;
}

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: InfraStackProps) {
    super(scope, id, props);

    // GitHub Actions OIDC role (if GitHub repo is provided)
    if (props?.githubRepo) {
      new GitHubOidcRole(this, 'GitHubOidc', {
        githubRepo: props.githubRepo,
        branches: ['main', 'develop'],
        createOidcProvider: props.createOidcProvider ?? false,
      });
    }

    // Add other infrastructure resources here
    // - RDS database
    // - ElastiCache Redis
    // - S3 buckets
    // - etc.
  }
}
