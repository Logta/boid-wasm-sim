import { useRef, useEffect, useCallback } from 'react'

interface CanvasProps {
  positions: Float32Array
  onMouseMove: (x: number, y: number) => void
}

export function Canvas({ positions, onMouseMove }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    onMouseMove(x, y)
  }, [onMouseMove])

  const handleMouseLeave = useCallback(() => {
    onMouseMove(-1000, -1000)
  }, [onMouseMove])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas with background color
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, width, height)

    if (positions.length === 0) {
      // Draw "No data" message
      ctx.fillStyle = '#333'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('No boid data available', width / 2, height / 2)
      return
    }

    ctx.fillStyle = '#000000'

    for (let i = 0; i < positions.length; i += 4) {
      const x = positions[i]
      const y = positions[i + 1]
      const vx = positions[i + 2]
      const vy = positions[i + 3]

      // Skip invalid positions
      if (isNaN(x) || isNaN(y)) continue

      const angle = Math.atan2(vy, vx)
      const size = 6

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)

      ctx.beginPath()
      ctx.moveTo(size, 0)
      ctx.lineTo(-size / 2, -size / 2)
      ctx.lineTo(-size / 2, size / 2)
      ctx.closePath()
      ctx.fill()

      ctx.restore()
    }
  }, [positions])

  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  )
}