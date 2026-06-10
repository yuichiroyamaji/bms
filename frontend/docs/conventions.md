## Summary

1. コンポーネント関数の宣言はfunctionを使用する。functionの中の関数はアロー関数は使用する。
2. 関数の「default」は宣言時に関数に付与する（ファイルの末尾で「export default 関数名」は記述しない）
3. ComponentのPropsの型定義は「interface」、それ以外の型定義には「type」を使用する
4. ログの記述ルール
5. カスタムフックの戻り値はオブジェクトにする
6.「services」「utils」配下の関数には以下の説明を含むコメントを記述する
7. 文字列の連結は「+」でなくテンプレートリテラルを使用する
8. フロントからサーバーの処理を実行する際は、可能な限りAPI RouteではなくServer Actionsで実装する
9. ファイルの命名規則

## 1. コンポーネント関数の宣言はfunctionを使用する。functionの中の関数はアロー関数は使用する。
※アロー関数だとexport defaultを含められないため  

(〇)
```typescript
export default function Page() {
  return <h1>Hello Next.js!</h1>
}
```
(×)

```typescript
const Page = () => {
  return <h1>Hello Next.js!</h1>
}
export default Page;
```
※functionの中の関数はアロー関数を使用
```typescript
export default function useCancelOrdersMonthly() {
  ...
  const handleSelectChange = (value: string) => {
    console.log('selectedMonth:', value);
    setSelectedMonth(value);
  };

  const handleDownloadBtn = async () => {
    setIsModalOpen(true);
  };
  ...
```
#### ※「services」や「utils」配下の関数はコンポーネントの中で使用されるので、アロー関数で宣言する
```typescript
export const getLastDayOfMonth = (date: Date): Date => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDay;
};
```

## 2. 関数の「export default」は宣言時に関数に付与する（ファイルの末尾で「export default 関数名」は記述しない）
(〇)
```typescript
export default function sampleFunction(){
  ...
}

```
(×)

```typescript
function sampleFunction(){
  ...
}

export default sampleFunction;
```

## 3. ComponentのPropsの型定義は「interface」、それ以外の型定義には「type」を使用する
(interface)
```typescript
interface LogicCancelOrdersMonthlyProps {
  clientId: number;
  selectedMonth: string;
}

export default async function logicCancelOrdersMonthly({
  clientId,
  selectedMonth,
}: LogicCancelOrdersMonthlyProps) {
  logger.info(`[FUNCTION][START]logicCancelOrdersMonthly(${clientId}, ${selectedMonth})`);
```
(type)
```typescript
export type Chat = {
  avatar: string;
  name: string;
  text: string;
  time: number;
  textCount: number;
  color: string;
};
```
#### ※ComponentのPropsの型定義はComponetファイルの中に記述するが、それ以外のtypeで宣言する型定義は、featuresフォルダの中であればfeaturesフォルダ配下の「types」、横断的に利用する型の場合はsrc直下の「types」に格納する（可読性をあげる意図）

## 4. ログの記述ルール
フロントエンド（クライアントコンポーネント）でログを出力する場合は、javascriptのconsole.log()をそのまま利用する。バックエンド（サーバーコンポーネント）でログを出力する場合、console.log()でターミナルに出力することはできるが、ログファイルには記録されないため、loggerをimportして記述する。loggerを使用してログを出力した場合、そのサーバーログは以下ファイルに出力される。
```
/data/logs/server.log
```
フロントエンド（クライアントコンポーネント）でloggerを使用すると、エラーにはならないが、ブラウザのConsoleで以下のようなWarningが出力される。適宜修正すること。
```
D:\Users\a2182258\Do…b\pino\logger.ts:86 ⚠️クライアントコンポーネントでloggerが使われています。クラアントコンポーネントではconsole.logを使用してください。対象ログ：convertToCsvService
```

### 関数の冒頭/末尾
関数に入ったことがわかるよう、関数の冒頭/末尾で以下のようなログを記述しておく。
```typescript
import { logger } from '@/lib/pino/logger';

interface sampleProps {
  clientId: number;
  selectedMonth: string;
}

export default function sampleFuntion({clientId,selectedMonth}: smpleProps){
  logger.info(`[FUNCTION][START]sampleFuntion(clientId: ${clientId}, selectedMonth: ${selectedMonth})`);
  ...
  logger.info(`[FUNCTION][END]sampleFuntion(reponse: data => BELOW)`);
  logger.infoObj(data);
  return data;
}
```
### エラー処理
```typescript
try {
    ...
  } catch (error) {
    logger.error(`[ERROR]sampleFuntion(errorMessage: ${error})`);
    return null;
  }
```

### DBクエリの戻り値など、オブジェクトを出力する場合
```typescript
logger.infoObj(data);
```
「logger.infoObj()」関数を利用することでログファイル上に以下のような形式で出力されるようになる
```
[DATA][1] rcvorder_id: 250207110012789, shop_order_no: ...
[DATA][2] rcvorder_id: 250207110012790, shop_order_no: ...
[DATA][3] rcvorder_id: 250207110012793, shop_order_no: ...
[DATA][4] rcvorder_id: 250207110012794, shop_order_no: ...
[DATA][5] rcvorder_id: 250207110012795, shop_order_no: ...
```

