# 構築
>Jestのインストール
```
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom
```
>typescriptに対応させる
```
npm install --save-dev ts-jest ts-node @types/jest
```
>jest.config.jsを作成する

必要なライブラリのインストールが終わったら、Next.jsのルートディレクトリにjest.config.jsを作成。jest.config.jsの中身は以下のように記述。

(jest.config.js)
```typescript
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    },
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['next/babel'] }],
    },
    globals: {
        'ts-jest': {
            tsconfig: {
                jsx: 'react-jsx',
            },
        },
    },
};
```
>tsconfig.jsonを編集する
Next.jsのルートディレクトリにある

tsconfig.jsonの中身を編集

(tsconfig.json)
```json
{
  "exclude": [
    "node_modules",
    "out",
    ".next",
    "**/*.test.ts",
    "**/*.test.tsx"
  ]
}
```
>package.jsonにscriptを追加
```json
"scripts": {
  "test": "jest"
}
```
>任意の場所でテストファイルをを作成

(sample.test.tsx)
```typescript
import React, { ReactElement } from 'react';
import { render, screen, fireEvent } from "@testing-library/react";
import Sample from "../components/Sample";

describe("Sample", () => {
    it("コンポーネントのレンダリングのテスト", async () => {
        render(<Sample/>);
    });
});
```
>テストを実行
```
npm run test
```