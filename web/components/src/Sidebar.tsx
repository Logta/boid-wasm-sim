import { BoidCountSelector } from "./BoidCountSelector"
import { ParameterPanel } from "./ParameterPanel"
import { SimulationControls } from "./SimulationControls"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

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
    <aside role="complementary" className="w-80 border-r p-6 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          操作パネル
        </h2>
        <div className="h-px bg-gradient-to-r from-blue-500 to-purple-500"></div>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-blue-400">ボイド数</CardTitle>
          </CardHeader>
          <CardContent>
            <BoidCountSelector 
              value={boidCount}
              onChange={onBoidCountChange}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-green-400">パラメータ</CardTitle>
          </CardHeader>
          <CardContent>
            <ParameterPanel
              parameters={parameters}
              onParameterChange={onParameterChange}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-purple-400">シミュレーション制御</CardTitle>
          </CardHeader>
          <CardContent>
            <SimulationControls
              isPlaying={isPlaying}
              onPlayPause={onPlayPause}
              onReset={onReset}
            />
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}