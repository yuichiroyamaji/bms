import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Construct } from 'constructs';

export interface MonitoringStackProps extends cdk.StackProps {
  /** CloudFront distribution ID to monitor (cross-region reference from AppStack). */
  distributionId: string;

  /** Email address for alarm notifications. */
  alarmEmail: string;

  /** CloudFront 5xx error rate threshold (percentage, default: 1) */
  cfErrorRateThreshold?: number;
}

/**
 * CloudFront only publishes CloudWatch metrics to us-east-1, and a CloudWatch
 * alarm can only read metrics from its own stack's region. AppStack can deploy
 * to any region, so this alarm lives in its own stack pinned to env.region =
 * 'us-east-1' and cross-references AppStack's distributionId via
 * `crossRegionReferences: true` (set on both stacks in bin/app.ts).
 */
export class MonitoringStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    // SNS rejects any topic DisplayName containing "CloudFront" as a reserved
    // AWS product name (confirmed via `aws sns create-topic`: "Invalid
    // parameter: Attributes Reason: Reserved DisplayName") — avoid it here.
    const alarmTopic = new sns.Topic(this, 'CloudFrontAlarmTopic', {
      displayName: 'Distribution 5xx Alarms',
    });

    new sns.Subscription(this, 'EmailSubscription', {
      topic: alarmTopic,
      protocol: sns.SubscriptionProtocol.EMAIL,
      endpoint: props.alarmEmail,
    });

    const cloudFront5xxAlarm = new cloudwatch.Alarm(this, 'CloudFront5xxAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/CloudFront',
        metricName: '5xxErrorRate',
        dimensionsMap: {
          DistributionId: props.distributionId,
          Region: 'Global',
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: props.cfErrorRateThreshold ?? 1,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `CloudFront 5xx rate exceeded ${props.cfErrorRateThreshold ?? 1}%`,
    });
    cloudFront5xxAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alarmTopic));

    new cdk.CfnOutput(this, 'AlarmTopicArn', {
      value: alarmTopic.topicArn,
      description: 'SNS topic ARN for CloudFront alarms (us-east-1)',
    });
  }
}
