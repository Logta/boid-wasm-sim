import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { usePerformanceMonitor } from "./usePerformanceMonitor"

// performance.now()を手動制御することで、実時間に依存せず
// フレーム間隔・FPS計算・警告閾値を決定的に検証する。
let now: number

beforeEach(() => {
  now = 0
  vi.spyOn(performance, "now").mockImplementation(() => now)
})

afterEach(() => {
  vi.restoreAllMocks()
})

function advance(ms: number) {
  now += ms
}

/**
 * frameCount回のフレームを処理させ、最後のフレームでちょうど1000ms経過させる。
 * 1000/N msずつ細かく加算すると浮動小数点誤差で合計が1000msをわずかに
 * 下回り、1秒しきい値判定がフレーム単位でずれてテストが不安定になるため、
 * 最終フレームでnowを直接1000に合わせて決定的にfpsを確定させる。
 */
function runFrames(
  result: { current: { startFrame: () => void; endFrame: () => void } },
  frameCount: number
) {
  for (let i = 0; i < frameCount - 1; i++) {
    result.current.startFrame()
    result.current.endFrame()
  }
  result.current.startFrame()
  now = 1000
  result.current.endFrame()
}

test("1秒未満のフレームではfpsが更新されない", () => {
  const { result } = renderHook(() => usePerformanceMonitor())

  act(() => {
    result.current.startFrame()
    advance(16)
    result.current.endFrame()
  })

  expect(result.current.fps).toBe(0)
  expect(result.current.frameTime).toBeCloseTo(16, 5)
})

test("1秒間に30フレーム処理されるとfpsが30になる", () => {
  const { result } = renderHook(() => usePerformanceMonitor())

  act(() => {
    runFrames(result, 30)
  })

  expect(result.current.fps).toBe(30)
})

test("targetFpsの80%を下回るとonPerformanceWarningが呼ばれる", () => {
  const onPerformanceWarning = vi.fn()
  const { result } = renderHook(() => usePerformanceMonitor(60, { onPerformanceWarning }))

  act(() => {
    // 1秒間に30フレームのみ = 30fps (targetFps=60の80%である48を下回る)
    runFrames(result, 30)
  })

  expect(onPerformanceWarning).toHaveBeenCalledTimes(1)
  expect(onPerformanceWarning).toHaveBeenCalledWith(
    expect.objectContaining({ fps: 30, target: 60 })
  )
})

test("warningThresholdを上回るfpsではonPerformanceWarningが呼ばれない", () => {
  const onPerformanceWarning = vi.fn()
  const { result } = renderHook(() => usePerformanceMonitor(60, { onPerformanceWarning }))

  act(() => {
    // 1秒間に60フレーム = 60fps (閾値48を上回る)
    runFrames(result, 60)
  })

  expect(result.current.fps).toBe(60)
  expect(onPerformanceWarning).not.toHaveBeenCalled()
})

test("resetは全ての計測値を0に戻す", () => {
  const { result } = renderHook(() => usePerformanceMonitor())

  act(() => {
    result.current.startFrame()
    advance(1000)
    result.current.endFrame()
  })
  expect(result.current.fps).toBeGreaterThan(0)

  act(() => {
    result.current.reset()
  })

  expect(result.current.fps).toBe(0)
  expect(result.current.frameTime).toBe(0)
  expect(result.current.updateTime).toBe(0)
  expect(result.current.renderTime).toBe(0)
})

test("resetは経過時間の基準もリセットするため、直後の1フレームだけではfpsが再計算されない", () => {
  const { result } = renderHook(() => usePerformanceMonitor())

  act(() => {
    result.current.startFrame()
    advance(1000)
    result.current.endFrame()
  })
  const fpsBeforeReset = result.current.fps
  expect(fpsBeforeReset).toBeGreaterThan(0)

  act(() => {
    result.current.reset()
  })

  act(() => {
    result.current.startFrame()
    advance(16)
    result.current.endFrame()
  })

  // reset()がlastTimeRefを更新していなければ、直前の経過時間が引き継がれて
  // 1秒しきい値をすぐに超えてしまい、この時点でfpsが再計算されてしまう
  expect(result.current.fps).toBe(0)
})

test("stopはfpsのみ0にし、フレームカウントの基準時刻はリセットしない", () => {
  const { result } = renderHook(() => usePerformanceMonitor())

  act(() => {
    result.current.startFrame()
    advance(1000)
    result.current.endFrame()
  })
  expect(result.current.fps).toBeGreaterThan(0)

  act(() => {
    result.current.stop()
  })

  expect(result.current.fps).toBe(0)
})
