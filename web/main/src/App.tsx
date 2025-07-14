import { BoidRenderer, Header, Sidebar } from "@boid-wasm-sim/components"
import { useSimulation } from "@boid-wasm-sim/hooks"

export function App() {
  const {
    isLoading,
    error,
    isPlaying,
    boidCount,
    parameters,
    boids,
    fps,
    togglePlayPause,
    reset,
    setBoidCount,
    setMousePosition,
    updateParameter,
  } = useSimulation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xl font-medium">WASMモジュール読み込み中...</div>
          <div className="text-sm text-muted-foreground">ボイドシミュレーション初期化中</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-xl font-semibold text-destructive">
            シミュレーション読み込みエラー
          </div>
          <div className="text-muted-foreground">{error.message}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

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
