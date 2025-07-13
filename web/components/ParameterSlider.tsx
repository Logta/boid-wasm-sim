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
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange(Number(event.target.value))
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm text-gray-300">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  )
}