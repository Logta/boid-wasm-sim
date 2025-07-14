# @boid-wasm-sim/components

ボイドシミュレーションアプリで使用するシンプルなUIコンポーネント集です。

## 概要

必要最小限の機能に絞ったReactコンポーネントを提供します。t-wadaのTDD原則に従い、価値のあるコンポーネントのみを実装しています。

## 主要コンポーネント

### メインコンポーネント
- `Header` - アプリケーションヘッダー
- `Sidebar` - パラメータ調整サイドバー  
- `BoidRenderer` - Canvas描画エンジン

### 基本UIコンポーネント
- `Button` - 汎用ボタン
- `Slider` - パラメータスライダー
- `Select` - セレクトボックス
- `Badge` - 情報表示
- `Card` - コンテナ

## 使用例

```tsx
import { Sidebar, BoidRenderer, Header } from "@boid-wasm-sim/components"

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar
        boidCount={boidCount}
        isPlaying={isPlaying}
        parameters={parameters}
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

## 開発

```bash
# ビルド
pnpm build

# 開発モード（TypeScript監視）
pnpm dev
```

## 技術構成

- React 19 + TypeScript
- Tailwind CSS（スタイリング）
- Vite（ビルドツール）
