import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { App } from "./App"

const createMockSimulation = () => ({
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
  frameTime: 16,
  updateTime: 2,
  renderTime: 4,
  togglePlayPause: vi.fn(),
  reset: vi.fn(),
  setBoidCount: vi.fn(),
  setMousePosition: vi.fn(),
  updateParameter: vi.fn()
})

let mockSimulation = createMockSimulation()

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
    mockSimulation = createMockSimulation()
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
    mockSimulation.isLoading = true
    
    render(<App />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it("エラー状態が表示される", () => {
    mockSimulation.error = new Error("WASM load failed")
    mockSimulation.isLoading = false
    
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
    
    expect(mockSimulation.setMousePosition).toHaveBeenCalledWith(150, 200)
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
    // 重複を避けるため、ユニークな値を使用
    mockSimulation.parameters = {
      separationRadius: 25,
      separationStrength: 1.5,
      alignmentRadius: 55,
      alignmentStrength: 1.2,
      cohesionRadius: 45,
      cohesionStrength: 0.8,
      mouseAvoidanceDistance: 120
    }
    
    render(<App />)
    
    expect(screen.getByText("25")).toBeInTheDocument() // separationRadius
    expect(screen.getByText("1.5")).toBeInTheDocument() // separationStrength
    expect(screen.getByText("55")).toBeInTheDocument() // alignmentRadius
    expect(screen.getByText("1.2")).toBeInTheDocument() // alignmentStrength
    expect(screen.getByText("45")).toBeInTheDocument() // cohesionRadius
    expect(screen.getByText("0.8")).toBeInTheDocument() // cohesionStrength
    expect(screen.getByText("120")).toBeInTheDocument() // mouseAvoidanceDistance
  })
})