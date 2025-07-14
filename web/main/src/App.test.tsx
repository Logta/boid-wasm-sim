import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
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
  frameTime: 16,
  updateTime: 2,
  renderTime: 4,
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

describe("App", () => {
  it("アプリケーションのタイトルが表示される", () => {
    render(<App />)
    expect(screen.getByText("Boid WASM Simulation")).toBeInTheDocument()
  })

  it("Canvas要素が表示される", () => {
    render(<App />)
    expect(screen.getByRole("img", { name: /simulation canvas/i })).toBeInTheDocument()
  })

  it("サイドバーが表示される", () => {
    render(<App />)
    expect(screen.getByRole("complementary")).toBeInTheDocument()
  })
})