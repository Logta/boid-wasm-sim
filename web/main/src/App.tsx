import "./index.css"
import { Header, Sidebar, SimulationCanvas } from "@boid-wasm-sim/components"

export function App() {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        <Header />
        <SimulationCanvas />
      </main>
    </div>
  )
}