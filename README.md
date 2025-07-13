# boid-wasm-sim

WebAssembly を使った群れシミュレーションの実装です。

## 概要

Craig Reynolds の Boid モデルに基づく群れの動きをシミュレートします。パフォーマンスを重視して AssemblyScript で実装し、WebAssembly として実行します。

## 必要環境

- [mise](https://github.com/jdx/mise) - 開発環境管理ツール
- Node.js 24（mise で自動インストール）
- pnpm（mise で自動インストール）

## セットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd boid-wasm-sim

# mise の設定を信頼
mise trust

# 依存関係のインストール
pnpm install
# または
make install
```

## 開発

```bash
# 開発サーバーの起動（全パッケージ並行起動）
pnpm dev
# または
make dev
# または
mise run dev

# 個別パッケージの開発
pnpm web:dev        # Webアプリケーションのみ
pnpm wasm:dev       # WASMモジュールのみ
pnpm components:dev # コンポーネントのみ
```

## ビルド

```bash
# 全パッケージのビルド（依存関係順）
pnpm build
# または
make build

# 個別パッケージのビルド
pnpm components:build  # UIコンポーネント
pnpm wasm:build       # WASMモジュール
pnpm web:build        # Webアプリケーション

# クリーンビルド
pnpm rebuild
# または
make clean && make build
```

## テスト

```bash
# 全テストの実行
pnpm test
# または
make test

# 個別パッケージのテスト
pnpm components:test  # UIコンポーネントテスト
pnpm wasm:test       # WASMモジュールテスト
pnpm web:test        # Webアプリケーションテスト

# テスト（カバレッジ付き）
pnpm components:test:coverage
```

## コード品質

```bash
# リント
pnpm lint
pnpm lint:fix  # 自動修正

# フォーマット
pnpm format:fix

# 型チェック
pnpm typecheck

# 全チェック
pnpm check
pnpm check:fix  # 自動修正
```

開発サーバーは http://localhost:5173/ で起動します。

## プロジェクト構成

```
boid-wasm-sim/
├── web/
│   ├── components/       # @boid-wasm-sim/components - UIコンポーネントライブラリ
│   │   ├── src/
│   │   │   ├── *.tsx    # Reactコンポーネント
│   │   │   ├── *.test.tsx # テストファイル
│   │   │   └── index.ts  # エクスポート定義
│   │   └── package.json
│   └── main/            # @boid-wasm-sim/web - メインアプリケーション
│       ├── src/
│       │   ├── App.tsx   # メインアプリ
│       │   └── main.tsx  # エントリーポイント
│       ├── index.html
│       └── package.json
├── wasm/               # @boid-wasm-sim/wasm - AssemblyScriptモジュール
│   ├── assembly/
│   │   ├── types.ts        # 型定義
│   │   ├── boid-simulation.ts # コアロジック
│   │   ├── index.ts        # エクスポート
│   │   └── __tests__/      # テストファイル
│   ├── build/          # WASMビルド出力
│   └── package.json
├── package.json        # ワークスペース設定
├── pnpm-workspace.yaml # pnpm設定
├── Makefile           # ビルドコマンド
├── .mise.toml         # 開発環境設定
└── biome.json         # リント・フォーマット設定
```

### パッケージ構成

- **@boid-wasm-sim/components**: 再利用可能なUIコンポーネント
- **@boid-wasm-sim/web**: メインWebアプリケーション  
- **@boid-wasm-sim/wasm**: boidシミュレーションのコアロジック

## 機能

- **群れの動き**: 分離・整列・結合の 3 つの基本ルール
- **インタラクティブ**: マウスカーソルを障害物として回避
- **リアルタイム調整**: 各パラメータをスライダーで調整可能
- **パフォーマンス**: WebAssembly による高速な計算

## 技術スタック

- **Frontend**: Vite v7, Tailwind CSS v4, shadcn/ui
- **WebAssembly**: AssemblyScript
- **ビルドツール**: Vite
- **パッケージ管理**: pnpm workspace

## ライセンス

MIT
