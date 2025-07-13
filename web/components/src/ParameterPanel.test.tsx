import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ParameterPanel } from "./ParameterPanel"

const defaultParams = {
  separationRadius: 25,
  separationStrength: 1.5,
  alignmentRadius: 50,
  alignmentStrength: 1.0,
  cohesionRadius: 50,
  cohesionStrength: 1.0,
  mouseAvoidanceDistance: 100
}

describe("ParameterPanel", () => {
  it("分離パラメータのスライダーが表示される", () => {
    render(
      <ParameterPanel 
        parameters={defaultParams}
        onParameterChange={() => {}}
      />
    )
    
    expect(screen.getByText("Separation Radius")).toBeInTheDocument()
    expect(screen.getByText("Separation Strength")).toBeInTheDocument()
  })

  it("整列パラメータのスライダーが表示される", () => {
    render(
      <ParameterPanel 
        parameters={defaultParams}
        onParameterChange={() => {}}
      />
    )
    
    expect(screen.getByText("Alignment Radius")).toBeInTheDocument()
    expect(screen.getByText("Alignment Strength")).toBeInTheDocument()
  })

  it("結合パラメータのスライダーが表示される", () => {
    render(
      <ParameterPanel 
        parameters={defaultParams}
        onParameterChange={() => {}}
      />
    )
    
    expect(screen.getByText("Cohesion Radius")).toBeInTheDocument()
    expect(screen.getByText("Cohesion Strength")).toBeInTheDocument()
  })

  it("マウス回避距離のスライダーが表示される", () => {
    render(
      <ParameterPanel 
        parameters={defaultParams}
        onParameterChange={() => {}}
      />
    )
    
    expect(screen.getByText("Mouse Avoidance Distance")).toBeInTheDocument()
  })

  it("パラメータ変更時にコールバックが呼ばれる", () => {
    const handleParameterChange = vi.fn()
    render(
      <ParameterPanel 
        parameters={defaultParams}
        onParameterChange={handleParameterChange}
      />
    )
    
    const sliders = screen.getAllByRole("slider")
    fireEvent.change(sliders[0], { target: { value: "30" } })
    
    expect(handleParameterChange).toHaveBeenCalledWith("separationRadius", 30)
  })

  it("現在のパラメータ値が正しく表示される", () => {
    const customParams = {
      separationRadius: 25,
      separationStrength: 1.5,
      alignmentRadius: 55,
      alignmentStrength: 1.2,
      cohesionRadius: 45,
      cohesionStrength: 0.8,
      mouseAvoidanceDistance: 120
    }
    
    render(
      <ParameterPanel 
        parameters={customParams}
        onParameterChange={() => {}}
      />
    )
    
    expect(screen.getByText("25")).toBeInTheDocument() // separationRadius
    expect(screen.getByText("1.5")).toBeInTheDocument() // separationStrength
    expect(screen.getByText("55")).toBeInTheDocument() // alignmentRadius
    expect(screen.getByText("1.2")).toBeInTheDocument() // alignmentStrength
    expect(screen.getByText("45")).toBeInTheDocument() // cohesionRadius
    expect(screen.getByText("0.8")).toBeInTheDocument() // cohesionStrength
    expect(screen.getByText("120")).toBeInTheDocument() // mouseAvoidanceDistance
  })
})