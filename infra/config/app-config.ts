/**
 * Application configuration for different environments.
 */

export interface AppConfig {
  /**
   * AWS account ID this environment must deploy to.
   * CDK pins the stack to this account and refuses to deploy if the
   * active AWS credentials/profile resolve to a different account.
   */
  awsAccountId: string;

  /** AWS region to deploy to (optional, falls back to CDK_DEFAULT_REGION). */
  awsRegion?: string;

  /** Email for CloudWatch alarms. */
  alarmEmail?: string;

  /** Environment variables for the Next.js server Lambda. */
  environmentVariables?: { [key: string]: string };

  /** Custom domain names for the CloudFront distribution. */
  domainNames?: string[];

  /** ACM certificate ARN (must be in us-east-1) when `domainNames` is set. */
  certificateArn?: string;

  /** Server Lambda memory in MB (default 1024). */
  serverMemoryMb?: number;

  /** Image-optimization Lambda memory in MB (default 1536). */
  imageMemoryMb?: number;
}

/**
 * GitHub repository (format: owner/repo) trusted to assume the CI/CD deploy
 * role via OIDC — see infra/lib/constructs/github-oidc-role.ts. The trust
 * policy is scoped to this exact value, so GitHub Actions in a differently
 * named repo cannot assume the role until this is updated to match.
 *
 * REPLACE this when copying/forking this repo for a new project.
 */
export const githubRepo = 'yuichiroyamaji/bms';

/**
 * Prefix for every physical resource name that is unique per AWS account:
 * CloudFormation stack names and the CI/CD IAM role.
 *
 * This exists because more than one project built from this template can share
 * a single AWS account. Stack names, IAM role names, and CloudFormation export
 * names are account-scoped, not stack-scoped, so two deployments that use the
 * same prefix collide — the second one either fails to deploy or, worse,
 * updates the first one's stacks.
 *
 * REPLACE this when copying/forking this repo for a new project, and keep it
 * distinct from any other project deploying into the same account.
 */
export const resourcePrefix = 'bms';

export const devConfig: AppConfig = {
  // REPLACE with the actual AWS account ID for the dev environment
  awsAccountId: '361454773891',
  // awsRegion: 'ap-northeast-1',
  alarmEmail: 'yuichiroyamaji@hotmail.com',
  serverMemoryMb: 1024,
  imageMemoryMb: 1536,
  environmentVariables: {
    // DATABASE_URL: '...',
    // API_KEY: '...',
  },
  // domainNames: ['dev-admin.example.com'],
  // certificateArn: 'arn:aws:acm:us-east-1:...',
};

export const prodConfig: AppConfig = {
  // REPLACE with the actual AWS account ID for the prod environment
  awsAccountId: '361454773891',
  // awsRegion: 'ap-northeast-1',
  alarmEmail: 'yuichiroyamaji@hotmail.com',
  serverMemoryMb: 2048,
  imageMemoryMb: 2048,
  environmentVariables: {},
  // domainNames: ['admin.example.com'],
  // certificateArn: 'arn:aws:acm:us-east-1:...',
};

export const getConfig = (environment: 'dev' | 'prod'): AppConfig => {
  return environment === 'prod' ? prodConfig : devConfig;
};
