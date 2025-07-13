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
    <div className="flex gap-2">
      <button
        onClick={onPlayPause}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      
      <button
        onClick={onReset}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
      >
        Reset
      </button>
    </div>
  )
}