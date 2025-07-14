import { ParameterSlider } from "./ParameterSlider"
import type { SimulationParameters } from "@boid-wasm-sim/hooks"

type ParameterPanelProps = {
  parameters: SimulationParameters
  onParameterChange: (key: keyof SimulationParameters, value: number) => void
}

export function ParameterPanel({ parameters, onParameterChange }: ParameterPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold mb-4 text-red-400 flex items-center gap-2">
          <span>🔴</span>
          分離行動
        </h4>
        <div className="space-y-4">
          <ParameterSlider
            label="半径"
            value={parameters.separationRadius}
            min={10}
            max={100}
            step={5}
            onChange={(value) => onParameterChange("separationRadius", value)}
          />
          <ParameterSlider
            label="強度"
            value={parameters.separationStrength}
            min={0}
            max={3}
            step={0.1}
            onChange={(value) => onParameterChange("separationStrength", value)}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-4 text-yellow-400 flex items-center gap-2">
          <span>🟡</span>
          整列行動
        </h4>
        <div className="space-y-4">
          <ParameterSlider
            label="半径"
            value={parameters.alignmentRadius}
            min={20}
            max={150}
            step={10}
            onChange={(value) => onParameterChange("alignmentRadius", value)}
          />
          <ParameterSlider
            label="強度"
            value={parameters.alignmentStrength}
            min={0}
            max={3}
            step={0.1}
            onChange={(value) => onParameterChange("alignmentStrength", value)}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-4 text-green-400 flex items-center gap-2">
          <span>🟢</span>
          結合行動
        </h4>
        <div className="space-y-4">
          <ParameterSlider
            label="半径"
            value={parameters.cohesionRadius}
            min={20}
            max={150}
            step={10}
            onChange={(value) => onParameterChange("cohesionRadius", value)}
          />
          <ParameterSlider
            label="強度"
            value={parameters.cohesionStrength}
            min={0}
            max={3}
            step={0.1}
            onChange={(value) => onParameterChange("cohesionStrength", value)}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-4 text-blue-400 flex items-center gap-2">
          <span>🔵</span>
          マウス回避
        </h4>
        <ParameterSlider
          label="回避距離"
          value={parameters.mouseAvoidanceDistance}
          min={50}
          max={200}
          step={10}
          onChange={(value) => onParameterChange("mouseAvoidanceDistance", value)}
        />
      </div>
    </div>
  )
}