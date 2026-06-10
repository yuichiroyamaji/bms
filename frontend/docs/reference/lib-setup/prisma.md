# 構築
## 1. 「prisma.schema」の作成
### Prisma CLIのインストール
```
npm install @prisma/cli --save-dev
```
### Prisma初期起動
```
npx prisma init
```
=> "/prisma/prisma.schema"が生成される
### 接続先DB設定
Root直下の「.env」ファイル内にて「DATABASE_URL」に接続先DBのURLを記述
```
DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres?schema=echbusr"
```
※クエリパラメータ部分のargumentsの仕様は以下参照
https://www.prisma.io/docs/orm/overview/databases/postgresql#arguments
### 既存DBのテーブル定義をPullしてprisma.schemaを作成
本案件では既存のDBを使用するため、既存DBからテーブル定義をPullしてPrismaのSchemaを自動生成する
```
npx prisma db pull
```
## 2. Prisma Clientのインストール
Prismaを利用してNext.jsからデータベースにアクセスするのに必要。以下コマンドでインストール
```
npm install @prisma/client
```
「root/prisma/schema.prisma」にてClietファイル一式を出力する先のフォルダを必要に応じて変更する。今回はプロジェクトファイルから@ディレクティブでアクセスできるようにしたかったため「src/lib」配下に変更
```diff
generator client {
  provider = "prisma-client-js"
-  output   = "../src/generated/prisma"
+  output   = "../src/lib/prisma/client"
}
```
Prisma Clientは独自のスキーマに合わせて作られているため、Prismaのスキーマファイルが変更されるたびに、以下のコマンドを実行して更新する必要あり
```
npx prisma generate
```
### 依存関連ファイルのインストール
Postgresの依存関連ファイル（Prisma ORM's driver adapter for pg）をインストール
```
npm install @prisma/adapter-pg
```

# 運用
## Prisma Studioの起動
以下コマンドにて、PrismaでPGAdminのようなWeb画面を立ち上げることができる
```
npx prisma studio
```
## Prisma Client API Reference
Prismaで利用できる関数（API）情報  
https://www.prisma.io/docs/orm/reference/prisma-client-reference

(一部抜粋例) 

|| Select
> findUnique()
```typescript
const result = await prisma.rcvorder_dtl.findUnique({
  where: {
    client_id: 3010,
    shop_id: 8634,
    rcvorder_id: 1234567890
  },
});
```
> findFirst()
```typescript
const user = await prisma.shop.findFirst({
  where: { ecfront_id: 13001 },
});
```
> findMany()
```typescript
const user = await prisma.shop.findMany({
  where: { ecfront_id: 13001 },
});
```

|| Create/Update/Delete

>create()
```typescript
const user = await prisma.user.create({
  data: { email: 'alice@prisma.io' },
});
```
>update()
```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: { email: 'alice@prisma.io' },
});
```
>upsert()
```typescript
prisma.User.upsert({
  where: {
    userName: 'Alice',
    profileViews: 1,
    id: 1,
  },
  create: {
    id: 1,
    profileViews: 1,
    userName: 'Alice',
    email: 'alice@prisma.io',
  },
  update: {
    email: 'updated@example.com',
  },
});
```
>delete()
```typescript
const user = await prisma.user.delete({
  where: { id: 1 },
});
```