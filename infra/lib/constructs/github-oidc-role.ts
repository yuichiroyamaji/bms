import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { resourcePrefix } from '../../config/app-config';

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

    // Import the account-wide GitHub Actions OIDC provider rather than creating one.
    // GitHub's provider (token.actions.githubusercontent.com) is account-global — only
    // one can exist per AWS account, so if any other project in this account already
    // created it, `new iam.OpenIdConnectProvider(...)` fails with EntityAlreadyExists.
    // Importing is safe either way, but it does mean the provider must already exist;
    // see docs/getting-started.md for creating it on a genuinely fresh account.
    const githubProvider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'GitHubProvider',
      `arn:aws:iam::${cdk.Stack.of(this).account}:oidc-provider/token.actions.githubusercontent.com`
    );

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

    // Create IAM role that GitHub Actions can assume.
    // IAM role names are account-global, so this is prefixed to stay isolated from
    // other projects built from this template deploying into the same account.
    this.role = new iam.Role(this, 'GitHubActionsRole', {
      roleName: `${resourcePrefix}-github-oidc-deploy-role`,
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

    // Output the role ARN, deliberately WITHOUT an exportName. CloudFormation export
    // names are unique per account/region, so a fixed 'GitHubActionsRoleArn' export
    // collides with any other project from this template in the same account — the
    // deploy is then rejected up front with "Export with name ... is already exported
    // by stack ...". Nothing consumes this via Fn::ImportValue, so a plain output is
    // enough; the ARN is read from the stack outputs when wiring up GitHub secrets.
    new cdk.CfnOutput(this, 'GitHubActionsRoleArn', {
      value: this.role.roleArn,
      description: 'IAM Role ARN for GitHub Actions',
    });
  }
}
