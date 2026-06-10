# 構築
1. Install
```
npm install --save-dev --save-exact @biomejs/biome
```
2. Init
```
npx @biomejs/biome init
```
3. biome.json調整
```
as you like
```
4. 「package.json」にscript追加
```json
"scripts": {
    "dev": "next dev",
    "build": "next build && prisma generate",
    "lint": "next lint", => ESLintベースのため削除    
    "format": "biome format .", =>追記
    "format:write": "biome format --write .", =>追記
    "lint": "biome lint .", =>追記
    "lint:write": "biome lint --write .", =>追記
    "check": "biome check .", =>追記
    "check:write": "biome check --write ." =>追記
  },
```
5. biomeのコマンドを個別で実行。↑のscriptsは「npm run」の後の部分のため、例えばbiomeのformatterを実行したい場合、以下コマンドを打つと
```
npm run format:write
```
以下に変換されて実行される挙動になる
```
biome format --write .
```
# 運用
biome はざっくり以下のコマンドらで実行できます。

- format
- lint
- check  

この時、lint を実行して、それを pass したとしても check コマンドを実行すると以下のようなエラーが出ることがあります。
```
✖ Import statements could be sorted:
```
これは https://biomejs.dev/analyzer/import-sorting/ のルールでエラーが出ています。
どういう事かと言うと、実は Biome は Formatter , Linter の他に Analyzer というツールも提供していて、
check コマンドを実行するとそれを含めた 3 つが実行されるためです。なので基本的には check コマンドで運用するのがいいかと思います。

※ファイルを指定したcheckコマンド実行例
```
npm run check --verbose src/features/cover/report/hooks/useCancelOrdersMonthly.ts
```

### CLI options
Global options applied to all commands
```
--colors=<off|force> — Set the formatting mode for markup: “off” prints everything as plain text, “force” forces the formatting of markup using ANSI even if the console output is determined to be incompatible

--use-server — Connect to a running instance of the Biome daemon server.

--verbose — Print additional diagnostics, and some diagnostics show more information. Also, print out what files were processed and which ones were modified.

--config-path=PATH — Set the file path to the configuration file, or the directory path to find biome.json or biome.jsonc. If used, it disables the default configuration file resolution.

Uses environment variable BIOME_CONFIG_PATH

--max-diagnostics=<none|<NUMBER>> — Cap the amount of diagnostics displayed. When none is provided, the limit is lifted.

[default: 20]

--skip-parse-errors — Skip over files containing syntax errors instead of emitting an error diagnostic.

--no-errors-on-unmatched — Silence errors that would be emitted in case no files were processed during the execution of the command.

--error-on-warnings — Tell Biome to exit with an error code if some diagnostics emit warnings.

--reporter=<json|json-pretty|github|junit|summary|gitlab> — Allows to change how diagnostics and summary are reported.

--log-file=ARG — Optional path to redirect log messages to.

If omitted, logs are printed to stdout.

--log-level=<none|debug|info|warn|error> — The level of logging. In order, from the most verbose to the least verbose: debug, info, warn, error.

The value none won’t show any logging.

[default: none]

--log-kind=<pretty|compact|json> — How the log should look like.

[default: pretty]

--diagnostic-level=<info|warn|error> — The level of diagnostics to show. In order, from the lowest to the most important: info, warn, error. Passing --diagnostic-level=error will cause Biome to print only diagnostics that contain only errors.
