type BoidCountSelectorProps = {
  value: number
  onChange: (value: number) => void
}

export function BoidCountSelector({ value, onChange }: BoidCountSelectorProps) {
  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    onChange(Number(event.target.value))
  }

  return (
    <div className="space-y-2">
      <label htmlFor="boid-count" className="block text-sm font-medium">
        Boid Count
      </label>
      <select
        id="boid-count"
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value={100}>100 boids</option>
        <option value={500}>500 boids</option>
        <option value={1000}>1000 boids</option>
      </select>
    </div>
  )
}