### その他任意の箇所
ログの目的はトラッキングであることを念頭に、その他必要と判断される箇所があれば各自の判断でログ出力を実装する


## 5. カスタムフックの戻り値はオブジェクトにする
カスタムフック側のreturnで返す値をオブジェクトにすし、
```typescript
export const useCounter = () => {
  ・・・

  return { count, setCount, incrementCount, decrementCount };
};
```
利用する側もオブジェクトで受け取り、そのまま利用可能
```typescript
import { useCounter } from "./hooks";

export const App = () => {
  const { count, setCount, incrementCount, decrementCount } = useCounter();

  return (
    <div>
      <p>{count}</p>
      <button onClick={incrementCount}>+1</button>
      <button onClick={decrementCount}>-1</button>
    </div>
  );
};
```
## 6.「services」「utils」配下の関数には以下の説明を含むコメントを記述する
「services」, 「utils」はプロジェクト全体で共有可能な関数が格納されるため、何を渡せば何が返される関数なのかを明記しておく。またこれらの関数を追加した場合は、**他の開発者が認識できるよう、全員に周知**すること。
- @description: 関数の説明
- @param: 関数のパラメータの説明
- @returns: 関数の戻り値の説明  

(記述例)
```typescript
/**
 * @description ディレクトリ選択機能付きでCSVコンテンツをファイルとしてダウンロード
 * @param csvContent - ダウンロードするCSVコンテンツの文字列
 * @param filename - ダウンロード用の推奨ファイル名（例：'***data_20250623-143052.csv'）
 * @returns ダウンロードが開始されたときに解決されるPromise
 */
export async function csvDownloadService(csvContent: string, filename: string) {
  try {
    // Check if File System Access API is supported
    if (window.showSaveFilePicker) {
      // Use modern File System Access API
      const fileHandle = await window.showSaveFilePicker({
```
## 7. 文字列の連結は「+」でなくテンプレートリテラルを使用する

(×) 「＋」記号
```typescript
msg = 'メッセージ01' + message02 + 'メッセージ03'
```
(〇) テンプレートリテラル
```typescript
msg = `メッセージ01${message02}メッセージ03`
```
※バッククオート（バックティック）で括る

## 8. フロントからサーバーの処理を実行する際は、可能な限りAPI RouteではなくServer Actionsで実装する
◆ Server Actionsの注意点とユースケース
>https://zenn.dev/rio_dev/articles/eb69fae0557f20
1. Server ActionsとAPI Routeの使い分け
- Server Actionsではactionの付いた要素の送信がトリガーとなるので、例えば画面遷移時に処理を走らせたい場合(例:SMS経由でのアカウント認証でユーザーが画面を開く際に、それをトリガーに認証処理を行う)などはServerActionsでなくAPI Routesを使った実装が適している。
2. 状態管理について
- 実際の開発では、useStateとServerActionsで状態を管理させる方法の2種類を使って開発を行う。これは前述の通り、ServerActionsは実装の手段として追加された一つの手段であって、既存の開発手法の全てを完全に覆すようなものではないからです。また、ServerActionsを使う代表的な例であるフォーム実装では、エラー表示が欠かせないため、その際はuseFormStateなどを用いてエラー情報などをクライアント側と同期させるようにする。

※使用例：reference/nextjs/server-actions.md 参照

## 9.ファイル/フォルダの命名規則
### ● ファイルの命名規則
| ファイル種類 | 最初の文字 | 命名規則 | 例 | 拡張子 |
|----------|------------|-------------|---------|------------|
| Componentファイル | 大文字（componentのため） | 内容がわかりやすい名前 | SampleList | .tsx |
| 子Componentファイル | 大文字（componentのため）| 親Component + 記述内容 | SampleListTable | .tsx |
| カスタムフック(UIロジック)ファイル | 小文字（useで始まるため） | "use" + Component名 | useSampleList | .ts |
| サーバーアクションファイル | 大文字（component名継承のため） | Component名 + Actions | SampleListActions | .ts |
| Contextファイル | 大文字（component名継承のため） | 最上位Component名（カテゴリ名） + Context | SampleContext | .ts |
| Serviceファイル | 小文字（関数のため） | 機能内容 + Service | csvDownloadService | .ts |
| Utilファイル | 小文字（関数のため） | 機能内容 | convertDataToCSV | .ts |
| DAOファイル | 小文字（関数のため） | 取得するdata内容がわかる名前 | getCancelOrdersMonthly | .ts |

#### ※「index.ts」について
「index」という名前は、呼出し元で記述しなくても認識される名前のため、あるフォルダ配下にひとつしかファイルを置く必要がない場合などに利用する

### ● フォルダの命名規則
フォルダ名はすべて小文字、単語を連結する際は「-（ハイフン）」を使用すること（例）ui-elements