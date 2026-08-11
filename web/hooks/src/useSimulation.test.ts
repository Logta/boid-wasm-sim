import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { useSimulation } from "./useSimulation"

const initializeSimulation = vi.fn()
const updateSimulation = vi.fn()
const setMousePosition = vi.fn()
const getBoids = vi.fn(() => [])
const updateSeparationParams = vi.fn()
const updateAlignmentParams = vi.fn()
const updateCohesionParams = vi.fn()
const updateMouseAvoidanceDistance = vi.fn()

// レンダー毎に新しいオブジェクトを返すとuseEffectの依存配列が
// 毎回変化したと誤認され、意図しない再実行を招く。実際のuseBoidWasmは
// useStateで管理された安定した参照を返すため、モックも安定させる。
const wasmModuleStub = {}

vi.mock("./useBoidWasm", () => ({
  useBoidWasm: () => ({
    wasmModule: wasmModuleStub,
    isLoading: false,
    error: null,
    initializeSimulation,
    updateSimulation,
    setMousePosition,
    getBoids,
    updateSeparationParams,
    updateAlignmentParams,
    updateCohesionParams,
    updateMouseAvoidanceDistance,
  }),
}))

let rafCallbacks: FrameRequestCallback[] = []

beforeEach(() => {
  // clearAllMocksは呼び出し履歴のみをリセットし、前のテストで設定した
  // mockImplementationは残ってしまうため、resetAllMocksで実装ごとリセットする
  vi.resetAllMocks()
  getBoids.mockReturnValue([])
  rafCallbacks = []
  // requestAnimationFrameを手動制御し、テストから1フレームずつ進められるようにする
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    rafCallbacks.push(cb)
    return rafCallbacks.length
  })
  vi.stubGlobal("cancelAnimationFrame", () => {
    // このテストではキャンセル自体の検証は不要なため何もしない
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function runNextFrame() {
  const cb = rafCallbacks.shift()
  if (!cb) throw new Error("no pending animation frame")
  act(() => {
    cb(0)
  })
}

test("WASMロード完了後に一度だけシミュレーションが初期化される", async () => {
  renderHook(() => useSimulation())

  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))
  expect(initializeSimulation).toHaveBeenCalledWith(100, 800, 600)
})

test("setBoidCount(旧changeBoidCount)は初期化を二重実行しない", async () => {
  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  act(() => {
    result.current.setBoidCount(500)
  })

  await waitFor(() => expect(result.current.boidCount).toBe(500))

  // マウント時の1回(count=100) + boidCount変更に伴う1回(count=500) = 合計2回のみ。
  // 直接呼び出しとuseEffectの両方から呼ばれると3回になってしまう(二重初期化バグ)。
  expect(initializeSimulation).toHaveBeenCalledTimes(2)
  expect(initializeSimulation).toHaveBeenLastCalledWith(500, 800, 600)
  expect(getBoids).toHaveBeenCalledTimes(2)
})

test("togglePlayPauseはisPlayingを反転する", async () => {
  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  expect(result.current.isPlaying).toBe(false)

  act(() => {
    result.current.togglePlayPause()
  })
  expect(result.current.isPlaying).toBe(true)

  act(() => {
    result.current.togglePlayPause()
  })
  expect(result.current.isPlaying).toBe(false)
})

test("resetはisPlayingをfalseに戻しシミュレーションを再初期化する", async () => {
  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  act(() => {
    result.current.togglePlayPause()
  })
  expect(result.current.isPlaying).toBe(true)

  act(() => {
    result.current.reset()
  })

  expect(result.current.isPlaying).toBe(false)
  expect(initializeSimulation).toHaveBeenCalledTimes(2)
})

test.each([
  ["separationRadius", 40],
  ["separationStrength", 2.5],
  ["alignmentRadius", 80],
  ["alignmentStrength", 2.0],
  ["cohesionRadius", 90],
  ["cohesionStrength", 1.8],
] as const)("updateParameterで%sを%sに変更するとparametersに反映される", async (key, value) => {
  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  act(() => {
    result.current.updateParameter(key, value)
  })

  expect(result.current.parameters[key]).toBe(value)
})

test("updateParameterはseparationRadius変更時にupdateAlignmentParams等の無関係な関数を呼ばない", async () => {
  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  act(() => {
    result.current.updateParameter("separationRadius", 40)
  })

  expect(updateSeparationParams).toHaveBeenCalledWith(40, expect.any(Number))
  expect(updateAlignmentParams).not.toHaveBeenCalled()
  expect(updateCohesionParams).not.toHaveBeenCalled()
  expect(updateMouseAvoidanceDistance).not.toHaveBeenCalled()
})

test("updateParameterでmouseAvoidanceDistanceを変更するとupdateMouseAvoidanceDistanceが呼ばれる", async () => {
  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  act(() => {
    result.current.updateParameter("mouseAvoidanceDistance", 150)
  })

  expect(updateMouseAvoidanceDistance).toHaveBeenCalledWith(150)
})

test("アニメーションループ中にupdateSimulationが例外を投げても再生が停止しエラー状態になる", async () => {
  updateSimulation.mockImplementation(() => {
    throw new Error("wasm crashed mid-frame")
  })

  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  act(() => {
    result.current.togglePlayPause()
  })
  expect(result.current.isPlaying).toBe(true)
  expect(rafCallbacks.length).toBeGreaterThan(0)

  runNextFrame()

  expect(result.current.isPlaying).toBe(false)
  expect(result.current.error).not.toBeNull()
  // 例外発生後は次のフレームを予約しない(無限に例外を吐き続けるループにしない)
  expect(rafCallbacks.length).toBe(0)
})

test("アニメーションループが正常な場合は例外なく毎フレーム再スケジュールされる", async () => {
  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  act(() => {
    result.current.togglePlayPause()
  })
  expect(rafCallbacks.length).toBe(1)

  runNextFrame()

  expect(result.current.isPlaying).toBe(true)
  expect(result.current.error).toBeNull()
  expect(updateSimulation).toHaveBeenCalledTimes(1)
  // 正常なフレームの後は次のフレームが再予約される
  expect(rafCallbacks.length).toBe(1)
})
