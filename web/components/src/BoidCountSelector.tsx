type BoidCountSelectorProps = {
  value: number
  onChange: (value: number) => void
}

export function BoidCountSelector({ value, onChange }: BoidCountSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        ボイド数
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
      >
        <option value={100}>🐦 100匹</option>
        <option value={500}>🐦 500匹</option>
        <option value={1000}>🐦 1000匹</option>
      </select>
    </div>
  )
}