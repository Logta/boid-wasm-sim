import { Slider } from "./ui/slider"

type ParameterSliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

export function ParameterSlider({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange 
}: ParameterSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <span className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">{value}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  )
}