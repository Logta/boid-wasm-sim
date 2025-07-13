import { BoidCountSelector } from "./BoidCountSelector"
import { ParameterPanel } from "./ParameterPanel"
import { SimulationControls } from "./SimulationControls"

type SimulationParameters = {
  separationRadius: number
  separationStrength: number
  alignmentRadius: number
  alignmentStrength: number
  cohesionRadius: number
  cohesionStrength: number
  mouseAvoidanceDistance: number
}

type SidebarProps = {
  boidCount: number
  isPlaying: boolean
  parameters: SimulationParameters
  onBoidCountChange: (count: number) => void
  onPlayPause: () => void
  onReset: () => void
  onParameterChange: (key: keyof SimulationParameters, value: number) => void
}

export function Sidebar({
  boidCount,
  isPlaying,
  parameters,
  onBoidCountChange,
  onPlayPause,
  onReset,
  onParameterChange
}: SidebarProps) {
  return (
    <aside role="complementary" className="w-80 bg-gray-800 p-6">
      <h2 className="text-xl font-bold mb-6">Controls</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Boid Count</h3>
          <BoidCountSelector 
            value={boidCount}
            onChange={onBoidCountChange}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Parameters</h3>
          <ParameterPanel
            parameters={parameters}
            onParameterChange={onParameterChange}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Simulation Control</h3>
          <SimulationControls
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onReset={onReset}
          />
        </div>
      </div>
    </aside>
  )
}