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
import * as iam from 'aws-cdk-lib/aws-iam';
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

    // AWS_IAM (not NONE): CloudFront signs origin requests via OAC (see Distribution
    // below). Public (NONE) function URLs are rejected in this AWS org, and IAM + OAC
    // is the AWS-recommended secure pattern — the URL is only reachable via CloudFront.
    const serverFnUrl = this.serverFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.AWS_IAM,
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
      authType: lambda.FunctionUrlAuthType.AWS_IAM,
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
    // OAC-signed origins: CloudFront signs each request with SigV4 so the AWS_IAM
    // function URLs accept it. withOriginAccessControl also auto-grants CloudFront
    // lambda:InvokeFunctionUrl scoped to this distribution.
    const serverOrigin = origins.FunctionUrlOrigin.withOriginAccessControl(serverFnUrl);
    const imageOrigin = origins.FunctionUrlOrigin.withOriginAccessControl(imageFnUrl);

    // Forward all viewer headers to the Lambda origins EXCEPT `host` and `authorization`.
    // `host` must be the origin's own host for SigV4, which is what the managed
    // AllViewerExceptHostHeader policy does; this policy additionally drops
    // `authorization` so a viewer-supplied credential is never relayed to the origin.
    //
    // NOTE: dropping `authorization` is defence-in-depth, NOT a requirement for OAC.
    // The OAC below uses SigningBehavior `always`, and AWS documents that `always`
    // overwrites any viewer Authorization header with its own SigV4 signature. Only
    // `no-override` defers to the viewer's header. Do not attribute OAC 403s to this
    // setting — the real cause is usually a missing lambda:InvokeFunction grant (below).
    const lambdaOriginRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'ServerOriginRequestPolicy', {
      comment: 'All viewer headers except host + authorization',
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.denyList('host', 'authorization'),
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
    });
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
        originRequestPolicy: lambdaOriginRequestPolicy,
        compress: true,
      },
      additionalBehaviors: {
        '_next/image*': {
          origin: imageOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cachingOptimized,
          originRequestPolicy: lambdaOriginRequestPolicy,
          compress: true,
        },
        '_next/data/*': {
          origin: serverOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: serverCachePolicy,
          originRequestPolicy: lambdaOriginRequestPolicy,
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

    // OAC needs TWO permissions on each function URL origin, not one.
    // `FunctionUrlOrigin.withOriginAccessControl()` auto-grants only
    // `lambda:InvokeFunctionUrl`; AWS additionally requires `lambda:InvokeFunction`
    // for the CloudFront service principal. Without it every SSR/image request is
    // rejected by the function URL with 403 AccessDenied before the function is ever
    // invoked — which looks exactly like an OAC signing failure and is easy to
    // misdiagnose as such. See "Restrict access to an AWS Lambda function URL origin":
    // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-lambda.html
    //
    // Declared after the Distribution so `distributionId` is resolvable. This does not
    // create a cycle: the Distribution depends on the function URLs, and these
    // permissions depend on the Distribution — the functions never depend back.
    const distributionArn = `arn:aws:cloudfront::${cdk.Stack.of(this).account}:distribution/${this.distribution.distributionId}`;
    for (const [id, fn] of [
      ['ServerFunctionCloudFrontInvoke', this.serverFunction],
      ['ImageFunctionCloudFrontInvoke', this.imageFunction],
    ] as const) {
      fn.addPermission(id, {
        principal: new iam.ServicePrincipal('cloudfront.amazonaws.com'),
        action: 'lambda:InvokeFunction',
        sourceArn: distributionArn,
      });
    }

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
