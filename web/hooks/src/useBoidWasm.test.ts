import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { useBoidWasm } from "./useBoidWasm"

// 注記: vitestのjsdom環境では、動的<script>タグが実行するグローバル代入は
// テストから見える window(=populateGlobalによるNode globalのエイリアス)には
// 反映されない(jsdomの実windowとテスト側windowが別オブジェクトになるため)。
// そのため、wasm_exec.js自体の内容は素通しの文字列としてfetchをモックしつつ、
// 「Goプログラムが実際に行うこと」であるwindow.Goの定義そのものは
// vi.stubGlobalで直接差し込む。これによりuseBoidWasm.tsの実装コードは
// 一切変更せず、実際のフックロジック(fetch→WebAssembly.instantiate→
// go.run→グローバル関数の読み取り→getBoidsの変換)を本物のまま検証できる。

function mockWasmExports() {
  return {
    initializeSimulation: vi.fn(),
    updateSimulation: vi.fn(),
    setMousePosition: vi.fn(),
    getBoidCount: vi.fn(() => 2),
    getAllBoidData: vi.fn(() => [
      { x: 10, y: 20, vx: 1, vy: 2 },
      { x: 30, y: 40, vx: -1, vy: -2 },
    ]),
    updateSeparationParams: vi.fn(),
    updateAlignmentParams: vi.fn(),
    updateCohesionParams: vi.fn(),
    updateMouseAvoidanceDistance: vi.fn(),
  }
}

type MockExports = ReturnType<typeof mockWasmExports>

/** window.Goのモック実装。実際のGoプログラムはブロックする直前に
 * グローバル関数を同期的に登録してから、通常は解決しないPromiseを返す。 */
function stubGo(onRun: (instance: unknown) => Promise<void>) {
  vi.stubGlobal(
    "Go",
    class {
      importObject: WebAssembly.Imports = {}
      run(instance: unknown) {
        return onRun(instance)
      }
    }
  )
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn(async (url: string) => {
    if (url === "./wasm_exec.js") {
      return { text: async () => "/* wasm_exec.js stub */" } as Response
    }
    if (url === "./boid.wasm") {
      return { arrayBuffer: async () => new ArrayBuffer(8) } as Response
    }
    throw new Error(`unexpected fetch: ${url}`)
  })
  vi.stubGlobal("fetch", fetchMock)
  // instantiate()には複数のオーバーロードがあり型推論が曖昧になるため、
  // モック対象はテストでのみ使う戻り値の形にキャストする
  const instantiateSpy = vi.spyOn(WebAssembly, "instantiate") as unknown as {
    mockResolvedValue: (value: WebAssembly.WebAssemblyInstantiatedSource) => void
  }
  instantiateSpy.mockResolvedValue({
    instance: {} as WebAssembly.Instance,
    module: {} as WebAssembly.Module,
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  // Object.assign(window, exports)によるテスト間の汚染を防ぐ
  for (const key of Object.keys(mockWasmExports()) as (keyof MockExports)[]) {
    delete (window as unknown as Record<string, unknown>)[key]
  }
})

test("WASMロードに成功するとisLoadingがfalseになりwasmModuleが使えるようになる", async () => {
  const exports = mockWasmExports()
  stubGo((_instance) => {
    Object.assign(window, exports)
    return new Promise(() => {
      // 実運用同様、Goプログラムの実行中は解決しない
    })
  })

  const { result } = renderHook(() => useBoidWasm())

  expect(result.current.isLoading).toBe(true)

  await waitFor(() => expect(result.current.isLoading).toBe(false))

  expect(result.current.error).toBeNull()
  expect(result.current.wasmModule).not.toBeNull()
})

test("getBoidsがGoのバッチデータをBoid配列に正しく変換する", async () => {
  const exports = mockWasmExports()
  stubGo(() => {
    Object.assign(window, exports)
    return new Promise(() => {
      // 実運用同様、Goプログラムの実行中は解決しない
    })
  })

  const { result } = renderHook(() => useBoidWasm())
  await waitFor(() => expect(result.current.isLoading).toBe(false))

  const boids = result.current.getBoids()

  expect(boids).toEqual([
    { id: 0, position: { x: 10, y: 20 }, velocity: { x: 1, y: 2 } },
    { id: 1, position: { x: 30, y: 40 }, velocity: { x: -1, y: -2 } },
  ])
})

test("initializeSimulation等のラッパーがGoの対応する関数に引数をそのまま渡す", async () => {
  const exports = mockWasmExports()
  stubGo(() => {
    Object.assign(window, exports)
    return new Promise(() => {
      // 実運用同様、Goプログラムの実行中は解決しない
    })
  })

  const { result } = renderHook(() => useBoidWasm())
  await waitFor(() => expect(result.current.isLoading).toBe(false))

  act(() => {
    result.current.initializeSimulation(100, 800, 600)
    result.current.updateSeparationParams(25, 1.5)
  })

  expect(exports.initializeSimulation).toHaveBeenCalledWith(100, 800, 600)
  expect(exports.updateSeparationParams).toHaveBeenCalledWith(25, 1.5)
})

test("fetchが失敗するとerrorがセットされwasmModuleはnullのままになる", async () => {
  fetchMock.mockImplementation(async () => {
    throw new Error("network error")
  })

  const { result } = renderHook(() => useBoidWasm())

  await waitFor(() => expect(result.current.isLoading).toBe(false))

  expect(result.current.error).not.toBeNull()
  expect(result.current.error?.message).toBe("network error")
  expect(result.current.wasmModule).toBeNull()
})

test("Goプログラムの起動が同期的に失敗するとerrorがセットされる", async () => {
  stubGo(() => {
    throw new Error("go runtime panic")
  })

  const { result } = renderHook(() => useBoidWasm())

  await waitFor(() => expect(result.current.isLoading).toBe(false))

  expect(result.current.error).not.toBeNull()
  expect(result.current.wasmModule).toBeNull()
})

test("Goプログラムが登録すべき関数を登録せずに終了した場合、破損したwasmModuleを公開しない", async () => {
  stubGo(() => {
    // 関数を一切登録しない(ビルド不整合・関数名変更等を想定)
    return new Promise(() => {
      // 実運用同様、Goプログラムの実行中は解決しない
    })
  })

  const { result } = renderHook(() => useBoidWasm())

  await waitFor(() => expect(result.current.isLoading).toBe(false))

  // window.initializeSimulation等がundefinedのまま正常系として扱われてはいけない
  expect(result.current.wasmModule).toBeNull()
  expect(result.current.error).not.toBeNull()
})

test("go.run()が非同期に失敗(reject)した場合もerrorがセットされる", async () => {
  const exports = mockWasmExports()
  let rejectRun: (err: Error) => void = () => {
    // stubGo内で実体が差し替えられるまでのプレースホルダー
  }
  stubGo(() => {
    // 実際のGoプログラム同様、まず関数を同期登録してから実行を継続する
    Object.assign(window, exports)
    return new Promise((_resolve, reject) => {
      rejectRun = reject
    })
  })

  const { result } = renderHook(() => useBoidWasm())
  await waitFor(() => expect(result.current.isLoading).toBe(false))

  // ロード完了時点では正常
  expect(result.current.error).toBeNull()
  expect(result.current.wasmModule).not.toBeNull()

  // 実行中にGo側が非同期にクラッシュした場合、それを検知できる
  await act(async () => {
    rejectRun(new Error("go runtime crashed during execution"))
    await Promise.resolve()
  })

  await waitFor(() => expect(result.current.error).not.toBeNull())
  expect(result.current.wasmModule).toBeNull()
})
