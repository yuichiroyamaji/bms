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

  /**
   * Whether to create the account-wide GitHub OIDC provider.
   * Only ONE provider per URL can exist per AWS account. Set false to reuse an
   * existing provider created elsewhere in the same account. Default: false.
   */
  createOidcProvider?: boolean;
}

export class GitHubOidcRole extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: GitHubOidcRoleProps) {
    super(scope, id);

    const branches = props.branches || ['main', 'develop'];

    // GitHub Actions OIDC provider. Only one provider per URL can exist per AWS
    // account, so by default we import the existing one rather than create a
    // duplicate (which would fail with EntityAlreadyExists). Set
    // `createOidcProvider: true` only in the account/stack that owns it.
    const providerArn = props.createOidcProvider
      ? new iam.OpenIdConnectProvider(this, 'GitHubProvider', {
          url: 'https://token.actions.githubusercontent.com',
          clientIds: ['sts.amazonaws.com'],
        }).openIdConnectProviderArn
      : `arn:aws:iam::${cdk.Stack.of(this).account}:oidc-provider/token.actions.githubusercontent.com`;

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
      roleName: 'bms-github-oidc-deploy-role',
      assumedBy: new iam.FederatedPrincipal(
        providerArn,
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

    // Output the role ARN (no exportName — export names must be unique per
    // account/region and the original repo's stack already exports one).
    new cdk.CfnOutput(this, 'GitHubActionsRoleArn', {
      value: this.role.roleArn,
      description: 'IAM Role ARN for GitHub Actions',
    });
  }
}
