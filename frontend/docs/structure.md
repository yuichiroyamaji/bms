## SRCディレクトリ構成
src  
|  
+-- app        # Routing files（Next.jsが標準で提供するファイル）  
|  
+-- components # 横断的（ドメインに依存しない）なUIコンポーネント（ロジックがない共通コンポーンネント）  
| &emsp;+-- common # アプリケーションの他の部分で再利用する可能性のあるコンポーネント  
| &emsp;+-- ui # 一般的なUIコンポーネント(ボタン、テーブル、モーダルなど)  
|  
+-- features   # 特定のドメイン・機能に関係するファイルをモジュール的にまとめる  
| &emsp;+-- sample (モジュール名)  
| &emsp;&emsp;&emsp;+-- components # コンポーネント  
| &emsp;&emsp;&emsp;&emsp;&emsp;+-- children # 子コンポーネント  
| &emsp;&emsp;&emsp;&emsp;&emsp;+-- common # 対象のfeaturesの中のみで利用する共通コンポーネント  
| &emsp;&emsp;&emsp;&emsp;&emsp;+-- ui # 対象のfeaturesの中のみで利用するようにカスタムしたUI（ボタンなど）  
| &emsp;&emsp;&emsp;+-- hooks # UIロジック  
| &emsp;&emsp;&emsp;&emsp; ※↑↑↑ Container/Presentationalパターンによる分離  
| &emsp;&emsp;&emsp;+-- actions # サーバーアクション  
| &emsp;&emsp;&emsp;+-- contexts # useContextを使う場合  
| &emsp;&emsp;&emsp;+-- types # 型定義  
| &emsp;&emsp;&emsp;+-- services # 対象のfeaturesの中のみで共通利用する機能  
| &emsp;&emsp;&emsp;+-- utils # 対象のfeaturesの中のみで共通利用する関数  
| &emsp;&emsp;&emsp;+-- logics # 上記に該当しないサーバー側ビジネスロジック  
| &emsp;&emsp;&emsp;+-- test # actions, logicsなどビジネスロジックに対するテストコード  
|  
+-- hooks      # ドメインに依存しない、横断的なhooks(UIロジック)  
|  
+-- contexts   # アプリケーションプロバイダー。コンポーネントを跨いで横断的に利用したい定数を提供  
|  
+-- utils      # 横断的な汎用関数  
|  
+-- services   # 横断的な汎用機能  
|  
+-- data       # placeholderとして使用するデータやPrismaでのクエリなどのデータ関連ファイルを格納
|  
+-- constants  # 横断的な定数  
|  
+-- types      # 横断的な型定義  
|  
+-- lib        # ライブラリの処理や標準処理を共通化したコード  
|  
+-- tests      # 自動テスト関連  

---
### 各ディレクトリの役割 
### app: 
- ルーティングの責務を持つディレクトリ。Routing files（Next.jsが標準で提供するファイル。page.tsxやlayout.tsxなど）のみを配置します
### components: 
- ボタンやモーダルなど、再利用可能でドメインに依存しないUIコンポーネントを格納します。
### features: 
- 特定の機能に関連するファイルを集約し、機能ごとのサブディレクトリに格納しています。例えば、ユーザー管理機能に関連するコンポーネント、hooks、ユーティリティ関数、型定義などをこのディレクトリ内でまとめます。
### hooks:
- グローバルに使用されるカスタムフックを格納します。ドメインに依存しない汎用的なロジックはここにまとめます。
### contexts:
- ReactのContext APIやその他のプロバイダーを配置します。グローバルな状態管理やテーマ設定など、アプリケーション全体で使用されるプロバイダーをここに集約します。
### utils:
- 簡潔で再利用可能なユーティリティ関数を格納します。これには、日付処理、文字列操作、API通信など、特定のドメインに依存しない関数が含まれます。
### services:
- 簡潔で再利用可能なサービス機能を格納します。これには、CSVダウンロード機能、CSV変換機能など、特定のドメインに依存しない機能が含まれます。utilsは処理の一部として再利用可能な「関数」であるのに対し、サービスはそれ単体で成り立つ「機能」を指します。
### constants:
- アプリケーション全体で使用される定数を格納します。
### types:
- TypeScriptの型定義をまとめます。
### styles:
- グローバルスタイルやテーマ設定、Tailwind CSSのカスタマイズを含むスタイルシートをここに配置します。
### lib:
- プロジェクト内で再利用されるライブラリや、外部ライブラリの実装をここに格納します。
### tests:
- ユニットテストや統合テストなど、自動テストに関連するファイルを格納します。

## 参考文献
- https://zenn.dev/collabostyle/articles/8cbceb572d42cd
