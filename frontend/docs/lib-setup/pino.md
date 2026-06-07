# 構築

pinoのインストール
```
npm install pino
```

サーバーログの出力ファイルは以下で指定していしている
>/constants/constants.ts
```typescript
// ログファイルパス
export const SERVER_LOG_FILE_PATH = 'src/data/logs/server.log';
```
logger.tsの作成、設定
```typescript
import pino from 'pino';
import { SERVER_LOG_FILE_PATH } from '@/constants';
import { datetimeStrWithMs } from '@/utils/datetimeStr';

...

function getServerLogger() {
  if (!serverLogger && !isEdgeRuntime && typeof window === 'undefined') {
    // Only create logger in Node.js server environment
    try {
      // Dynamic import to avoid build-time resolution
      const fs = require('fs');
      serverLogger = pino(
        {
          level: 'info',
          timestamp: () => `,"time":"${datetimeStrWithMs()}"`,
          formatters: {
            level: (label) => {
              return { level: label };
            },
          },
        },
        fs.createWriteStream(SERVER_LOG_FILE_PATH, { flags: 'a' })
      );
    } catch (error) {
      console.error('Failed to create server logger:', error);
    }
  }
  return serverLogger;
}
...
```
※pino-prettyはinstallしたがEdgeRuntime(middleware)では動作しなかったため断念

# 運用
=> conding_rule.md 「ログの記述ルール」参照

