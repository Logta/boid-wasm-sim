import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useBoidWasm } from "./useBoidWasm"

// WASM関数のモック
const mockInitializeSimulation = vi.fn()
const mockUpdateSimulation = vi.fn()
const mockSetMousePosition = vi.fn()
const mockGetBoidCount = vi.fn(() => 100)
const mockGetBoidPositionX = vi.fn((index: number) => index * 10)
const mockGetBoidPositionY = vi.fn((index: number) => index * 15)
const mockGetBoidVelocityX = vi.fn((index: number) => index * 0.5)
const mockGetBoidVelocityY = vi.fn((index: number) => index * 0.3)
const mockUpdateSeparationParams = vi.fn()
const mockUpdateAlignmentParams = vi.fn()
const mockUpdateCohesionParams = vi.fn()
const mockUpdateMouseAvoidanceDistance = vi.fn()

const mockWasm = {
  initializeSimulation: mockInitializeSimulation,
  updateSimulation: mockUpdateSimulation,
  setMousePosition: mockSetMousePosition,
  getBoidCount: mockGetBoidCount,
  getBoidPositionX: mockGetBoidPositionX,
  getBoidPositionY: mockGetBoidPositionY,
  getBoidVelocityX: mockGetBoidVelocityX,
  getBoidVelocityY: mockGetBoidVelocityY,
  updateSeparationParams: mockUpdateSeparationParams,
  updateAlignmentParams: mockUpdateAlignmentParams,
  updateCohesionParams: mockUpdateCohesionParams,
  updateMouseAvoidanceDistance: mockUpdateMouseAvoidanceDistance,
}

// WebAssembly.instantiate のモック
global.WebAssembly = {
  ...global.WebAssembly,
  instantiate: vi.fn().mockResolvedValue({
    instance: {
      exports: mockWasm
    }
  })
}

describe("useBoidWasm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("WASMモジュールが正常にロードされる", async () => {
    const { result } = renderHook(() => useBoidWasm())
    
    // 初期状態はローディング
    expect(result.current.isLoading).toBe(true)
    expect(result.current.wasmModule).toBe(null)
    
    // WASMロード完了まで待機
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.wasmModule).toBeTruthy()
  })

  it("シミュレーションを初期化できる", async () => {
    const { result } = renderHook(() => useBoidWasm())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    act(() => {
      result.current.initializeSimulation(500, 800, 600)
    })
    
    expect(mockInitializeSimulation).toHaveBeenCalledWith(500, 800, 600)
  })

  it("シミュレーションを更新できる", async () => {
    const { result } = renderHook(() => useBoidWasm())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    act(() => {
      result.current.updateSimulation()
    })
    
    expect(mockUpdateSimulation).toHaveBeenCalled()
  })

  it("boidデータを取得できる", async () => {
    const { result } = renderHook(() => useBoidWasm())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    const boids = result.current.getBoids()
    
    expect(mockGetBoidCount).toHaveBeenCalled()
    expect(boids).toHaveLength(100)
    expect(boids[0]).toEqual({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0
    })
    expect(boids[1]).toEqual({
      x: 10,
      y: 15,
      vx: 0.5,
      vy: 0.3
    })
  })

  it("マウス位置を設定できる", async () => {
    const { result } = renderHook(() => useBoidWasm())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    act(() => {
      result.current.setMousePosition(100, 200)
    })
    
    expect(mockSetMousePosition).toHaveBeenCalledWith(100, 200)
  })

  it("パラメータを更新できる", async () => {
    const { result } = renderHook(() => useBoidWasm())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    act(() => {
      result.current.updateSeparationParams(30, 2.0)
    })
    
    expect(mockUpdateSeparationParams).toHaveBeenCalledWith(30, 2.0)
    
    act(() => {
      result.current.updateAlignmentParams(60, 1.5)
    })
    
    expect(mockUpdateAlignmentParams).toHaveBeenCalledWith(60, 1.5)
    
    act(() => {
      result.current.updateCohesionParams(60, 1.5)
    })
    
    expect(mockUpdateCohesionParams).toHaveBeenCalledWith(60, 1.5)
    
    act(() => {
      result.current.updateMouseAvoidanceDistance(150)
    })
    
    expect(mockUpdateMouseAvoidanceDistance).toHaveBeenCalledWith(150)
  })

  it("WASMロードエラーを処理する", async () => {
    // WebAssembly.instantiate がエラーを投げるようにモック
    global.WebAssembly.instantiate = vi.fn().mockRejectedValue(new Error("WASM load failed"))
    
    const { result } = renderHook(() => useBoidWasm())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.wasmModule).toBe(null)
    expect(result.current.error).toBeTruthy()
  })
})