import { Button } from "./ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

type SimulationControlsProps = {
  isPlaying: boolean
  onPlayPause: () => void
  onReset: () => void
}

export function SimulationControls({ 
  isPlaying, 
  onPlayPause, 
  onReset 
}: SimulationControlsProps) {
  return (
    <div className="flex gap-3">
      <Button
        onClick={onPlayPause}
        className="flex-1"
        size="lg"
      >
        {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
        {isPlaying ? "Pause" : "Play"}
      </Button>
      
      <Button
        onClick={onReset}
        variant="destructive"
        className="flex-1"
        size="lg"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset
      </Button>
    </div>
  )
}