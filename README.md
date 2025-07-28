# boid-wasm-sim

Craig ReynoldsのBoidモデルを参考に、群れシミュレーションを学習目的で実装してみました。

## 概要

基本的な群れの動きをWebブラウザで表示できるシンプルなアプリケーションです。GoのWebAssemblyとReactで構成されています。

## 特徴

- Go WebAssemblyによる計算処理（空間分割アルゴリズムで最適化）
- 必要最小限のテストによる品質保証
- リアルタイムパラメータ調整
- シンプルなUI設計
- pnpm workspaceによるモノレポ構成

## 必要環境

- [mise](https://github.com/jdx/mise) - 開発環境管理
- Go 1.24.5（mise で管理）
- Node.js 24.4.0（mise で管理）
- pnpm（mise で管理）

## セットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd boid-wasm-sim

# mise の設定を信頼
mise trust

# 依存関係のインストール
pnpm install

# WASMモジュールのビルド
pnpm --filter @boid-wasm-sim/wasm build
```

## 開発

```bash
# 開発サーバーの起動
cd web/main && pnpm dev

# WASMモジュールの開発
pnpm --filter @boid-wasm-sim/wasm build
```

開発サーバーは http://localhost:5173/ で起動します。

## ビルド

```bash
# WASMモジュールのビルド
pnpm --filter @boid-wasm-sim/wasm build

# Webアプリのビルド
pnpm --filter @boid-wasm-sim/web build
```

## テスト

```bash
# WASMコアロジックのテスト（最も重要）
pnpm --filter @boid-wasm-sim/wasm test

# 型安全性のテスト
pnpm --filter @boid-wasm-sim/hooks test

# 基本統合テスト
pnpm --filter @boid-wasm-sim/web test
```

## プロジェクト構成

```
boid-wasm-sim/
├── web/
│   ├── hooks/              # カスタムフック（型テスト含む）
│   ├── components/         # UIコンポーネント
│   └── main/              # メインアプリ
├── wasm/                  # Go WebAssemblyモジュール
│   ├── *.go               # コアロジック
│   ├── *_test.go          # 充実したテストスイート
│   ├── spatial_grid.go    # 空間分割最適化
│   └── package.json
├── CLAUDE.md              # 開発指針
└── .mise.toml            # 環境設定
```

## 機能

### 基本動作
- **分離**: 近すぎる個体から離れる
- **整列**: 周囲の個体と速度を合わせる
- **結合**: 群れの中心に向かう
- **回避**: マウスカーソルを避ける

### パフォーマンス
- 空間分割アルゴリズムによりO(n²)→O(n)に最適化
- 100匹: 安定した60fps以上
- 500匹: 50-60fps
- 1000匹: 30-40fps程度

### 調整可能なパラメータ
- 各行動の影響半径と強度
- マウス回避距離
- ボイド数（100・500・1000匹）

## 技術的な工夫

### アーキテクチャ
- **WASM**: 計算集約的な処理をGoで実装
- **React**: UI状態管理とレンダリング
- **バッチAPI**: WASM-JS間の通信を最適化

### 最適化
- 距離計算で平方根を回避（二乗距離で比較）
- 背景の事前レンダリング
- グラデーションの再利用
- デバッグログの削除

## GitHub Actions

### CI/CD
- **CI**: プッシュ・プルリクエスト時にテスト・リント・ビルドを自動実行
- **Deploy**: mainブランチへのプッシュ時にGitHub Pagesに自動デプロイ

### 手動実行
```bash
# GitHub Actions相当のローカルテスト
mise gh-test

# GitHub Actions相当のローカルビルド
mise gh-build

# GitHub Pages用ビルド
mise gh-deploy
```

## ライセンス

MIT
