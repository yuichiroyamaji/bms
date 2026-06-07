|カテゴリ|利用技術|Status|
|---|---|--|
|フロントエンド|Next.js|インストール済|
|ホスティング|OpenNext (CloudFront + Lambda + S3)|実装中|
|認証|Cognito|未実装|
|サーバーログ|Pino|インストール済|
|外部ログ出力先|AWS CloudWatch, Sentry|未実装|
|エラー解析|Sentry|未実装|
|ORM|Prisma|インストール済|
|linter/formatter|Biome|インストール済|
|単体テスト|Jest|インストール済|
|E2Eテスト|Playwright|未実装|
|in-memory Cash|AWS Redis|未実装|

## Hosting Service選定経緯

【候補①】Amplify

---

→ 完全サーバーレスのためコスト的には最適

→ Next.jsをAmplifyで動かすと以下のような制約がある

- SSR関数（Lambda-like）のserver bumdleのサイズが220MBという制限がある
- ISR, On-Demand ISR（revalidatePath/revalidateTag）が使えない
- cold startのためSSRのresponseが遅い（1〜3秒もあり得る）
- 特殊な実装でNext.jsアプリをサーバーレス可しており、実装がBlack-Box化されている

→ つまりSSG + CSRの構成でDeployすればAmplifyで問題なくHostできるが、Next.jsの前提となるSSRや最新のcache機能が使えない

→ また、Amplifyは独立したコマンドによる管理となるため、CDKで一元管理できない

→ 結論：❌

---

【候補②】ECS Fargate

---

→ 柔軟な設計が可能だがALBや常時起動によりコストが高い

→ 対象のアプリにはoverkill

→ 結論：❌

---

【候補③】AppRunner

---

→ コンテナベースのため、Next.jsの機能をFullで実行可能

→ CDKで完全IaCにて一元管理可能

→ Always-warmでSSRが高速･安定

→ bundleサイズの制限なし

→ 最小構成で構築すれば月額$3~5 USD

→ **2026年4月30日をもって新規顧客への提供を終了。既存顧客は継続利用可能だが新機能追加なし。**

→ 結論：❌（廃止方向のため移行）

---

【候補④】OpenNext (CloudFront + Lambda + S3)

---

→ Next.js専用のオープンソースアダプター。SSR・ISR・Middleware・Image Optimizationをそれぞれ最適なAWSサービスにマッピング

→ CDKで完全IaCにて一元管理可能（`cdk-nextjs-standalone` Constructを使用）

→ サーバーレスのためリクエスト課金。トラフィックが少ない時間帯はほぼコスト0

→ CloudFrontが標準搭載されるためグローバルCDNによる高速配信が可能

→ Dockerfile不要。コンテナ管理から解放

→ ISRキャッシュはS3で管理。revalidation用のSQS+Lambdaも自動プロビジョニング

→ コールドスタートあり（Lambda初回起動時：約200〜500ms）。ただし管理画面用途のため許容範囲

→ 結論：⭕️（採用！）

## Development Tools

- **Linter / Formatter**: Biome
- **Unit testing**: Jest
- **E2E testing**: Playwright (planned)
- **Package manager**: npm
- **ORM**: Prisma

## Installation Notes

- Use `--legacy-peer-deps` if you hit peer-dependency errors during `npm install`.
- Node.js 18.x or later required (20.x+ recommended).
- Windows users should clone the repo near the drive root to avoid path-length issues.

> Per-domain run commands live in each domain's `CLAUDE.md`
> (`frontend/CLAUDE.md`, `infra/CLAUDE.md`).