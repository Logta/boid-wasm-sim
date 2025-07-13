import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { App } from "./App"

const mockSimulation = {
  isLoading: false,
  error: null,
  isPlaying: false,
  boidCount: 100,
  parameters: {
    separationRadius: 25,
    separationStrength: 1.5,
    alignmentRadius: 50,
    alignmentStrength: 1.0,
    cohesionRadius: 50,
    cohesionStrength: 1.0,
    mouseAvoidanceDistance: 100
  },
  boids: [
    { x: 100, y: 150, vx: 1, vy: 0 },
    { x: 200, y: 250, vx: 0, vy: 1 }
  ],
  fps: 60,
  togglePlayPause: vi.fn(),
  reset: vi.fn(),
  setBoidCount: vi.fn(),
  setMousePosition: vi.fn(),
  updateParameter: vi.fn()
}

vi.mock("@boid-wasm-sim/components", async () => {
  const actual = await vi.importActual("@boid-wasm-sim/components")
  return {
    ...actual,
    useSimulation: () => mockSimulation
  }
})

describe("App Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("完全なアプリケーションが表示される", async () => {
    render(<App />)
    
    // 主要なコンポーネントが表示される
    expect(screen.getByText("Boid WASM Simulation")).toBeInTheDocument()
    expect(screen.getByText("Controls")).toBeInTheDocument()
    expect(screen.getByRole("complementary")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /simulation canvas/i })).toBeInTheDocument()
  })

  it("ローディング状態が表示される", () => {
    vi.mocked(mockSimulation).isLoading = true
    
    render(<App />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it("エラー状態が表示される", () => {
    vi.mocked(mockSimulation).error = new Error("WASM load failed")
    vi.mocked(mockSimulation).isLoading = false
    
    render(<App />)
    
    expect(screen.getByText(/error/i)).toBeInTheDocument()
    expect(screen.getByText("WASM load failed")).toBeInTheDocument()
  })

  it("boid数を変更できる", () => {
    render(<App />)
    
    const select = screen.getByRole("combobox")
    fireEvent.change(select, { target: { value: "500" } })
    
    expect(mockSimulation.setBoidCount).toHaveBeenCalledWith(500)
  })

  it("再生/一時停止ボタンが機能する", () => {
    render(<App />)
    
    const playButton = screen.getByRole("button", { name: /play/i })
    fireEvent.click(playButton)
    
    expect(mockSimulation.togglePlayPause).toHaveBeenCalled()
  })

  it("リセットボタンが機能する", () => {
    render(<App />)
    
    const resetButton = screen.getByRole("button", { name: /reset/i })
    fireEvent.click(resetButton)
    
    expect(mockSimulation.reset).toHaveBeenCalled()
  })

  it("パラメータスライダーが機能する", () => {
    render(<App />)
    
    const sliders = screen.getAllByRole("slider")
    fireEvent.change(sliders[0], { target: { value: "30" } })
    
    expect(mockSimulation.updateParameter).toHaveBeenCalledWith("separationRadius", 30)
  })

  it("マウス移動がCanvasで追跡される", () => {
    render(<App />)
    
    const canvas = screen.getByRole("img", { name: /simulation canvas/i })
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: 150,
      clientY: 200
    })
    
    canvas.dispatchEvent(mouseEvent)
    
    expect(mockSimulation.setMousePosition).toHaveBeenCalled()
  })

  it("FPSが表示される", () => {
    render(<App />)
    
    expect(screen.getByText("FPS: 60")).toBeInTheDocument()
  })

  it("現在のboid数が正しく表示される", () => {
    render(<App />)
    
    const select = screen.getByRole("combobox")
    expect(select).toHaveValue("100")
  })

  it("パラメータ値が正しく表示される", () => {
    render(<App />)
    
    expect(screen.getByText("25")).toBeInTheDocument() // separationRadius
    expect(screen.getByText("1.5")).toBeInTheDocument() // separationStrength
    expect(screen.getByText("50")).toBeInTheDocument() // alignmentRadius/cohesionRadius
    expect(screen.getByText("1")).toBeInTheDocument() // alignmentStrength/cohesionStrength
    expect(screen.getByText("100")).toBeInTheDocument() // mouseAvoidanceDistance
  })
})