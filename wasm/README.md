# WASM モジュール

## 概要

Goで実装したボイドシミュレーションのコア計算部分です。空間分割アルゴリズムにより、大量のボイドでも効率的に動作するよう工夫しました。

## ビルドとテスト

```bash
# WASMモジュールのビルド
pnpm build

# テスト実行（コアロジックの品質保証）
pnpm test

# 開発用ビルド（デバッグ情報付き）
pnpm dev
```

## 構成

`main.go`（`package main`）はJavaScript連携（引数の変換・関数登録）のみを担い、群れ行動のロジックは持ちません。実体は`internal/`配下のパッケージにあります。

- `main.go` - JavaScript連携とエクスポート（ロジックは持たない）
- `internal/simulation/` - 群れ全体の状態（ボイド一覧・パラメータ・空間分割インデックス）と、複数ボイドを参照する操舵行動（分離・整列・結合・マウス回避）、1フレーム更新処理
- `internal/boid/` - ボイド1個体の物理更新（位置・速度の積分、境界処理）と、1個体の情報だけで完結する操舵（目標に向かう`Seek`）
- `internal/spatialgrid/` - 空間分割による近隣探索の最適化
- `internal/vector/` - ベクトル演算

## エクスポート関数

JavaScript側から利用可能な関数：

### 基本操作
- `initializeSimulation(count, width, height)` - シミュレーション初期化
- `updateSimulation()` - 1フレーム更新
- `setMousePosition(x, y)` - マウス位置設定

### データ取得
- `getBoidCount()` - ボイド数取得
- `getAllBoidData()` - 全ボイドデータの効率的な一括取得

### パラメータ調整
- `updateSeparationParams(radius, strength)` - 分離行動
- `updateAlignmentParams(radius, strength)` - 整列行動  
- `updateCohesionParams(radius, strength)` - 結合行動
- `updateMouseAvoidanceDistance(distance)` - マウス回避距離

## 最適化

### 空間分割アルゴリズム
- O(n²) → O(n)の計算量改善
- 75x75ピクセルのグリッドで近隣探索を高速化

### 計算最適化
- 距離計算で平方根を回避（二乗距離で比較）
- バッチAPIによるJavaScript連携の効率化
