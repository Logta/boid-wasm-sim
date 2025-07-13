# @boid-wasm-sim/components

Boidシミュレーションアプリケーション用のReactコンポーネントライブラリ

## 概要

このパッケージは、boid-wasm-simアプリケーションで使用されるUIコンポーネントを提供します。すべてのコンポーネントはTDD（テスト駆動開発）で作成されており、Tailwind CSS v4を使用してスタイリングされています。

## コンポーネント一覧

### レイアウトコンポーネント
- `Header` - アプリケーションヘッダー
- `Sidebar` - サイドバーコントロールパネル

### 描画コンポーネント
- `BoidRenderer` - Canvasを使ったboid描画エンジン
- `SimulationCanvas` - シミュレーション表示領域

### 制御コンポーネント
- `BoidCountSelector` - boid数選択（100/500/1000）
- `ParameterPanel` - シミュレーションパラメータ調整パネル
- `ParameterSlider` - パラメータ調整用スライダー
- `SimulationControls` - 再生/一時停止/リセットボタン

## 使用方法

```tsx
import { Sidebar, BoidRenderer, Header } from "@boid-wasm-sim/components"

function App() {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar
        boidCount={100}
        isPlaying={false}
        parameters={params}
        onBoidCountChange={setBoidCount}
        onPlayPause={togglePlayPause}
        onReset={reset}
        onParameterChange={updateParameter}
      />
      
      <main className="flex-1 flex flex-col">
        <Header />
        <BoidRenderer
          width={800}
          height={600}
          boids={boids}
          fps={fps}
          onMouseMove={setMousePosition}
        />
      </main>
    </div>
  )
}
```

## 型定義

```typescript
export type SimulationParameters = {
  separationRadius: number
  separationStrength: number
  alignmentRadius: number
  alignmentStrength: number
  cohesionRadius: number
  cohesionStrength: number
  mouseAvoidanceDistance: number
}

export type Boid = {
  x: number
  y: number
  vx: number
  vy: number
}
```

## 開発

```bash
# テスト実行
pnpm test

# テスト（UI付き）
pnpm test:ui

# ビルド
pnpm build

# 開発モード（TypeScript監視）
pnpm dev
```

## 技術スタック

- React 19
- TypeScript
- Tailwind CSS v4
- Vitest（テスト）
- Testing Library（Reactテスト）

## テスト

すべてのコンポーネントはt-wadaのTDDアプローチで開発されており、包括的なテストスイートを持っています。