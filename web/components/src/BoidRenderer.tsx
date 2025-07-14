import { useRef, useEffect } from "react"
import type { Boid } from "@boid-wasm-sim/hooks"

type BoidRendererProps = {
  width: number
  height: number
  boids: Boid[]
  fps: number
  onMouseMove: (x: number, y: number) => void
}

export function BoidRenderer({ 
  width, 
  height, 
  boids, 
  fps, 
  onMouseMove 
}: BoidRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function drawBoid(ctx: CanvasRenderingContext2D, boid: Boid) {
    const size = 6
    const angle = Math.atan2(boid.velocity.y, boid.velocity.x)
    
    ctx.save()
    ctx.translate(boid.position.x, boid.position.y)
    ctx.rotate(angle)
    
    ctx.beginPath()
    ctx.moveTo(size, 0)
    ctx.lineTo(-size / 2, -size / 2)
    ctx.lineTo(-size / 2, size / 2)
    ctx.closePath()
    ctx.fillStyle = "#60a5fa"
    ctx.fill()
    
    ctx.restore()
  }

  function render() {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 背景をクリア
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, width, height)

    // 全てのboidを描画
    boids.forEach(boid => drawBoid(ctx, boid))
  }

  function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    onMouseMove(x, y)
  }

  useEffect(() => {
    render()
  }, [boids, width, height])

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Simulation Canvas"
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        className="border border-gray-600 cursor-crosshair"
      />
      
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        FPS: {fps}
      </div>
    </div>
  )
}