import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

type BoidCountSelectorProps = {
  value: number
  onChange: (value: number) => void
}

export function BoidCountSelector({ value, onChange }: BoidCountSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-muted-foreground">
        Number of Boids
      </label>
      <Select 
        value={value.toString()} 
        onValueChange={(val) => onChange(Number(val))}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="100">🐦 100 boids</SelectItem>
          <SelectItem value="500">🐦 500 boids</SelectItem>
          <SelectItem value="1000">🐦 1000 boids</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}