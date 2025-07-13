import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { SimulationCanvas } from "./SimulationCanvas"

describe("SimulationCanvas", () => {
  it("Canvas要素が表示される", () => {
    render(<SimulationCanvas />)
    expect(screen.getByRole("img", { name: /simulation canvas/i })).toBeInTheDocument()
  })

  it("Canvas要素に正しいサイズが設定される", () => {
    render(<SimulationCanvas />)
    const canvas = screen.getByRole("img", { name: /simulation canvas/i }) as HTMLCanvasElement
    expect(canvas.width).toBe(800)
    expect(canvas.height).toBe(600)
  })

  it("FPS表示エリアが存在する", () => {
    render(<SimulationCanvas />)
    expect(screen.getByText(/fps:/i)).toBeInTheDocument()
  })
})