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
      <button
        onClick={onPlayPause}
        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center"
      >
        <span className="mr-2">{isPlaying ? "⏸️" : "▶️"}</span>
        {isPlaying ? "一時停止" : "再生"}
      </button>
      
      <button
        onClick={onReset}
        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center"
      >
        <span className="mr-2">🔄</span>
        リセット
      </button>
    </div>
  )
}