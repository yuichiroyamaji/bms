## Inbox
- [ ] Decide how to link **GitHub issues ↔ `tasks.md` ↔ Notion tasks** (added 2026-06-07).
  - Open questions: issue granularity (parked); whether tasks become GitHub sub-issues; how/whether Notion mirrors GitHub; single source of truth per layer.
  - When decided, reconcile: `docs/development-process.md` (GitHub mapping), `.github/ISSUE_TEMPLATE/spec.yml`, the `phase:*` labels, and the `/new-feature` flow.

## プロジェクト設定
※Coding Ruleを書きながら進める
- Prismaで生SQLを扱える「TypedSQL」の設定、実装
- Cache設計/実装
  - cacheをサーバー側でcookieを設定して実装
  - 状態管理が必要な値をRedisに格納し、各コンポーネントから呼び出す
  - useContext()を使う必要はあるのか
- ディレクトリ設計
- Linter/Formatterの設定、使用方法ドキュメント化
- テスト（Jest/Playwright）の実装
- ログ出力設定（アプリログ、DBログ）
- エラーハンドリング
- 認証/認可の実装
  - Redisの設定
- typedoc
- React Hook Form→サーバーサイドで動かない→「conform」が良いらしい

## 環境設定
- GitHubのissueを使った課題管理の運用ルールを決める
  - templateの作成、ルールをREADME化
- GitHubへの載せ替え
- GitHub Actionsの活用方法
- CICDの作り直し（現状「develop」が本番扱いになってしまっている）
- Amplifyの設定記録をdocに作成しておく
- Amplifyで環境変数設定、環境ごとの切替設定
- Amplify⇔RDSの接続設定
- CloudWatchへの出力設定