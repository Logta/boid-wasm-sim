import type { Boid } from "@boid-wasm-sim/hooks"
import { Activity, MousePointer, Users } from "lucide-react"
import { useCallback, useEffect, useRef } from "react"
import { Badge } from "./ui/badge"
import { Card } from "./ui/card"

type BoidRendererProps = {
  width: number
  height: number
  boids: Boid[]
  fps: number
  onMouseMove: (x: number, y: number) => void
}

export function BoidRenderer({ width, height, boids, fps, onMouseMove }: BoidRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null)
  const gradientRef = useRef<CanvasGradient | null>(null)

  const drawBoid = useCallback((ctx: CanvasRenderingContext2D, boid: Boid) => {
    const size = 6
    const angle = Math.atan2(boid.velocity.y, boid.velocity.x)

    ctx.save()
    ctx.translate(boid.position.x, boid.position.y)
    ctx.rotate(angle)

    // より目立つボイドの描画
    ctx.beginPath()
    ctx.moveTo(size, 0)
    ctx.lineTo(-size / 2, -size / 2)
    ctx.lineTo(-size / 2, size / 2)
    ctx.closePath()

    // 再利用可能なグラデーション
    if (!gradientRef.current) {
      gradientRef.current = ctx.createLinearGradient(-size, -size, size, size)
      gradientRef.current.addColorStop(0, "#3b82f6")
      gradientRef.current.addColorStop(1, "#60a5fa")
    }
    ctx.fillStyle = gradientRef.current
    ctx.fill()

    // 境界線
    ctx.strokeStyle = "#1e40af"
    ctx.lineWidth = 0.5
    ctx.stroke()

    ctx.restore()
  }, [])

  const renderBackground = useCallback(() => {
    const bgCanvas = backgroundCanvasRef.current
    if (!bgCanvas) return

    const bgCtx = bgCanvas.getContext("2d")
    if (!bgCtx) return

    // 背景をクリア（より美しいグラデーション背景）
    const gradient = bgCtx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, "#0f172a")
    gradient.addColorStop(1, "#1e293b")
    bgCtx.fillStyle = gradient
    bgCtx.fillRect(0, 0, width, height)

    // 格子パターンの描画（一度だけ）
    bgCtx.strokeStyle = "rgba(51, 65, 85, 0.3)"
    bgCtx.lineWidth = 1
    const gridSize = 50
    bgCtx.beginPath()
    for (let x = 0; x <= width; x += gridSize) {
      bgCtx.moveTo(x, 0)
      bgCtx.lineTo(x, height)
    }
    for (let y = 0; y <= height; y += gridSize) {
      bgCtx.moveTo(0, y)
      bgCtx.lineTo(width, y)
    }
    bgCtx.stroke()
  }, [width, height])

  // biome-ignore lint/correctness/useExhaustiveDependencies: 依存関係を意図的に除外
  const render = useCallback(() => {
    const canvas = canvasRef.current
    const bgCanvas = backgroundCanvasRef.current
    if (!canvas || !bgCanvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 背景をコピー（事前レンダリング済み）
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(bgCanvas, 0, 0)

    // 全てのboidを描画
    boids.forEach((boid) => drawBoid(ctx, boid))
  }, [boids, width, height])

  function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    onMouseMove(x, y)
  }

  useEffect(() => {
    renderBackground()
  }, [renderBackground])

  useEffect(() => {
    render()
  }, [render])

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative bg-muted/20">
      <Card className="relative overflow-hidden">
        <canvas
          ref={backgroundCanvasRef}
          width={width}
          height={height}
          className="absolute inset-0"
          style={{ display: "none" }}
        />
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="ボイドシミュレーションキャンバス"
          width={width}
          height={height}
          onMouseMove={handleMouseMove}
          className="cursor-crosshair"
        />

        {/* 情報表示オーバーレイ */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge variant="secondary" className="shadow-lg">
            <Activity className="h-3 w-3 mr-1" />
            FPS: {fps}
          </Badge>
          <Badge variant="outline" className="shadow-lg bg-background/80 backdrop-blur-sm">
            <Users className="h-3 w-3 mr-1" />
            ボイド: {boids.length}匹
          </Badge>
        </div>

        {/* マウス操作のヒント */}
        <div className="absolute bottom-4 right-4">
          <Badge variant="outline" className="shadow-lg bg-background/80 backdrop-blur-sm text-xs">
            <MousePointer className="h-3 w-3 mr-1" />
            マウスでボイドを誘導
          </Badge>
        </div>
      </Card>
    </div>
  )
}
