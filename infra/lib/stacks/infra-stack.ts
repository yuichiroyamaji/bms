import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { GitHubOidcRole } from '../constructs/github-oidc-role';

export interface InfraStackProps extends cdk.StackProps {
  /**
   * GitHub repository for CI/CD (format: owner/repo)
   */
  githubRepo?: string;
}

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: InfraStackProps) {
    super(scope, id, props);

    // GitHub Actions OIDC role (if GitHub repo is provided)
    if (props?.githubRepo) {
      new GitHubOidcRole(this, 'GitHubOidc', {
        githubRepo: props.githubRepo,
        branches: ['main', 'develop'],
      });
    }

    // Add other infrastructure resources here
    // - RDS database
    // - ElastiCache Redis
    // - S3 buckets
    // - etc.
  }
}
