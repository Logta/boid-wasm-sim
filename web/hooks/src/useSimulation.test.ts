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
// ロード中・ロード失敗の状態を再現するためにテストから切り替える
let wasmState: { wasmModule: object | null; isLoading: boolean } = {
  wasmModule: wasmModuleStub,
  isLoading: false,
}

vi.mock("./useBoidWasm", () => ({
  useBoidWasm: () => ({
    wasmModule: wasmState.wasmModule,
    isLoading: wasmState.isLoading,
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
const cancelAnimationFrameMock = vi.fn()

beforeEach(() => {
  // clearAllMocksは呼び出し履歴のみをリセットし、前のテストで設定した
  // mockImplementationは残ってしまうため、resetAllMocksで実装ごとリセットする
  vi.resetAllMocks()
  wasmState = { wasmModule: wasmModuleStub, isLoading: false }
  getBoids.mockReturnValue([])
  rafCallbacks = []
  // requestAnimationFrameを手動制御し、テストから1フレームずつ進められるようにする
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    rafCallbacks.push(cb)
    return rafCallbacks.length
  })
  vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrameMock)
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

test.each([
  ["ロード中", { wasmModule: wasmModuleStub, isLoading: true }],
  ["ロード失敗(wasmModuleがnull)", { wasmModule: null, isLoading: false }],
])("%sの間はシミュレーションを初期化しない", (_label, state) => {
  wasmState = state
  renderHook(() => useSimulation())

  expect(initializeSimulation).not.toHaveBeenCalled()
  expect(getBoids).not.toHaveBeenCalled()
})

test("WASMが無い状態でresetしても初期化を呼ばない", () => {
  wasmState = { wasmModule: null, isLoading: false }
  const { result } = renderHook(() => useSimulation())

  act(() => {
    result.current.reset()
  })

  expect(initializeSimulation).not.toHaveBeenCalled()
})

test("再生中は毎フレームgetBoidsの結果をboidsに反映し、1秒経つとfpsが計測される", async () => {
  let now = 0
  vi.spyOn(performance, "now").mockImplementation(() => now)
  const frameBoids = [{ id: 0, position: { x: 1, y: 2 }, velocity: { x: 3, y: 4 } }]

  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))
  getBoids.mockReturnValue(frameBoids as never)

  act(() => {
    result.current.togglePlayPause()
  })
  for (let i = 0; i < 30; i++) {
    now += 1000 / 30
    runNextFrame()
  }
  now = 1000
  runNextFrame()

  expect(result.current.boids).toEqual(frameBoids)
  expect(result.current.fps).toBeGreaterThan(0)

  // 一時停止するとfpsは0に戻る
  act(() => {
    result.current.togglePlayPause()
  })
  expect(result.current.fps).toBe(0)
})

test("一時停止すると予約済みのフレームをキャンセルし、取り残されたコールバックが走っても更新しない", async () => {
  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  act(() => {
    result.current.togglePlayPause()
  })
  const pendingFrameId = rafCallbacks.length

  act(() => {
    result.current.togglePlayPause()
  })

  expect(cancelAnimationFrameMock).toHaveBeenCalledWith(pendingFrameId)
  // cancelAnimationFrameのスタブは実際には取り消さないため、残ったコールバックを実行してみる
  runNextFrame()
  expect(updateSimulation).not.toHaveBeenCalled()
  expect(rafCallbacks.length).toBe(0)
})

test("アンマウント時に予約済みのフレームをキャンセルする", async () => {
  const { result, unmount } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  act(() => {
    result.current.togglePlayPause()
  })
  const pendingFrameId = rafCallbacks.length
  cancelAnimationFrameMock.mockClear()

  unmount()

  expect(cancelAnimationFrameMock).toHaveBeenCalledWith(pendingFrameId)
})

test("一度もフレームを予約していなければcancelAnimationFrameを呼ばない", async () => {
  const { unmount } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  unmount()

  expect(cancelAnimationFrameMock).not.toHaveBeenCalled()
})

test("resetは実行時エラーを解除し、再初期化後のboidsを反映する", async () => {
  updateSimulation.mockImplementation(() => {
    throw new Error("wasm crashed mid-frame")
  })
  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  act(() => {
    result.current.togglePlayPause()
  })
  runNextFrame()
  expect(result.current.error).not.toBeNull()

  const resetBoids = [{ id: 0, position: { x: 5, y: 6 }, velocity: { x: 0, y: 1 } }]
  getBoids.mockReturnValue(resetBoids as never)
  act(() => {
    result.current.reset()
  })

  expect(result.current.error).toBeNull()
  expect(result.current.boids).toEqual(resetBoids)
})

test("setMousePositionは座標をそのままWASMに渡す", async () => {
  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  act(() => {
    result.current.setMousePosition(12, 34)
  })

  expect(setMousePosition).toHaveBeenCalledWith(12, 34)
})

test.each([
  ["separationStrength", 2.5, () => updateSeparationParams, [25, 2.5]],
  ["alignmentRadius", 80, () => updateAlignmentParams, [80, 1.0]],
  ["alignmentStrength", 2.0, () => updateAlignmentParams, [50, 2.0]],
  ["cohesionRadius", 90, () => updateCohesionParams, [90, 1.0]],
  ["cohesionStrength", 1.8, () => updateCohesionParams, [50, 1.8]],
] as const)(
  "updateParameterで%sを変更すると対応するWASM関数に半径と強さの組を渡す",
  async (key, value, getFn, expectedArgs) => {
    const { result } = renderHook(() => useSimulation())
    await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

    act(() => {
      result.current.updateParameter(key, value)
    })

    expect(getFn()).toHaveBeenCalledTimes(1)
    expect(getFn()).toHaveBeenCalledWith(...expectedArgs)
  }
)

test("fpsが目標を大きく下回るとconsole.warnで警告する", async () => {
  let now = 0
  vi.spyOn(performance, "now").mockImplementation(() => now)
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {
    // テスト出力を汚さない
  })

  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))
  act(() => {
    result.current.togglePlayPause()
  })
  // 1秒間に10フレーム = 10fps
  for (let i = 0; i < 9; i++) {
    now += 100
    runNextFrame()
  }
  now = 1000
  runNextFrame()

  expect(warn).toHaveBeenCalledWith(expect.stringContaining("FPS dropped to 10"))
  warn.mockRestore()
})

test("Error以外の値が投げられても、既定のメッセージを持つエラー状態になる", async () => {
  updateSimulation.mockImplementation(() => {
    throw "wasm: exit"
  })
  const { result } = renderHook(() => useSimulation())
  await waitFor(() => expect(initializeSimulation).toHaveBeenCalledTimes(1))

  act(() => {
    result.current.togglePlayPause()
  })
  runNextFrame()

  expect(result.current.error?.message).toBe("シミュレーションの実行中にエラーが発生しました")
})
