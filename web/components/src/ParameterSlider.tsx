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
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm font-mono text-white bg-slate-700 px-2 py-1 rounded">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none 
          [&::-webkit-slider-thumb]:h-4 
          [&::-webkit-slider-thumb]:w-4 
          [&::-webkit-slider-thumb]:rounded-full 
          [&::-webkit-slider-thumb]:bg-blue-500 
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:h-4 
          [&::-moz-range-thumb]:w-4 
          [&::-moz-range-thumb]:rounded-full 
          [&::-moz-range-thumb]:bg-blue-500 
          [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-thumb]:border-none"
      />
    </div>
  )
}