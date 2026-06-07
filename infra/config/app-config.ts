/**
 * Application configuration for different environments.
 */

export interface AppConfig {
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

export const devConfig: AppConfig = {
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
  alarmEmail: 'yuichiroyamaji@hotmail.com',
  serverMemoryMb: 2048,
  imageMemoryMb: 2048,
  environmentVariables: {},
  // domainNames: ['admin.example.com'],
  // certificateArn: 'arn:aws:acm:us-east-1:...',
};

export const getConfig = (environment: 'dev' | 'prod' = 'dev'): AppConfig => {
  return environment === 'prod' ? prodConfig : devConfig;
};
