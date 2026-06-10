# Product Overview

This is a full-stack admin dashboard application (BMS — Bar Management System) built with
Next.js and AWS infrastructure. The project consists of three main components:

## Frontend
A feature-rich admin dashboard based on TailAdmin, providing UI components for data
visualization, user management, forms, tables, charts, and authentication. Built with
Next.js 15 App Router and React Server Components.

## Backend
AWS Lambda functions for serverless backend processing.

## Infrastructure
AWS CDK-based infrastructure as code (IaC) for deploying the application on AWS.

## Target Deployment
The application is deployed on **OpenNext (CloudFront + Lambda + S3)** — a Next.js-specific
serverless adapter — chosen for full Next.js feature support (SSR, ISR, Middleware, Image
Optimization), pay-per-request cost (typically < $1 USD/month at low traffic), global CDN
delivery via CloudFront, and complete IaC management through CDK.

> The project originally targeted AWS AppRunner; see [`../infra/docs/reference/migration-plan.md`](../infra/docs/reference/migration-plan.md)
> for the rationale behind the move to OpenNext.
