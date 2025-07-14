import { ParameterSlider } from "./ParameterSlider"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"
import { ArrowUpDown, Move, Magnet, MousePointer } from "lucide-react"

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
    <Accordion type="multiple" defaultValue={["separation", "alignment", "cohesion", "mouse"]} className="w-full">
      <AccordionItem value="separation">
        <AccordionTrigger className="text-left">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-red-400" />
            <span className="text-red-400">分離行動</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <ParameterSlider
              label="半径"
              value={parameters.separationRadius}
              min={10}
              max={100}
              step={5}
              onChange={(value) => onParameterChange("separationRadius", value)}
            />
            <ParameterSlider
              label="強度"
              value={parameters.separationStrength}
              min={0}
              max={3}
              step={0.1}
              onChange={(value) => onParameterChange("separationStrength", value)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="alignment">
        <AccordionTrigger className="text-left">
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400">整列行動</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <ParameterSlider
              label="半径"
              value={parameters.alignmentRadius}
              min={20}
              max={150}
              step={10}
              onChange={(value) => onParameterChange("alignmentRadius", value)}
            />
            <ParameterSlider
              label="強度"
              value={parameters.alignmentStrength}
              min={0}
              max={3}
              step={0.1}
              onChange={(value) => onParameterChange("alignmentStrength", value)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="cohesion">
        <AccordionTrigger className="text-left">
          <div className="flex items-center gap-2">
            <Magnet className="h-4 w-4 text-green-400" />
            <span className="text-green-400">結合行動</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <ParameterSlider
              label="半径"
              value={parameters.cohesionRadius}
              min={20}
              max={150}
              step={10}
              onChange={(value) => onParameterChange("cohesionRadius", value)}
            />
            <ParameterSlider
              label="強度"
              value={parameters.cohesionStrength}
              min={0}
              max={3}
              step={0.1}
              onChange={(value) => onParameterChange("cohesionStrength", value)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="mouse">
        <AccordionTrigger className="text-left">
          <div className="flex items-center gap-2">
            <MousePointer className="h-4 w-4 text-blue-400" />
            <span className="text-blue-400">マウス回避</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ParameterSlider
            label="回避距離"
            value={parameters.mouseAvoidanceDistance}
            min={50}
            max={200}
            step={10}
            onChange={(value) => onParameterChange("mouseAvoidanceDistance", value)}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}