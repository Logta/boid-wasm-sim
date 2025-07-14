import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { usePerformanceMonitor } from "./usePerformanceMonitor"

describe("usePerformanceMonitor", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    global.performance.now = vi.fn(() => 0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("初期状態でFPSが0になる", () => {
    const { result } = renderHook(() => usePerformanceMonitor())
    
    expect(result.current.fps).toBe(0)
    expect(result.current.frameTime).toBe(0)
    expect(result.current.updateTime).toBe(0)
    expect(result.current.renderTime).toBe(0)
  })

  it("フレーム測定ができる", () => {
    const { result } = renderHook(() => usePerformanceMonitor())
    
    let currentTime = 0
    global.performance.now = vi.fn(() => currentTime)
    
    act(() => {
      result.current.startFrame()
    })
    
    currentTime = 16 // 16ms経過（60fps相当）
    
    act(() => {
      result.current.endFrame()
    })
    
    expect(result.current.frameTime).toBe(16)
  })

  it("FPSが正しく計算される", () => {
    const { result } = renderHook(() => usePerformanceMonitor())
    
    let currentTime = 0
    global.performance.now = vi.fn(() => currentTime)
    
    // 初期時間を設定
    act(() => {
      result.current.reset()
    })
    
    // 複数フレーム実行
    for (let i = 0; i < 60; i++) {
      act(() => {
        result.current.startFrame()
      })
      
      currentTime += 16.67 // 16.67ms/frame = 60fps
      
      act(() => {
        result.current.endFrame()
      })
    }
    
    // 1秒経過をシミュレート
    currentTime = 1000
    
    // 最後のフレームでFPS計算を発生させる
    act(() => {
      result.current.startFrame()
      result.current.endFrame()
    })
    
    expect(result.current.fps).toBeGreaterThan(0)
  })

  it("更新時間とレンダリング時間を測定できる", () => {
    const { result } = renderHook(() => usePerformanceMonitor())
    
    let currentTime = 0
    global.performance.now = vi.fn(() => currentTime)
    
    act(() => {
      result.current.startFrame()
      result.current.startUpdate()
    })
    
    currentTime = 2 // 更新に2ms
    
    act(() => {
      result.current.endUpdate()
      result.current.startRender()
    })
    
    currentTime = 8 // レンダリングに6ms
    
    act(() => {
      result.current.endRender()
    })
    
    currentTime = 16 // フレーム終了
    
    act(() => {
      result.current.endFrame()
    })
    
    expect(result.current.updateTime).toBe(2)
    expect(result.current.renderTime).toBe(6)
    expect(result.current.frameTime).toBe(16)
  })

  it("パフォーマンス統計がリセットされる", () => {
    const { result } = renderHook(() => usePerformanceMonitor())
    
    // フレーム実行
    act(() => {
      result.current.startFrame()
      result.current.endFrame()
    })
    
    // リセット
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.fps).toBe(0)
    expect(result.current.frameTime).toBe(0)
    expect(result.current.updateTime).toBe(0)
    expect(result.current.renderTime).toBe(0)
  })

  it("最大FPSが制限される", () => {
    const { result } = renderHook(() => usePerformanceMonitor(120))
    
    let currentTime = 0
    global.performance.now = vi.fn(() => currentTime)
    
    // 8ms/frame = 125fps（制限より高い）
    for (let i = 0; i < 60; i++) {
      act(() => {
        result.current.startFrame()
      })
      
      currentTime += 8
      
      act(() => {
        result.current.endFrame()
      })
    }
    
    // FPSが120を超えないことを確認
    expect(result.current.fps).toBeLessThanOrEqual(120)
  })

  it("低FPSの警告が出る", () => {
    const onPerformanceWarning = vi.fn()
    const { result } = renderHook(() => 
      usePerformanceMonitor(60, { onPerformanceWarning })
    )
    
    let currentTime = 0
    global.performance.now = vi.fn(() => currentTime)
    
    // reset to initialize timing
    act(() => {
      result.current.reset()
    })
    
    // 低FPSフレームを実行（33ms/frame = 30fps）
    for (let i = 0; i < 100; i++) {
      act(() => {
        result.current.startFrame()
      })
      
      currentTime += 33
      
      act(() => {
        result.current.endFrame()
      })
    }
    
    // 1秒経過をシミュレートして警告を発生させる
    currentTime = 1000
    act(() => {
      result.current.startFrame()
      result.current.endFrame()
    })
    
    expect(onPerformanceWarning).toHaveBeenCalled()
  })
})