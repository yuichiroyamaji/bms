# Troubleshooting — OpenNext on AWS

Symptom-driven guide for the current **OpenNext (CloudFront + Lambda + S3)** deployment.

> The retired AppRunner equivalent lives in [`_archive-apprunner/troubleshooting.md`](./_archive-apprunner/troubleshooting.md)
> and does **not** apply here — it covers Docker builds and AppRunner services that no longer exist.

## Who owns what (read this first)

Most confusing failures come from misattributing a problem to the wrong layer. The three
layers are strictly separated:

| Layer | Owns | Does **not** own |
|---|---|---|
| **OpenNext** (`@opennextjs/aws`, a `frontend/` dependency) | `next build` → Lambda-shaped code bundles + static assets in `frontend/.open-next/` | Anything on AWS. It emits no CloudFormation, no IAM, no policies, and never calls AWS. |
| **`aws-cdk-lib`** | L2 construct helpers (`FunctionUrlOrigin`, `S3BucketOrigin`, …) | Guaranteeing those helpers grant *every* permission AWS requires — see the OAC entry below. |
| **`infra/lib/constructs/open-next-site.ts`** | Every AWS resource, every IAM grant, all wiring | Building the frontend — it only *reads* `frontend/.open-next/`. |

Practical consequence: **if the problem is an AWS resource or a permission, it is in `infra/`,
never in OpenNext.** This construct is hand-rolled; it is not `cdk-nextjs-standalone`, so no
third party is filling gaps for you.

---

## CloudFront returns 403 on every SSR / image request

**Symptoms**

- `/` and any SSR route return `403`, body:
  `{"Message":"Forbidden. For troubleshooting Function URL authorization issues, see: …"}`
- Response header `x-amzn-errortype: AccessDeniedException`
- Static assets (S3 origin) return **200** — only the Lambda origins fail
- Lambda `Invocations` metric is **0** — the function is never entered
- Every piece of config inspects as correct: OAC `sigv4`/`always`/`lambda`, function URL
  `AuthType: AWS_IAM`, resource policy with the right `AWS:SourceArn`

**Cause**

CloudFront OAC in front of a Lambda function URL requires **two** grants for the
`cloudfront.amazonaws.com` service principal. `FunctionUrlOrigin.withOriginAccessControl()`
auto-grants only the first:

| Permission | Granted by CDK helper |
|---|---|
| `lambda:InvokeFunctionUrl` | yes |
| `lambda:InvokeFunction` | **no — you must add it** |

Authoritative source: [Restrict access to an AWS Lambda function URL origin](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-lambda.html),
which lists both `aws lambda add-permission` calls. (AWS's *blog post* on the same feature
shows only `InvokeFunctionUrl`; the developer guide is the one that matches reality here.)

**Fix** — already applied in `open-next-site.ts`; keep it when refactoring:

```typescript
// Declared AFTER the Distribution so distributionId resolves. No cycle: the
// Distribution depends on the function URLs, these permissions depend on the
// Distribution, and the functions never depend back.
fn.addPermission('ServerFunctionCloudFrontInvoke', {
  principal: new iam.ServicePrincipal('cloudfront.amazonaws.com'),
  action: 'lambda:InvokeFunction',
  sourceArn: `arn:aws:cloudfront::${account}:distribution/${distribution.distributionId}`,
});
```

**Do not chase these dead ends** (all were investigated and ruled out):

- *Forwarding the viewer `Authorization` header does not suppress OAC signing.* With
  `SigningBehavior: always` — what this stack uses — AWS overwrites the viewer's
  `Authorization` header with its own SigV4 signature. Only `no-override` defers to the
  viewer. Swapping the origin request policy changes nothing.
- Not OAC signing protocol, origin protocol policy, or CloudFront Functions.
- Not propagation delay — CloudFront reported `Deployed` and the 403 persisted for minutes.

**How to isolate this class of bug**

Rather than re-reading config that already looks correct, prove which layer is broken. Send a
hand-signed SigV4 request straight to the function URL:

```bash
uv run --with botocore --with requests python - <<'EOF'
import botocore.session, requests
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
url = "https://<fn-url-id>.lambda-url.<region>.on.aws/"
creds = botocore.session.get_session().get_credentials().get_frozen_credentials()
req = AWSRequest(method="GET", url=url)
SigV4Auth(creds, "lambda", "<region>").add_auth(req)
r = requests.get(url, headers=dict(req.headers), timeout=30)
print(r.status_code, r.text[:200])
EOF
```

**200** means the function, its URL, and `AWS_IAM` auth are all healthy — narrowing the fault
to CloudFront's principal (i.e. the resource policy). **403** means look further upstream.

---

## Deploy fails: InitInvoker `lambda:InvokeFunction` AccessDenied

**Symptoms**

- `AppStack-*/Site/InitInvoker` CREATE_FAILED during deploy
- Message like: custom-resource role `… is not authorized to perform: lambda:InvokeFunction`
  on `…SiteInitFunction…`
