import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';

export interface MonitoringProps {
  /** Email subscribed to the alarm SNS topic. */
  alarmEmail: string;

  /** Server Lambda to watch (errors, throttles, duration). */
  serverFunction: lambda.IFunction;

  /** CloudFront distribution to watch (5xx error rate). */
  distribution: cloudfront.IDistribution;

  /** Server function error count threshold over 5 min (default: 5). */
  errorThreshold?: number;

  /** Server function p99 duration threshold in ms (default: 8000). */
  durationP99ThresholdMs?: number;

  /** CloudFront 5xx error rate threshold (percentage, default: 1). */
  cfErrorRateThreshold?: number;
}

export class Monitoring extends Construct {
  public readonly alarmTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id);

    this.alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      displayName: 'OpenNext Site Alarms',
    });
    new sns.Subscription(this, 'EmailSubscription', {
      topic: this.alarmTopic,
      protocol: sns.SubscriptionProtocol.EMAIL,
      endpoint: props.alarmEmail,
    });

    const snsAction = new cloudwatch_actions.SnsAction(this.alarmTopic);

    // Server Lambda errors
    new cloudwatch.Alarm(this, 'ServerErrorsAlarm', {
      metric: props.serverFunction.metricErrors({ period: cdk.Duration.minutes(5) }),
      threshold: props.errorThreshold ?? 5,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: 'Server Lambda is returning errors',
    }).addAlarmAction(snsAction);

    // Server Lambda throttles
    new cloudwatch.Alarm(this, 'ServerThrottlesAlarm', {
      metric: props.serverFunction.metricThrottles({ period: cdk.Duration.minutes(5) }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      alarmDescription: 'Server Lambda is being throttled',
    }).addAlarmAction(snsAction);

    // Server Lambda p99 duration
    new cloudwatch.Alarm(this, 'ServerDurationAlarm', {
      metric: props.serverFunction.metricDuration({
        period: cdk.Duration.minutes(5),
        statistic: 'p99',
      }),
      threshold: props.durationP99ThresholdMs ?? 8000,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: 'Server Lambda p99 latency is high',
    }).addAlarmAction(snsAction);

    // CloudFront 5xx error rate (global metric, lives in us-east-1)
    new cloudwatch.Alarm(this, 'CloudFront5xxAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/CloudFront',
        metricName: '5xxErrorRate',
        dimensionsMap: {
          DistributionId: props.distribution.distributionId,
          Region: 'Global',
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: props.cfErrorRateThreshold ?? 1,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: 'CloudFront 5xx rate exceeded threshold',
    }).addAlarmAction(snsAction);

    new cdk.CfnOutput(this, 'AlarmTopicArn', {
      value: this.alarmTopic.topicArn,
      description: 'SNS topic ARN for site alarms',
    });
  }
}
