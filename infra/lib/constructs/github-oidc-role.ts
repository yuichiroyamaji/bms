import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface GitHubOidcRoleProps {
  /**
   * GitHub repository in format: owner/repo
   * Example: 'myorg/myrepo'
   */
  githubRepo: string;

  /**
   * GitHub branches that can assume this role
   * Default: ['main', 'develop']
   */
  branches?: string[];
}

export class GitHubOidcRole extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: GitHubOidcRoleProps) {
    super(scope, id);

    const branches = props.branches || ['main', 'develop'];

    // Create OIDC provider for GitHub Actions
    // Note: GitHub's OIDC provider thumbprints are updated periodically
    // Current thumbprints as of 2024 (GitHub uses multiple certificates)
    const githubProvider = new iam.OpenIdConnectProvider(this, 'GitHubProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
      thumbprints: [
        '6938fd4d98bab03faadb97b34396831e3780aea1',
        '1c58a3a8518e8759bf075b76b750d4f2df264fcd'
      ],
    });

    // Build trust policy conditions
    // The 'sub' claim format from GitHub can be:
    // - repo:OWNER/REPO:ref:refs/heads/BRANCH (for branch-based workflows)
    // - repo:OWNER/REPO:environment:ENVIRONMENT_NAME (when using GitHub Environments)
    // - repo:OWNER/REPO:pull_request (for pull requests)
    // Using StringLike with wildcard (*) to match all patterns for this repo
    // The wildcard matches anything after the repo name, including refs, environments, etc.
    const trustPolicyConditions: Record<string, any> = {
      StringEquals: {
        'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
      },
      StringLike: {
        // Wildcard matches: repo:owner/repo:ref:refs/heads/*, repo:owner/repo:environment:*, etc.
        'token.actions.githubusercontent.com:sub': `repo:${props.githubRepo}:*`,
      },
    };

    // Create IAM role that GitHub Actions can assume
    // Note: Role name doesn't include 'github' to avoid potential issues
    this.role = new iam.Role(this, 'GitHubActionsRole', {
      roleName: 'github-oidc-deploy-role',
      assumedBy: new iam.FederatedPrincipal(
        githubProvider.openIdConnectProviderArn,
        trustPolicyConditions,
        'sts:AssumeRoleWithWebIdentity'
      ),
      description: 'Role for GitHub Actions to deploy via CDK',
      maxSessionDuration: cdk.Duration.hours(1),
    });

    // Add permissions needed for CDK deployment
    this.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('PowerUserAccess')
    );

    // Add IAM permissions (PowerUserAccess doesn't include IAM)
    this.role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'iam:CreateRole',
          'iam:DeleteRole',
          'iam:GetRole',
          'iam:PassRole',
          'iam:AttachRolePolicy',
          'iam:DetachRolePolicy',
          'iam:PutRolePolicy',
          'iam:DeleteRolePolicy',
          'iam:GetRolePolicy',
          'iam:TagRole',
          'iam:UntagRole',
        ],
        resources: ['*'],
      })
    );

    // Output the role ARN
    new cdk.CfnOutput(this, 'GitHubActionsRoleArn', {
      value: this.role.roleArn,
      description: 'IAM Role ARN for GitHub Actions',
      exportName: 'GitHubActionsRoleArn',
    });
  }
}