- Rollback may then hit `ROLLBACK_FAILED` if the site S3 bucket is not empty

**Cause**

`AwsCustomResourcePolicy.fromSdkCalls()` translates SDK action `invoke` to IAM
`lambda:Invoke`, which is **not** a valid action. Lambda requires `lambda:InvokeFunction`.
CDK documents this as a known exception for `fromSdkCalls`.

**Fix** — already applied in `open-next-site.ts`; keep the explicit statement:

```typescript
policy: cr.AwsCustomResourcePolicy.fromStatements([
  new iam.PolicyStatement({
    actions: ['lambda:InvokeFunction'],
    resources: [initFunction.functionArn],
  }),
]),
```

**If the stack is already `ROLLBACK_FAILED`:** empty/delete the leftover site bucket, delete
the stack in CloudFormation, then redeploy.

---

## CI fails: `SSM parameter /cdk-bootstrap/hnb659fds/version not found`

**Cause** — the target region was never bootstrapped. This bites even when your main region
is fine, because `MonitoringStack` deploys to **us-east-1** regardless of `awsRegion`:
CloudFront publishes its metrics only there, so the 5xx alarm must live there.

**Fix**

```bash
cd infra
npx cdk bootstrap aws://<account-id>/us-east-1 -c environment=dev
```

Verify both regions afterwards:

```bash
aws ssm get-parameter --name /cdk-bootstrap/hnb659fds/version --region ap-northeast-1
aws ssm get-parameter --name /cdk-bootstrap/hnb659fds/version --region us-east-1
```

---

## CI fails: `ValidationError: Cannot find asset at …/frontend/.open-next/assets`

**Cause** — the OpenNext bundle wasn't built before CDK ran. CDK reads
`frontend/.open-next/` as a plain directory and does **not** build it for you.

This also breaks *any* local `cdk` command — including `bootstrap` — because `app.js`
synthesizes all stacks on every invocation.

**Fix**

```bash
cd frontend && npm run build:open-next
```

Re-run it whenever frontend code changes. `npm run deploy:dev` does **not** do this for you;
its `npm run build` step compiles the *infra* TypeScript only.

---

## Stack stuck showing `UPDATE_ROLLBACK_COMPLETE`

`UPDATE_ROLLBACK_COMPLETE` is a **healthy, deployable** terminal state (unlike
`UPDATE_ROLLBACK_FAILED`) and needs no repair. The label is historical, not live: it records
the last rollback and is only overwritten by the next successful *actual* update. If the
template already matches reality, `cdk deploy` reports "no changes" and the label persists.

Don't invent a no-op change to clear it. Confirm health directly instead — check the stack's
outputs and resources, or that dependent systems still work.

---

## Stack name / export name collisions with another project

**Symptom** — `Export with name X is already exported by stack Y`, or a deploy that silently
targets another project's stacks.

**Cause** — CloudFormation stack names, IAM role names, and CFN export names are unique per
**account**, not per stack. Two projects built from this template in one AWS account collide.

**Fix** — set a distinct `resourcePrefix` in `infra/config/app-config.ts`; it drives all
account-scoped names. See [getting-started.md](../../docs/getting-started.md) for the full
explanation, including why identical stack names are more dangerous than a failed deploy
(CDK matches deployments by stack name, so it *updates the other project's stacks*).

---

## Diagnostic commands

```bash
# Which account am I actually pointed at?
aws sts get-caller-identity

# Stack status + outputs
aws cloudformation describe-stacks --stack-name bms-app-dev --region ap-northeast-1 \
  --query 'Stacks[0].[StackStatus,LastUpdatedTime,Outputs]'

# Why did it fail? (most recent events first)
aws cloudformation describe-stack-events --stack-name bms-app-dev --region ap-northeast-1 \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`||ResourceStatus==`UPDATE_FAILED`]'

# Who owns a conflicting export?
aws cloudformation list-exports --region ap-northeast-1

# Is the function being invoked at all? (0 ⇒ rejected before invocation)
aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Invocations \
  --dimensions Name=FunctionName,Value=<fn-name> --start-time "$(date -u -v-1H +%FT%TZ)" \
  --end-time "$(date -u +%FT%TZ)" --period 300 --statistics Sum --region ap-northeast-1

# Server function logs
aws logs tail /aws/lambda/<fn-name> --follow --region ap-northeast-1

# Preview changes before deploying
npx cdk diff AppStack-dev -c environment=dev
```

> `LastUpdatedTime` above is deliberate: the CloudFormation **console lists "Created time" by
> default**, which never changes after creation and makes fresh deploys look like they never
> happened. Enable the "Last updated time" column (⚙ icon) or check a stack's Events tab.
> Also remember `bms-monitoring-*` is in **us-east-1** and won't appear in a Tokyo stack list.

## See also

- [deployment.md](./deployment.md) — the deployment guide
- [../../docs/getting-started.md](../../docs/getting-started.md) — first-deploy and account setup
- [aws-infrastructure-diagram.md](./aws-infrastructure-diagram.md) — architecture
