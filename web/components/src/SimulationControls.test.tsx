import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { SimulationControls } from "./SimulationControls"

describe("SimulationControls", () => {
  it("再生ボタンが表示される（停止中の場合）", () => {
    render(
      <SimulationControls 
        isPlaying={false} 
        onPlayPause={() => {}} 
        onReset={() => {}} 
      />
    )
    
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument()
  })

  it("一時停止ボタンが表示される（再生中の場合）", () => {
    render(
      <SimulationControls 
        isPlaying={true} 
        onPlayPause={() => {}} 
        onReset={() => {}} 
      />
    )
    
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument()
  })

  it("リセットボタンが表示される", () => {
    render(
      <SimulationControls 
        isPlaying={false} 
        onPlayPause={() => {}} 
        onReset={() => {}} 
      />
    )
    
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument()
  })

  it("再生ボタンをクリックするとonPlayPauseが呼ばれる", () => {
    const handlePlayPause = vi.fn()
    render(
      <SimulationControls 
        isPlaying={false} 
        onPlayPause={handlePlayPause} 
        onReset={() => {}} 
      />
    )
    
    fireEvent.click(screen.getByRole("button", { name: /play/i }))
    expect(handlePlayPause).toHaveBeenCalledTimes(1)
  })

  it("リセットボタンをクリックするとonResetが呼ばれる", () => {
    const handleReset = vi.fn()
    render(
      <SimulationControls 
        isPlaying={false} 
        onPlayPause={() => {}} 
        onReset={handleReset} 
      />
    )
    
    fireEvent.click(screen.getByRole("button", { name: /reset/i }))
    expect(handleReset).toHaveBeenCalledTimes(1)
  })
})