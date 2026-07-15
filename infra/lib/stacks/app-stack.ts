import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { OpenNextSite } from '../constructs/open-next-site';
import { Monitoring } from '../constructs/monitoring';

export interface AppStackProps extends cdk.StackProps {
  /** Environment variables passed to the Next.js server Lambda. */
  environmentVariables?: { [key: string]: string };

  /** Email for CloudWatch alarms (optional). */
  alarmEmail?: string;

  /** Custom domain names for the CloudFront distribution (optional). */
  domainNames?: string[];

  /** ACM certificate ARN in us-east-1 — required if `domainNames` is set. */
  certificateArn?: string;

  /** Server Lambda memory in MB (default 1024). */
  serverMemoryMb?: number;

  /** Image-optimization Lambda memory in MB (default 1536). */
  imageMemoryMb?: number;
}

export class AppStack extends cdk.Stack {
  public readonly cloudFrontUrl: string;
  public readonly distributionId: string;

  constructor(scope: Construct, id: string, props?: AppStackProps) {
    super(scope, id, props);

    // CDK is invoked from infra/, so the frontend build output is one level up.
    const projectRoot = path.resolve(process.cwd(), '..');
    const openNextPath = path.join(projectRoot, 'frontend', '.open-next');

    const site = new OpenNextSite(this, 'Site', {
      openNextPath,
      environment: props?.environmentVariables,
      certificateArn: props?.certificateArn,
      domainNames: props?.domainNames,
      serverMemoryMb: props?.serverMemoryMb,
      imageMemoryMb: props?.imageMemoryMb,
    });

    this.cloudFrontUrl = `https://${site.distribution.distributionDomainName}`;
    this.distributionId = site.distribution.distributionId;

    // Declared directly on AppStack (not nested inside OpenNextSite) so the CloudFormation
    // OutputKey is exactly "SiteUrl" — nested constructs get ancestor-id-prefixed output
    // keys, which would make this fragile to query from the deploy workflow.
    new cdk.CfnOutput(this, 'SiteUrl', {
      value: this.cloudFrontUrl,
      description: 'CloudFront URL for the Next.js application',
    });

    // CloudFront's 5xx alarm is deployed separately in MonitoringStack (us-east-1) — see bin/app.ts.
    if (props?.alarmEmail) {
      new Monitoring(this, 'Monitoring', {
        alarmEmail: props.alarmEmail,
        serverFunction: site.serverFunction,
      });
    }
  }
}
