import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { BoidCountSelector } from "./BoidCountSelector"

describe("BoidCountSelector", () => {
  it("デフォルト値100が選択されている", () => {
    render(<BoidCountSelector value={100} onChange={() => {}} />)
    
    const select = screen.getByRole("combobox")
    expect(select).toHaveValue("100")
  })

  it("選択肢が正しく表示される", () => {
    render(<BoidCountSelector value={100} onChange={() => {}} />)
    
    expect(screen.getByRole("option", { name: "100 boids" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "500 boids" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "1000 boids" })).toBeInTheDocument()
  })

  it("値を変更できる", () => {
    const handleChange = vi.fn()
    render(<BoidCountSelector value={100} onChange={handleChange} />)
    
    const select = screen.getByRole("combobox")
    fireEvent.change(select, { target: { value: "500" } })
    
    expect(handleChange).toHaveBeenCalledWith(500)
  })

  it("ラベルが表示される", () => {
    render(<BoidCountSelector value={100} onChange={() => {}} />)
    
    expect(screen.getByLabelText("Boid Count")).toBeInTheDocument()
  })
})