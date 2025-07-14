import { BoidCountSelector } from "./BoidCountSelector"
import { ParameterPanel } from "./ParameterPanel"
import { SimulationControls } from "./SimulationControls"
import type { SimulationParameters } from "@boid-wasm-sim/hooks"

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
    <aside role="complementary" className="w-80 border-r p-6 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          操作パネル
        </h2>
        <div className="h-px bg-gradient-to-r from-blue-500 to-purple-500"></div>
      </div>
      
      <div className="space-y-8">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-blue-400">ボイド数</h3>
          <BoidCountSelector 
            value={boidCount}
            onChange={onBoidCountChange}
          />
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-green-400">パラメータ</h3>
          <ParameterPanel
            parameters={parameters}
            onParameterChange={onParameterChange}
          />
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-purple-400">シミュレーション制御</h3>
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