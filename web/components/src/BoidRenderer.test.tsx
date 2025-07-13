import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { BoidRenderer } from "./BoidRenderer"

// Canvas APIのモック
const mockGetContext = vi.fn()
const mockClearRect = vi.fn()
const mockFillRect = vi.fn()
const mockBeginPath = vi.fn()
const mockMoveTo = vi.fn()
const mockLineTo = vi.fn()
const mockClosePath = vi.fn()
const mockFill = vi.fn()

const mockContext = {
  clearRect: mockClearRect,
  fillRect: mockFillRect,
  beginPath: mockBeginPath,
  moveTo: mockMoveTo,
  lineTo: mockLineTo,
  closePath: mockClosePath,
  fill: mockFill,
  fillStyle: "",
}

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = mockGetContext.mockReturnValue(mockContext)
})

afterEach(() => {
  vi.clearAllMocks()
})

const mockBoids = [
  { x: 100, y: 150, vx: 1, vy: 0 },
  { x: 200, y: 250, vx: 0, vy: 1 },
  { x: 300, y: 350, vx: -1, vy: 0 },
]

describe("BoidRenderer", () => {
  it("Canvas要素が表示される", () => {
    render(
      <BoidRenderer
        width={800}
        height={600}
        boids={[]}
        fps={60}
        onMouseMove={() => {}}
      />
    )
    
    expect(screen.getByRole("img", { name: /simulation canvas/i })).toBeInTheDocument()
  })

  it("正しいサイズでCanvas要素が作成される", () => {
    render(
      <BoidRenderer
        width={800}
        height={600}
        boids={[]}
        fps={60}
        onMouseMove={() => {}}
      />
    )
    
    const canvas = screen.getByRole("img", { name: /simulation canvas/i }) as HTMLCanvasElement
    expect(canvas.width).toBe(800)
    expect(canvas.height).toBe(600)
  })

  it("FPS表示エリアが存在する", () => {
    render(
      <BoidRenderer
        width={800}
        height={600}
        boids={[]}
        fps={60}
        onMouseMove={() => {}}
      />
    )
    
    expect(screen.getByText("FPS: 60")).toBeInTheDocument()
  })

  it("描画処理が実行される", () => {
    render(
      <BoidRenderer
        width={800}
        height={600}
        boids={mockBoids}
        fps={60}
        onMouseMove={() => {}}
      />
    )
    
    // Canvasコンテキストが取得されることを確認
    expect(mockGetContext).toHaveBeenCalledWith("2d")
  })

  it("マウス移動イベントが処理される", () => {
    const handleMouseMove = vi.fn()
    render(
      <BoidRenderer
        width={800}
        height={600}
        boids={[]}
        fps={60}
        onMouseMove={handleMouseMove}
      />
    )
    
    const canvas = screen.getByRole("img", { name: /simulation canvas/i })
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: 150,
      clientY: 200
    })
    
    canvas.dispatchEvent(mouseEvent)
    
    expect(handleMouseMove).toHaveBeenCalled()
  })

  it("boidが更新されたときに再描画される", () => {
    const { rerender } = render(
      <BoidRenderer
        width={800}
        height={600}
        boids={[]}
        fps={60}
        onMouseMove={() => {}}
      />
    )
    
    // 初期描画
    expect(mockClearRect).toHaveBeenCalled()
    
    vi.clearAllMocks()
    
    // boidを追加して再描画
    rerender(
      <BoidRenderer
        width={800}
        height={600}
        boids={mockBoids}
        fps={60}
        onMouseMove={() => {}}
      />
    )
    
    // 再描画が実行されることを確認
    expect(mockClearRect).toHaveBeenCalled()
  })
})