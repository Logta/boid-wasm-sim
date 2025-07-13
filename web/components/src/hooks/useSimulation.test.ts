import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useSimulation } from "./useSimulation"

const mockUseBoidWasm = {
  wasmModule: {},
  isLoading: false,
  error: null,
  initializeSimulation: vi.fn(),
  updateSimulation: vi.fn(),
  setMousePosition: vi.fn(),
  getBoids: vi.fn(() => [
    { x: 100, y: 150, vx: 1, vy: 0 },
    { x: 200, y: 250, vx: 0, vy: 1 }
  ]),
  updateSeparationParams: vi.fn(),
  updateAlignmentParams: vi.fn(),
  updateCohesionParams: vi.fn(),
  updateMouseAvoidanceDistance: vi.fn()
}

vi.mock("./useBoidWasm", () => ({
  useBoidWasm: () => mockUseBoidWasm
}))

// requestAnimationFrame のモック
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16) // ~60fps
  return 1
})

global.cancelAnimationFrame = vi.fn()

describe("useSimulation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("初期状態が正しく設定される", () => {
    const { result } = renderHook(() => useSimulation())
    
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.boidCount).toBe(100)
    expect(result.current.fps).toBe(0)
    expect(result.current.boids).toEqual([])
    expect(result.current.parameters).toEqual({
      separationRadius: 25,
      separationStrength: 1.5,
      alignmentRadius: 50,
      alignmentStrength: 1.0,
      cohesionRadius: 50,
      cohesionStrength: 1.0,
      mouseAvoidanceDistance: 100
    })
  })

  it("WASMロード完了後にシミュレーションが初期化される", () => {
    const { result } = renderHook(() => useSimulation())
    
    expect(mockUseBoidWasm.initializeSimulation).toHaveBeenCalledWith(100, 800, 600)
  })

  it("再生/一時停止ができる", () => {
    const { result } = renderHook(() => useSimulation())
    
    act(() => {
      result.current.togglePlayPause()
    })
    
    expect(result.current.isPlaying).toBe(true)
    
    act(() => {
      result.current.togglePlayPause()
    })
    
    expect(result.current.isPlaying).toBe(false)
  })

  it("シミュレーションをリセットできる", () => {
    const { result } = renderHook(() => useSimulation())
    
    act(() => {
      result.current.reset()
    })
    
    expect(mockUseBoidWasm.initializeSimulation).toHaveBeenCalledWith(100, 800, 600)
    expect(result.current.isPlaying).toBe(false)
  })

  it("boid数を変更できる", () => {
    const { result } = renderHook(() => useSimulation())
    
    act(() => {
      result.current.setBoidCount(500)
    })
    
    expect(result.current.boidCount).toBe(500)
    expect(mockUseBoidWasm.initializeSimulation).toHaveBeenCalledWith(500, 800, 600)
  })

  it("マウス位置を設定できる", () => {
    const { result } = renderHook(() => useSimulation())
    
    act(() => {
      result.current.setMousePosition(150, 200)
    })
    
    expect(mockUseBoidWasm.setMousePosition).toHaveBeenCalledWith(150, 200)
  })

  it("パラメータを更新できる", () => {
    const { result } = renderHook(() => useSimulation())
    
    act(() => {
      result.current.updateParameter("separationRadius", 30)
    })
    
    expect(result.current.parameters.separationRadius).toBe(30)
    expect(mockUseBoidWasm.updateSeparationParams).toHaveBeenCalledWith(30, 1.5)
    
    act(() => {
      result.current.updateParameter("alignmentStrength", 1.8)
    })
    
    expect(result.current.parameters.alignmentStrength).toBe(1.8)
    expect(mockUseBoidWasm.updateAlignmentParams).toHaveBeenCalledWith(50, 1.8)
  })

  it("再生中にアニメーションループが実行される", () => {
    const { result } = renderHook(() => useSimulation())
    
    act(() => {
      result.current.togglePlayPause()
    })
    
    expect(result.current.isPlaying).toBe(true)
    
    // アニメーションフレームを進める
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    expect(mockUseBoidWasm.updateSimulation).toHaveBeenCalled()
    expect(mockUseBoidWasm.getBoids).toHaveBeenCalled()
  })

  it("FPSが計算される", () => {
    const { result } = renderHook(() => useSimulation())
    
    act(() => {
      result.current.togglePlayPause()
    })
    
    // 複数フレーム実行してFPS計算
    act(() => {
      vi.advanceTimersByTime(1000) // 1秒経過
    })
    
    expect(result.current.fps).toBeGreaterThan(0)
  })

  it("一時停止中はアニメーションが停止する", () => {
    const { result } = renderHook(() => useSimulation())
    
    act(() => {
      result.current.togglePlayPause()
      result.current.togglePlayPause() // 再度停止
    })
    
    expect(result.current.isPlaying).toBe(false)
    expect(global.cancelAnimationFrame).toHaveBeenCalled()
  })
})