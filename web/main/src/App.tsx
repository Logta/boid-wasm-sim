import "./index.css"
import { 
  Header, 
  Sidebar, 
  BoidRenderer, 
  useSimulation,
  type SimulationParameters 
} from "@boid-wasm-sim/components"

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
    updateParameter
  } = useSimulation()

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-xl">Loading WASM module...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-400 mb-2">Error loading simulation</div>
          <div className="text-gray-400">{error.message}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
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