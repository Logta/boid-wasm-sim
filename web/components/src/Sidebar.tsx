import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Separator } from "./ui/separator"
import { Slider } from "./ui/slider"
import type { SimulationParameters } from "@boid-wasm-sim/hooks"

type SidebarProps = {
  boidCount: number
  isPlaying: boolean
  parameters: SimulationParameters
  onBoidCountChange: (count: number) => void
  onPlayPause: () => void
  onReset: () => void
  onParameterChange: (key: keyof SimulationParameters, value: number) => void
}

type ParameterSliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  color?: string
}

function ParameterSlider({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange,
  color = "text-foreground"
}: ParameterSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className={color}>{label}</Label>
        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
          {value}
        </span>
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

export function Sidebar({
  boidCount,
  isPlaying,
  parameters,
  onBoidCountChange,
  onPlayPause,
  onReset,
  onParameterChange
}: SidebarProps) {
  return (
    <aside role="complementary" className="w-80 border-r bg-background p-6 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            操作パネル
          </h2>
          <Separator className="mt-2" />
        </div>
        
        {/* ボイド数設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              🐦 ボイド数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label>個体数</Label>
              <Select
                value={boidCount.toString()}
                onValueChange={(value) => onBoidCountChange(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100匹</SelectItem>
                  <SelectItem value="500">500匹</SelectItem>
                  <SelectItem value="1000">1000匹</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* シミュレーション制御 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              ⚡ シミュレーション制御
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                onClick={onPlayPause}
                className="flex-1"
                variant={isPlaying ? "secondary" : "default"}
              >
                {isPlaying ? "⏸️ 一時停止" : "▶️ 再生"}
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                className="flex-1"
              >
                🔄 リセット
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* パラメータ設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              ⚙️ パラメータ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 分離行動 */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-red-500">
                🔴 分離行動
              </h4>
              <ParameterSlider
                label="半径"
                value={parameters.separationRadius}
                min={10}
                max={100}
                step={5}
                onChange={(value) => onParameterChange("separationRadius", value)}
                color="text-red-400"
              />
              <ParameterSlider
                label="強度"
                value={parameters.separationStrength}
                min={0}
                max={3}
                step={0.1}
                onChange={(value) => onParameterChange("separationStrength", value)}
                color="text-red-400"
              />
            </div>

            <Separator />

            {/* 整列行動 */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-yellow-500">
                🟡 整列行動
              </h4>
              <ParameterSlider
                label="半径"
                value={parameters.alignmentRadius}
                min={20}
                max={150}
                step={10}
                onChange={(value) => onParameterChange("alignmentRadius", value)}
                color="text-yellow-400"
              />
              <ParameterSlider
                label="強度"
                value={parameters.alignmentStrength}
                min={0}
                max={3}
                step={0.1}
                onChange={(value) => onParameterChange("alignmentStrength", value)}
                color="text-yellow-400"
              />
            </div>

            <Separator />

            {/* 結合行動 */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-green-500">
                🟢 結合行動
              </h4>
              <ParameterSlider
                label="半径"
                value={parameters.cohesionRadius}
                min={20}
                max={150}
                step={10}
                onChange={(value) => onParameterChange("cohesionRadius", value)}
                color="text-green-400"
              />
              <ParameterSlider
                label="強度"
                value={parameters.cohesionStrength}
                min={0}
                max={3}
                step={0.1}
                onChange={(value) => onParameterChange("cohesionStrength", value)}
                color="text-green-400"
              />
            </div>

            <Separator />

            {/* マウス回避 */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-blue-500">
                🔵 マウス回避
              </h4>
              <ParameterSlider
                label="回避距離"
                value={parameters.mouseAvoidanceDistance}
                min={50}
                max={200}
                step={10}
                onChange={(value) => onParameterChange("mouseAvoidanceDistance", value)}
                color="text-blue-400"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}