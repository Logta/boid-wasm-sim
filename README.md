# boid-wasm-sim

Craig ReynoldsのBoidモデルを参考に作成したシンプルな群れシミュレーションです。

## 概要

基本的な群れの動きをリアルタイムで表示するWebアプリケーションです。Goで実装したWebAssemblyモジュールとReactフロントエンドで構成されています。t-wadaのTDD手法を参考に開発しました。

## 特徴

- Go WebAssemblyによる計算処理
- 78のテストケースによる動作確認
- リアルタイムパラメータ調整
- Tailwind CSS v4を使用したUI
- pnpm workspaceによるプロジェクト管理

## 必要環境

- [mise](https://github.com/jdx/mise) - 開発環境管理ツール
- Go 1.24.5（mise で自動インストール）
- Node.js 24.4.0（mise で自動インストール）
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

# WASMランタイムのセットアップ
pnpm wasm:copy-runtime
```

## 開発

```bash
# 開発サーバーの起動（全パッケージ並行起動）
pnpm dev
# または
mise run dev

# 個別パッケージの開発
pnpm web:dev        # Webアプリケーションのみ
pnpm wasm:dev       # Go WASMモジュールのみ
pnpm components:dev # UIコンポーネントのみ
```

開発サーバーは http://localhost:5173/ で起動します。

## ビルド

```bash
# 全パッケージのビルド（依存関係順）
pnpm build

# 個別パッケージのビルド
pnpm components:build  # UIコンポーネント
pnpm wasm:build       # Go WASMモジュール
pnpm web:build        # Webアプリケーション

# クリーンビルド
pnpm clean && pnpm build
```

## テスト

```bash
# 全テストの実行
pnpm test

# 個別パッケージのテスト
pnpm components:test  # UIコンポーネントテスト (64テスト)
pnpm wasm:test       # Go WASMモジュールテスト (18テスト)
pnpm web:test        # Webアプリケーションテスト (14テスト)

# 全テスト（WASMテスト含む）
pnpm test:all
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

## プロジェクト構成

```
boid-wasm-sim/
├── web/
│   ├── components/       # @boid-wasm-sim/components - UIコンポーネントライブラリ
│   │   ├── src/
│   │   │   ├── *.tsx    # Reactコンポーネント
│   │   │   ├── *.test.tsx # テストファイル (64テスト)
│   │   │   ├── hooks/   # カスタムフック
│   │   │   └── index.ts # エクスポート定義
│   │   └── package.json
│   └── main/            # @boid-wasm-sim/web - メインアプリケーション
│       ├── src/
│       │   ├── App.tsx   # メインアプリ
│       │   └── main.tsx  # エントリーポイント
│       ├── public/
│       │   ├── boid.wasm     # Go WASMモジュール (約2MB)
│       │   └── wasm_exec.js  # Go WASMランタイム
│       ├── index.html
│       └── package.json
├── wasm/               # @boid-wasm-sim/wasm - Go WASMモジュール
│   ├── *.go            # Goソースファイル
│   ├── *_test.go       # テストファイル (18テスト)
│   ├── go.mod          # Goモジュール定義
│   ├── boid.wasm       # ビルド済みWASMファイル
│   ├── wasm_exec.js    # Go WASMランタイム
│   └── package.json
├── package.json        # ワークスペース設定
├── pnpm-workspace.yaml # pnpm設定
├── .mise.toml         # 開発環境設定
└── biome.json         # リント・フォーマット設定
```

### パッケージ構成

- **@boid-wasm-sim/components**: 再利用可能なUIコンポーネント (React + TypeScript)
- **@boid-wasm-sim/web**: メインWebアプリケーション (Vite + React)
- **@boid-wasm-sim/wasm**: Go WebAssemblyによるボイドシミュレーション

## 機能

### コア機能
- 分離・整列・結合の3つの基本的な群れ行動
- マウスカーソルからの回避行動
- トーラス境界でのシームレスな画面ループ

### UI機能
- 各パラメータのスライダー調整
- 再生・一時停止・リセット操作
- ボイド数の切り替え（100・500・1000匹）
- パフォーマンス情報の表示（FPS等）

### 調整可能なパラメータ
- 分離行動の半径と強度
- 整列行動の半径と強度
- 結合行動の半径と強度
- マウス回避距離

## 技術スタック

### フロントエンド
- React + TypeScript
- Vite 6.3（ビルドツール）
- Tailwind CSS v4（スタイリング）
- 自作UIコンポーネントライブラリ
- Vitest + React Testing Library（テスト）

### WebAssembly
- Go 1.24.5
- 約2MBのWASMファイル
- Go WASMランタイム
- Go標準テストツール

### 開発環境
- pnpm workspace（パッケージ管理）
- mise（環境管理）
- Biome（lint + format）

## パフォーマンス

学習目的で作成したため、最適化の余地があります：
- 60FPSでの動作を目標
- 1000ボイドまで対応
- WebAssemblyによる計算処理

## ライセンス

MIT
