import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ParameterSlider } from "./ParameterSlider"

describe("ParameterSlider", () => {
  it("ラベルが表示される", () => {
    render(
      <ParameterSlider
        label="Test Parameter"
        value={0.5}
        min={0}
        max={1}
        step={0.1}
        onChange={() => {}}
      />
    )
    
    expect(screen.getByText("Test Parameter")).toBeInTheDocument()
  })

  it("現在値が表示される", () => {
    render(
      <ParameterSlider
        label="Test Parameter"
        value={0.75}
        min={0}
        max={1}
        step={0.1}
        onChange={() => {}}
      />
    )
    
    expect(screen.getByText("0.75")).toBeInTheDocument()
  })

  it("スライダーが正しい値を持つ", () => {
    render(
      <ParameterSlider
        label="Test Parameter"
        value={0.5}
        min={0}
        max={1}
        step={0.1}
        onChange={() => {}}
      />
    )
    
    const slider = screen.getByRole("slider")
    expect(slider).toHaveValue("0.5")
  })

  it("値を変更できる", () => {
    const handleChange = vi.fn()
    render(
      <ParameterSlider
        label="Test Parameter"
        value={0.5}
        min={0}
        max={1}
        step={0.1}
        onChange={handleChange}
      />
    )
    
    const slider = screen.getByRole("slider")
    fireEvent.change(slider, { target: { value: "0.8" } })
    
    expect(handleChange).toHaveBeenCalledWith(0.8)
  })

  it("min、max、stepが正しく設定される", () => {
    render(
      <ParameterSlider
        label="Test Parameter"
        value={5}
        min={0}
        max={10}
        step={1}
        onChange={() => {}}
      />
    )
    
    const slider = screen.getByRole("slider")
    expect(slider).toHaveAttribute("min", "0")
    expect(slider).toHaveAttribute("max", "10")
    expect(slider).toHaveAttribute("step", "1")
  })
})