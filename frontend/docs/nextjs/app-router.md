## AppRouterが識別するファイル名とその役割
- default.tsx: デフォルトの画面
- error.tsx: 404エラー画面
- layout.tsx: 共通のUIを設定する
- loading.tsx: ローディング画面
- middleware.tsx: リクエストが完了する前に実行されるコードを定義
- not-found.tsx: notFound関数がスローされたときに表示する画面
- page.tsx: ルートの画面
- route.tsx: APIエンドポイントを定義
- template.tsx: 共通のUI。layout.tsxとは異なり、状態を保持せず、毎回再レンダリングされる