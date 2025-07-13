import { useRef, useEffect } from "react"

export function SimulationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 黒背景でクリア
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Simulation Canvas"
        width={800}
        height={600}
        className="border border-gray-600"
      />
      
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        FPS: 0
      </div>
    </div>
  )
}