# WASM モジュール

## 概要

GoでビルドされたWebAssemblyモジュールです。ボイドシミュレーションのコア計算を高速に実行します。

## ファイル構成

```
wasm/
├── *.go              # Goソースファイル
├── *_test.go         # テストファイル
├── go.mod            # Goモジュール定義
├── package.json      # npm/pnpmスクリプト定義
├── boid.wasm         # ビルド済みWASMファイル（開発用）
├── wasm_exec.js      # Go WASMランタイム
└── README.md         # このファイル
```

## ビルドとデプロイ

### 開発ビルド
```bash
pnpm dev
```

### プロダクションビルド  
```bash
pnpm build
```

### テスト実行
```bash
pnpm test
```

### ファイル配置

- **開発用**: `wasm/boid.wasm` - ローカル開発とテスト用
- **本番用**: `web/main/public/boid.wasm` - Webアプリから読み込み
- **ランタイム**: `web/main/public/wasm_exec.js` - Go WASMランタイム（安定版）

## WASMファイル管理

- `boid.wasm`はビルド時に自動生成され、`web/main/public/`にコピーされます
- `wasm_exec.js`は安定版のためGitで管理されます
- 生成されたWASMファイルは`.gitignore`により除外されます

## 関数エクスポート

JavaScriptから呼び出し可能な関数：

- `initializeSimulation(count, width, height)` - シミュレーション初期化
- `updateSimulation()` - 1フレーム更新
- `setMousePosition(x, y)` - マウス位置設定
- `getBoidCount()` - ボイド数取得
- `getBoidPositionX/Y(index)` - ボイド位置取得
- `getBoidVelocityX/Y(index)` - ボイド速度取得
- `updateSeparationParams(radius, strength)` - 分離パラメータ更新
- `updateAlignmentParams(radius, strength)` - 整列パラメータ更新
- `updateCohesionParams(radius, strength)` - 結合パラメータ更新
- `updateMouseAvoidanceDistance(distance)` - マウス回避距離更新