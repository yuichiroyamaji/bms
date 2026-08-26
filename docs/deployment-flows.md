# Deployment Flows

How this project gets onto AWS.

| Path | When |
|---|---|
| **Manual** | From a developer machine (`cdk deploy`) |
| **CI** | GitHub Actions on push (or Run workflow) |

Step-by-step: [`getting-started.md`](./getting-started.md).

**Account-pinning (both paths)**

- `infra/bin/app.ts` sets each stack `env.account` from `awsAccountId` in `infra/config/app-config.ts`.
- CDK **refuses** to deploy if active credentials (local profile **or** assumed CI role) are a different account.

## Manual (local)

`InfraStack` and `AppStack` are **independent** (no cross-stack refs). Two CLI commands, either order.

| Stack | Redeploy when |
|---|---|
| `InfraStack` | OIDC / IAM (or other long-lived infra) changes — rare today |
| `AppStack` | Every app ship |

Do **not** read the diagrams as “AppStack waits on InfraStack.”

### InfraStack (GitHub OIDC + IAM role)

```mermaid
flowchart TD
    subgraph Setup["🔧 One-time setup (per repo copy)"]
        A(["set githubRepo & awsAccountId<br/>in infra/config/app-config.ts<br/>(devConfig & prodConfig)"])
    end

    A -.->|"done once, then whenever InfraStack changes"| C["export AWS_PROFILE=bms<br/>(or SSO login) — manual, every session"]
    C --> D["aws sts get-caller-identity<br/>(optional early sanity check)"]
    D --> E["npx cdk deploy InfraStack-&lt;env&gt; -c environment=dev|prod"]
    E --> F{"Active credentials'<br/>account == awsAccountId<br/>for this environment?"}
    F -- No --> G["❌ CDK throws error<br/>deploy aborted"]
    F -- Yes --> H["✅ InfraStack deployed:<br/>GitHub OIDC provider + IAM role created"]

    H -.->|"one-time follow-up (only redo if the ARN changes)"| Followup

    subgraph Followup["🔧 One-time follow-up"]
        I(["Copy GitHubActionsRoleArn output"])
        J(["Set GitHub repo secrets:<br/>AWS_ROLE_ARN, AWS_REGION"])
        I --> J
    end

    style Setup fill:#eceff1,stroke:#455a64,stroke-width:2px,stroke-dasharray: 5 5,color:#1c2529
    style Followup fill:#eceff1,stroke:#455a64,stroke-width:2px,stroke-dasharray: 5 5,color:#1c2529

    classDef guard fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#5c2400
    classDef fail fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#6b1414
    classDef success fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#10401b
    classDef setup fill:#cfd8dc,stroke:#455a64,stroke-width:1px,color:#1c2529
    class F guard
    class G fail
    class H success
    class A,I,J setup
```

| Styled as one-time | Why |
|---|---|
| Config edit (`Setup`) | Once per repo copy |
| Secret wiring (`Followup`) | Redo only if the role ARN changes |
| **Not** the deploy (`C`–`H`) | Today InfraStack is mostly OIDC, but it is the home for longer-lived infra (DB, cache, …). Calling the deploy “one-time” would go stale when that grows. |

### AppStack (the Next.js app)

Prerequisite: `awsAccountId` already set in `app-config.ts` (shared config, not created by this stack).

```mermaid
flowchart TD
    A["export AWS_PROFILE=bms<br/>(or SSO login) — manual, every session"] --> B["aws sts get-caller-identity<br/>(optional early sanity check)"]
    B --> C["npm run deploy:dev / deploy:prod<br/>(cdk deploy AppStack-&lt;env&gt; -c environment=&lt;env&gt;)"]
    C --> D{"Active credentials'<br/>account == awsAccountId<br/>for this environment?"}
    D -- No --> E["❌ CDK throws error<br/>deploy aborted"]
    D -- Yes --> F["✅ AppStack deployed:<br/>CloudFront + Lambda + S3 (OpenNext)"]

    classDef guard fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#5c2400
    classDef fail fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#6b1414
    classDef success fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#10401b
    class D guard
    class E fail
    class F success
```

- Nothing auto-selects the AWS account. `export AWS_PROFILE=...` every session, for **each** stack.
- Pinning only **fails loud** on a wrong profile (no silent wrong-account deploy).
- Two CLI invocations → a mix-up can pass for one stack and fail the other.

## CI (GitHub Actions)

```mermaid
flowchart TD
    A["git push to develop or main<br/>(or manual 'Run workflow')"] --> B["'Determine environment' step:<br/>branch or input → environment=dev|prod"]
    B --> C["'Configure AWS credentials' step:<br/>assume AWS_ROLE_ARN via GitHub OIDC"]
    C --> D["Temporary AWS credentials<br/>for this job"]
    D --> E["npx cdk deploy AppStack-&lt;env&gt;<br/>-c environment=${environment}"]
    E --> F{"Assumed role's account ==<br/>awsAccountId for this<br/>environment in app-config.ts?"}
    F -- No --> G["❌ CDK throws error<br/>workflow run fails"]
    F -- Yes --> H["✅ AppStack deployed:<br/>CloudFront + Lambda + S3 (OpenNext)"]

    classDef guard fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#5c2400
    classDef fail fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#6b1414
    classDef success fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#10401b
    class F guard
    class G fail
    class H success
```

| Trigger | Environment |
|---|---|
| Push `develop` | `dev` |
| Push `main` | `prod` |
| Run workflow | `dev` or `prod` (input) |

- One `AWS_ROLE_ARN` / `AWS_REGION` secret pair is shared by both envs.
- Fine while `dev` and `prod` share `awsAccountId`.
- Split accounts later → node `F` fails for the unmatched env. Then add `AWS_ROLE_ARN_DEV` / `AWS_ROLE_ARN_PROD` and pick by environment (not implemented yet).

## See also

- [`getting-started.md`](./getting-started.md) — setup steps
- [`../infra/docs/deployment.md`](../infra/docs/deployment.md) — OpenNext architecture, env vars, domain, troubleshooting
