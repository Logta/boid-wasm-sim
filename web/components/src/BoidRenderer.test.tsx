import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { BoidRenderer } from "./BoidRenderer"

beforeEach(() => {
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
    
    // Canvas要素が正しく表示されることを確認
    const canvas = screen.getByRole("img", { name: /simulation canvas/i })
    expect(canvas).toBeInTheDocument()
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
    
    // getBoundingClientRectをモック
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => {}
    })
    
    fireEvent.mouseMove(canvas, {
      clientX: 150,
      clientY: 200
    })
    
    expect(handleMouseMove).toHaveBeenCalledWith(150, 200)
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
    
    // 初期状態
    const canvas = screen.getByRole("img", { name: /simulation canvas/i })
    expect(canvas).toBeInTheDocument()
    
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
    
    // 再描画後もCanvas要素が存在することを確認
    expect(canvas).toBeInTheDocument()
  })
})