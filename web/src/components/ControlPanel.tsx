import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BoidParameters {
  separationDistance: number
  alignmentDistance: number
  cohesionDistance: number
  separationForce: number
  alignmentForce: number
  cohesionForce: number
  mouseAvoidDistance: number
  mouseAvoidForce: number
}

interface ControlPanelProps {
  isRunning: boolean
  boidCount: number
  fps: number
  parameters: BoidParameters
  onBoidCountChange: (count: number) => void
  onParametersChange: (parameters: BoidParameters) => void
  onToggleSimulation: () => void
  onReset: () => void
}

export function ControlPanel({
  isRunning,
  boidCount,
  fps,
  parameters,
  onBoidCountChange,
  onParametersChange,
  onToggleSimulation,
  onReset
}: ControlPanelProps) {
  const updateParameter = (key: keyof BoidParameters, value: number) => {
    onParametersChange({ ...parameters, [key]: value })
  }

  return (
    <div className="w-80 bg-card border-r border-border p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Boid Simulation</h2>
        
        <div className="flex items-center gap-2">
          <Button onClick={onToggleSimulation} variant="outline" size="sm">
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Pause' : 'Play'}
          </Button>
          <Button onClick={onReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          FPS: {fps}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Boid Count</label>
          <Select value={boidCount.toString()} onValueChange={(value) => onBoidCountChange(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="500">500</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Separation Distance: {parameters.separationDistance}
          </label>
          <Slider
            value={[parameters.separationDistance]}
            onValueChange={([value]) => updateParameter('separationDistance', value)}
            min={10}
            max={100}
            step={1}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Separation Force: {parameters.separationForce.toFixed(1)}
          </label>
          <Slider
            value={[parameters.separationForce]}
            onValueChange={([value]) => updateParameter('separationForce', value)}
            min={0.1}
            max={5}
            step={0.1}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Alignment Distance: {parameters.alignmentDistance}
          </label>
          <Slider
            value={[parameters.alignmentDistance]}
            onValueChange={([value]) => updateParameter('alignmentDistance', value)}
            min={10}
            max={150}
            step={1}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Alignment Force: {parameters.alignmentForce.toFixed(1)}
          </label>
          <Slider
            value={[parameters.alignmentForce]}
            onValueChange={([value]) => updateParameter('alignmentForce', value)}
            min={0.1}
            max={3}
            step={0.1}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Cohesion Distance: {parameters.cohesionDistance}
          </label>
          <Slider
            value={[parameters.cohesionDistance]}
            onValueChange={([value]) => updateParameter('cohesionDistance', value)}
            min={10}
            max={150}
            step={1}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Cohesion Force: {parameters.cohesionForce.toFixed(1)}
          </label>
          <Slider
            value={[parameters.cohesionForce]}
            onValueChange={([value]) => updateParameter('cohesionForce', value)}
            min={0.1}
            max={3}
            step={0.1}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Mouse Avoid Distance: {parameters.mouseAvoidDistance}
          </label>
          <Slider
            value={[parameters.mouseAvoidDistance]}
            onValueChange={([value]) => updateParameter('mouseAvoidDistance', value)}
            min={20}
            max={200}
            step={5}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Mouse Avoid Force: {parameters.mouseAvoidForce.toFixed(1)}
          </label>
          <Slider
            value={[parameters.mouseAvoidForce]}
            onValueChange={([value]) => updateParameter('mouseAvoidForce', value)}
            min={1}
            max={20}
            step={0.5}
          />
        </div>
      </div>
    </div>
  )
}