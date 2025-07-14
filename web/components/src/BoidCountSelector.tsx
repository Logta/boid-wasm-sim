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
        ボイド数
      </label>
      <Select 
        value={value.toString()} 
        onValueChange={(val) => onChange(Number(val))}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="100">🐦 100匹</SelectItem>
          <SelectItem value="500">🐦 500匹</SelectItem>
          <SelectItem value="1000">🐦 1000匹</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}