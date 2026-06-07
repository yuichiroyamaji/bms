import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cr from 'aws-cdk-lib/custom-resources';

export interface OpenNextSiteProps {
  /** Absolute path to the `.open-next` directory produced by `open-next build`. */
  openNextPath: string;

  /** Environment variables passed to the server function (e.g. API_URL). */
  environment?: { [key: string]: string };

  /** ACM certificate ARN in us-east-1, required when `domainNames` is set. */
  certificateArn?: string;

  /** Custom domain names to attach to the CloudFront distribution. */
  domainNames?: string[];

  /** Server Lambda memory (MB). Default: 1024. */
  serverMemoryMb?: number;

  /** Image-optimization Lambda memory (MB). Default: 1536. */
  imageMemoryMb?: number;
}

export class OpenNextSite extends Construct {
  public readonly distribution: cloudfront.Distribution;
  public readonly serverFunction: lambda.Function;
  public readonly imageFunction: lambda.Function;
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: OpenNextSiteProps) {
    super(scope, id);

    const openNextPath = props.openNextPath;
    const stack = cdk.Stack.of(this);

    // ---------- S3: assets + ISR cache ----------
    this.bucket = new s3.Bucket(this, 'Bucket', {
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    new s3deploy.BucketDeployment(this, 'AssetsDeployment', {
      sources: [s3deploy.Source.asset(path.join(openNextPath, 'assets'))],
      destinationBucket: this.bucket,
      destinationKeyPrefix: '_assets',
      prune: true,
      memoryLimit: 512,
    });

    new s3deploy.BucketDeployment(this, 'CacheDeployment', {
      sources: [s3deploy.Source.asset(path.join(openNextPath, 'cache'))],
      destinationBucket: this.bucket,
      destinationKeyPrefix: '_cache',
      prune: true,
      memoryLimit: 512,
    });

    // ---------- DynamoDB: tag cache (for ISR tag-based revalidation) ----------
    const tagCacheTable = new dynamodb.Table(this, 'TagCache', {
      partitionKey: { name: 'tag', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'path', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    tagCacheTable.addGlobalSecondaryIndex({
      indexName: 'revalidate',
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'revalidatedAt', type: dynamodb.AttributeType.NUMBER },
    });

    // ---------- SQS: revalidation queue (FIFO) ----------
    const revalidationQueue = new sqs.Queue(this, 'RevalidationQueue', {
      fifo: true,
      contentBasedDeduplication: true,
      visibilityTimeout: cdk.Duration.seconds(30),
      receiveMessageWaitTime: cdk.Duration.seconds(20),
    });

    // ---------- Server Lambda (SSR + RSC + route handlers) ----------
    this.serverFunction = new lambda.Function(this, 'ServerFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(openNextPath, 'server-functions/default')),
      memorySize: props.serverMemoryMb ?? 1024,
      timeout: cdk.Duration.seconds(10),
      environment: {
        CACHE_BUCKET_NAME: this.bucket.bucketName,
        CACHE_BUCKET_KEY_PREFIX: '_cache',
        CACHE_BUCKET_REGION: stack.region,
        CACHE_DYNAMO_TABLE: tagCacheTable.tableName,
        REVALIDATION_QUEUE_URL: revalidationQueue.queueUrl,
        REVALIDATION_QUEUE_REGION: stack.region,
        ...(props.environment ?? {}),
      },
    });
    this.bucket.grantReadWrite(this.serverFunction, '_cache/*');
    this.bucket.grantRead(this.serverFunction, '_assets/*');
    tagCacheTable.grantReadWriteData(this.serverFunction);
    revalidationQueue.grantSendMessages(this.serverFunction);

    const serverFnUrl = this.serverFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    // ---------- Image-optimization Lambda ----------
    this.imageFunction = new lambda.Function(this, 'ImageFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(openNextPath, 'image-optimization-function')),
      memorySize: props.imageMemoryMb ?? 1536,
      timeout: cdk.Duration.seconds(25),
      environment: {
        BUCKET_NAME: this.bucket.bucketName,
        BUCKET_KEY_PREFIX: '_assets',
      },
    });
    this.bucket.grantRead(this.imageFunction, '_assets/*');

    const imageFnUrl = this.imageFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    // ---------- Revalidation Lambda (SQS-triggered) ----------
    const revalidationFunction = new lambda.Function(this, 'RevalidationFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(openNextPath, 'revalidation-function')),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
    });
    revalidationFunction.addEventSource(
      new lambdaSources.SqsEventSource(revalidationQueue, { batchSize: 5 }),
    );

    // ---------- Warmer Lambda (keeps server fn pre-warmed) ----------
    const warmerFunction = new lambda.Function(this, 'WarmerFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(openNextPath, 'warmer-function')),
      memorySize: 128,
      timeout: cdk.Duration.seconds(15),
      environment: {
        FUNCTION_NAME: this.serverFunction.functionName,
        CONCURRENCY: '1',
      },
    });
    this.serverFunction.grantInvoke(warmerFunction);
    new events.Rule(this, 'WarmerSchedule', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
      targets: [new targets.LambdaFunction(warmerFunction)],
    });

    // ---------- DynamoDB tag-cache initializer (runs once per deploy) ----------
    const initFunction = new lambda.Function(this, 'InitFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(openNextPath, 'dynamodb-provider')),
      memorySize: 256,
      timeout: cdk.Duration.minutes(5),
      environment: {
        CACHE_DYNAMO_TABLE: tagCacheTable.tableName,
      },
    });
    tagCacheTable.grantReadWriteData(initFunction);
    new cr.AwsCustomResource(this, 'InitInvoker', {
      onUpdate: {
        service: 'Lambda',
        action: 'invoke',
        parameters: {
          FunctionName: initFunction.functionName,
          InvocationType: 'Event',
        },
        physicalResourceId: cr.PhysicalResourceId.of(`${stack.stackName}-init`),
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [initFunction.functionArn],
      }),
    });

    // ---------- CloudFront ----------
    const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(this.bucket, {
      originPath: '/_assets',
    });
    const serverOrigin = new origins.FunctionUrlOrigin(serverFnUrl);
    const imageOrigin = new origins.FunctionUrlOrigin(imageFnUrl);

    const allViewerExceptHost = cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER;
    const cachingOptimized = cloudfront.CachePolicy.CACHING_OPTIMIZED;

    // Server cache policy: honors Next.js cache-control headers, varies on RSC headers.
    const serverCachePolicy = new cloudfront.CachePolicy(this, 'ServerCachePolicy', {
      defaultTtl: cdk.Duration.seconds(0),
      minTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.days(365),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
        'accept',
        'accept-language',
        'rsc',
        'next-router-prefetch',
        'next-router-state-tree',
        'next-url',
      ),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      enableAcceptEncodingBrotli: true,
      enableAcceptEncodingGzip: true,
    });

    const s3Behavior: cloudfront.BehaviorOptions = {
      origin: s3Origin,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: cachingOptimized,
      compress: true,
    };

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: serverOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: serverCachePolicy,
        originRequestPolicy: allViewerExceptHost,
        compress: true,
      },
      additionalBehaviors: {
        '_next/image*': {
          origin: imageOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cachingOptimized,
          originRequestPolicy: allViewerExceptHost,
          compress: true,
        },
        '_next/data/*': {
          origin: serverOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: serverCachePolicy,
          originRequestPolicy: allViewerExceptHost,
          compress: true,
        },
        '_next/*': s3Behavior,
        'BUILD_ID': s3Behavior,
        'favicon.ico': s3Behavior,
        'images/*': s3Behavior,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      enableIpv6: true,
      ...(props.certificateArn && props.domainNames
        ? {
            certificate: acm.Certificate.fromCertificateArn(
              this,
              'Certificate',
              props.certificateArn,
            ),
            domainNames: props.domainNames,
          }
        : {}),
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'CloudFront distribution URL',
    });
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'S3 bucket holding static assets and ISR cache',
    });
  }
}
