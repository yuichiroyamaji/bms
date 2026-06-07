# AWS Infrastructure I/O Diagram

This document provides a visual representation of the AWS infrastructure components and their relationships in this project.

## Architecture Overview

```mermaid
graph TB
    %% External
    Users[👥 Users / HTTP Requests]
    GitHub[🔷 GitHub Repository]
    Developer[👨‍💻 Developer / CDK Deployments]

    %% AppStack
    subgraph AppStack["📦 AppStack (dev/prod)"]
        CloudFront[🌐 CloudFront Distribution]

        subgraph Origins["Origins"]
            S3Assets[📦 S3 Bucket<br/>Static Assets<br/>_next/static/, public/]
            LambdaServer[λ Lambda<br/>Server Function<br/>SSR + API Routes]
            LambdaImage[λ Lambda<br/>Image Optimization<br/>/_next/image]
        end

        CFFunction[⚡ CloudFront Function<br/>Middleware]
        S3Cache[💾 S3 Bucket<br/>ISR Cache]
        SQS[📨 SQS<br/>Revalidation Queue]
        LambdaRevalidate[λ Lambda<br/>Revalidation Handler]
    end

    %% Monitoring
    subgraph Monitoring["📊 Monitoring & Alerts"]
        CloudWatchLogs[📝 CloudWatch Logs<br/>Lambda function logs]
        CloudWatchAlarms[🚨 CloudWatch Alarms<br/>Lambda errors, CloudFront 5xx]
        SNSTopic[📧 SNS Topic<br/>Alarm Notifications]
        EmailSub[📮 Email Subscription]
    end

    %% InfraStack
    subgraph InfraStack["🏗️ InfraStack (dev/prod)"]
        OIDCProvider[🔗 GitHub OIDC Provider]
        GitHubActionsRole[🔐 IAM Role<br/>github-oidc-deploy-role]
    end

    %% Request flow
    Users -->|HTTPS| CloudFront
    CloudFront -->|_next/static/*, public/*| S3Assets
    CloudFront -->|SSR / API routes| LambdaServer
    CloudFront -->|/_next/image| LambdaImage
    CloudFront -->|middleware| CFFunction

    %% ISR cache flow
    LambdaServer <-->|read/write cache| S3Cache
    LambdaServer -->|revalidation trigger| SQS
    SQS --> LambdaRevalidate
    LambdaRevalidate -->|update cache| S3Cache

    %% Monitoring flow
    LambdaServer -->|logs| CloudWatchLogs
    LambdaImage -->|logs| CloudWatchLogs
    LambdaRevalidate -->|logs| CloudWatchLogs
    CloudWatchLogs --> CloudWatchAlarms
    CloudFront -->|5xx metrics| CloudWatchAlarms
    CloudWatchAlarms --> SNSTopic
    SNSTopic --> EmailSub

    %% CI/CD flow
    Developer -->|CDK Deploy| AppStack
    Developer -->|CDK Deploy| InfraStack
    GitHub -->|OIDC Token| OIDCProvider
    OIDCProvider -->|Assume Role| GitHubActionsRole
    GitHubActionsRole -->|Deploy via CDK| AppStack
    GitHubActionsRole -->|Deploy via CDK| InfraStack

    %% Styling
    classDef external fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef appstack fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef monitoring fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef infrastack fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px

    class Users,GitHub,Developer external
    class CloudFront,S3Assets,LambdaServer,LambdaImage,CFFunction,S3Cache,SQS,LambdaRevalidate appstack
    class CloudWatchLogs,CloudWatchAlarms,SNSTopic,EmailSub monitoring
    class OIDCProvider,GitHubActionsRole infrastack
```

## Component Details

### AppStack Components

| Component | Type | Role |
|---|---|---|
| CloudFront Distribution | CDN | Routes requests to correct origin, serves cached responses |
| S3 (assets) | Storage | Static files (`_next/static/`, `public/`) |
| S3 (cache) | Storage | ISR page cache |
| Lambda (server) | Compute | SSR rendering + API routes |
| Lambda (image) | Compute | `next/image` optimization |
| Lambda (revalidation) | Compute | Handles ISR on-demand revalidation |
| CloudFront Function | Edge compute | Next.js middleware (routing, auth headers) |
| SQS | Queue | Revalidation job queue (decouples trigger from handler) |

### CloudFront Routing Rules

| Path pattern | Origin |
|---|---|
| `_next/static/*` | S3 (assets) |
| `public/*` | S3 (assets) |
| `/_next/image*` | Lambda (image) |
| All other paths | Lambda (server) |

### Monitoring Components

| Component | What it watches |
|---|---|
| CloudWatch Logs | Lambda invocation logs (server, image, revalidation) |
| CloudWatch Alarms | Lambda error rate, CloudFront 5xx rate |
| SNS Topic | Alarm fanout |
| Email Subscription | `yuichiroyamaji@hotmail.com` |

### InfraStack Components

| Component | Role |
|---|---|
| GitHub OIDC Provider | Federates GitHub Actions identity to AWS |
| IAM Role (github-oidc-deploy-role) | Assumed by GitHub Actions for CDK deployments |

## Data Flow

### Application Request Flow

```
Users → CloudFront
  ├── static assets    → S3 (assets)
  ├── image requests   → Lambda (image optimization)
  ├── SSR / API        → Lambda (server function)
  └── middleware       → CloudFront Function
```

### ISR Revalidation Flow

```
Lambda (server) → SQS → Lambda (revalidation) → S3 (cache)
                                                     ↑
Lambda (server) ─────────────────── read cache ──────┘
```

### CI/CD Deployment Flow

```
Developer / GitHub Actions → CDK → CloudFormation
  → S3 (assets): upload built static files
  → Lambda: deploy server/image/revalidation function code
  → CloudFront: update distribution (invalidate cache if needed)
```

## Environment Separation

| | Development (`dev`) | Production (`prod`) |
|---|---|---|
| Stack names | `AppStack-dev`, `InfraStack-dev` | `AppStack-prod`, `InfraStack-prod` |
| Lambda memory | 512 MB | 1024 MB |
| CloudFront cache TTL | Short (easier debugging) | Standard |

## Cost Estimate

| Resource | Cost |
|---|---|
| Lambda (server) | ~$0.20 per 1M requests + duration |
| Lambda (image) | ~$0.20 per 1M requests + duration |
| S3 (assets + cache) | ~$0.023 per GB/month |
| CloudFront | First 1 TB/month free, then $0.0085/GB |
| SQS | First 1M requests/month free |
| **Total (low traffic)** | **< $1 USD/month** |

Compared to AppRunner (~$3–5/month always-on), cost is significantly lower for admin dashboards with variable/low traffic.

## Security

- IAM roles follow least privilege (Lambda execution roles scoped to S3 buckets they own)
- OIDC for GitHub Actions (no long-lived credentials)
- CloudFront enforces HTTPS
- S3 buckets are not publicly accessible (CloudFront Origin Access Control)

## Outputs

1. **CloudFront URL**: `https://xxxxxxxxxx.cloudfront.net` (or custom domain)
2. **Alarm Topic ARN**: SNS topic for monitoring alerts
3. **GitHub Actions Role ARN**: IAM role for CI/CD deployments
