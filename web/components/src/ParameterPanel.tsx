import { ParameterSlider } from "./ParameterSlider"

type SimulationParameters = {
  separationRadius: number
  separationStrength: number
  alignmentRadius: number
  alignmentStrength: number
  cohesionRadius: number
  cohesionStrength: number
  mouseAvoidanceDistance: number
}

type ParameterPanelProps = {
  parameters: SimulationParameters
  onParameterChange: (key: keyof SimulationParameters, value: number) => void
}

export function ParameterPanel({ parameters, onParameterChange }: ParameterPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-300">Separation</h4>
        <div className="space-y-3">
          <ParameterSlider
            label="Separation Radius"
            value={parameters.separationRadius}
            min={10}
            max={100}
            step={5}
            onChange={(value) => onParameterChange("separationRadius", value)}
          />
          <ParameterSlider
            label="Separation Strength"
            value={parameters.separationStrength}
            min={0}
            max={3}
            step={0.1}
            onChange={(value) => onParameterChange("separationStrength", value)}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-300">Alignment</h4>
        <div className="space-y-3">
          <ParameterSlider
            label="Alignment Radius"
            value={parameters.alignmentRadius}
            min={20}
            max={150}
            step={10}
            onChange={(value) => onParameterChange("alignmentRadius", value)}
          />
          <ParameterSlider
            label="Alignment Strength"
            value={parameters.alignmentStrength}
            min={0}
            max={3}
            step={0.1}
            onChange={(value) => onParameterChange("alignmentStrength", value)}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-300">Cohesion</h4>
        <div className="space-y-3">
          <ParameterSlider
            label="Cohesion Radius"
            value={parameters.cohesionRadius}
            min={20}
            max={150}
            step={10}
            onChange={(value) => onParameterChange("cohesionRadius", value)}
          />
          <ParameterSlider
            label="Cohesion Strength"
            value={parameters.cohesionStrength}
            min={0}
            max={3}
            step={0.1}
            onChange={(value) => onParameterChange("cohesionStrength", value)}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-300">Mouse Interaction</h4>
        <ParameterSlider
          label="Mouse Avoidance Distance"
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