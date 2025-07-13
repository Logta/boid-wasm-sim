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

# 初期セットアップ（依存関係のインストール、WASM ビルド）
mise run setup
```

## 開発

```bash
# 開発サーバーの起動
mise run dev

# Web アプリケーションのみ起動
mise run web

# WASM モジュールのビルド
mise run wasm
```

開発サーバーは http://localhost:5173/ で起動します。

## プロジェクト構成

```
boid-wasm-sim/
├── web/              # React アプリケーション
│   ├── src/
│   │   ├── components/   # UI コンポーネント
│   │   ├── hooks/        # カスタムフック
│   │   └── main/         # エントリーポイント
│   └── public/
├── wasm/             # AssemblyScript モジュール
│   └── src/core/     # Boid アルゴリズムの実装
├── package.json      # ワークスペース設定
└── .mise.toml       # 開発環境設定
```

## 機能

- **群れの動き**: 分離・整列・結合の 3 つの基本ルール
- **インタラクティブ**: マウスカーソルを障害物として回避
- **リアルタイム調整**: 各パラメータをスライダーで調整可能
- **パフォーマンス**: WebAssembly による高速な計算

## 技術スタック

- **Frontend**: React Router v7, Tailwind CSS v4, shadcn/ui
- **WebAssembly**: AssemblyScript
- **ビルドツール**: Vite
- **パッケージ管理**: pnpm workspace

## ライセンス

MIT