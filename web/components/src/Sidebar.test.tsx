import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { Sidebar } from "./Sidebar"

const defaultProps = {
  boidCount: 100,
  isPlaying: false,
  parameters: {
    separationRadius: 25,
    separationStrength: 1.5,
    alignmentRadius: 50,
    alignmentStrength: 1.0,
    cohesionRadius: 50,
    cohesionStrength: 1.0,
    mouseAvoidanceDistance: 100
  },
  onBoidCountChange: vi.fn(),
  onPlayPause: vi.fn(),
  onReset: vi.fn(),
  onParameterChange: vi.fn()
}

describe("Sidebar", () => {
  it("サイドバーが表示される", () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByRole("complementary")).toBeInTheDocument()
  })

  it("コントロールタイトルが表示される", () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText("Controls")).toBeInTheDocument()
  })

  it("boid数セレクターが表示される", () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText("Boid Count")).toBeInTheDocument()
  })

  it("パラメータ調整セクションが表示される", () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText("Parameters")).toBeInTheDocument()
  })

  it("制御ボタンセクションが表示される", () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText("Simulation Control")).toBeInTheDocument()
  })

  it("boid数を変更できる", () => {
    const handleBoidCountChange = vi.fn()
    render(<Sidebar {...defaultProps} onBoidCountChange={handleBoidCountChange} />)
    
    const select = screen.getByRole("combobox")
    fireEvent.change(select, { target: { value: "500" } })
    
    expect(handleBoidCountChange).toHaveBeenCalledWith(500)
  })

  it("再生/一時停止ボタンが機能する", () => {
    const handlePlayPause = vi.fn()
    render(<Sidebar {...defaultProps} onPlayPause={handlePlayPause} />)
    
    fireEvent.click(screen.getByRole("button", { name: /play/i }))
    expect(handlePlayPause).toHaveBeenCalledTimes(1)
  })

  it("リセットボタンが機能する", () => {
    const handleReset = vi.fn()
    render(<Sidebar {...defaultProps} onReset={handleReset} />)
    
    fireEvent.click(screen.getByRole("button", { name: /reset/i }))
    expect(handleReset).toHaveBeenCalledTimes(1)
  })

  it("パラメータ変更が機能する", () => {
    const handleParameterChange = vi.fn()
    render(<Sidebar {...defaultProps} onParameterChange={handleParameterChange} />)
    
    const sliders = screen.getAllByRole("slider")
    fireEvent.change(sliders[0], { target: { value: "30" } })
    
    expect(handleParameterChange).toHaveBeenCalledWith("separationRadius", 30)
  })
})