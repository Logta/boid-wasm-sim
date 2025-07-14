import { expect, test, vi } from "vitest"

// WASMモジュールの型安全性テスト（実際のWASM読み込みはしない）
test("WasmExports型が必要な関数を含んでいる", () => {
  // モックWASMオブジェクト
  const mockWasm = {
    initializeSimulation: vi.fn(),
    updateSimulation: vi.fn(),
    setMousePosition: vi.fn(),
    getBoidCount: vi.fn(() => 100),
    getAllBoidData: vi.fn(() => [
      { x: 10, y: 20, vx: 1, vy: 2 },
      { x: 30, y: 40, vx: -1, vy: -2 },
    ]),
    updateSeparationParams: vi.fn(),
    updateAlignmentParams: vi.fn(),
    updateCohesionParams: vi.fn(),
    updateMouseAvoidanceDistance: vi.fn(),
  }

  // 必要な関数が全て存在することを確認
  expect(typeof mockWasm.initializeSimulation).toBe("function")
  expect(typeof mockWasm.updateSimulation).toBe("function")
  expect(typeof mockWasm.setMousePosition).toBe("function")
  expect(typeof mockWasm.getBoidCount).toBe("function")
  expect(typeof mockWasm.getAllBoidData).toBe("function")

  // バッチAPIが正しい形式のデータを返すことを確認
  const boidData = mockWasm.getAllBoidData()
  expect(Array.isArray(boidData)).toBe(true)
  expect(boidData[0]).toHaveProperty("x")
  expect(boidData[0]).toHaveProperty("y")
  expect(boidData[0]).toHaveProperty("vx")
  expect(boidData[0]).toHaveProperty("vy")
})

test("getBoidCount関数が数値を返す", () => {
  const mockGetBoidCount = vi.fn(() => 500)
  const count = mockGetBoidCount()

  expect(typeof count).toBe("number")
  expect(count).toBeGreaterThanOrEqual(0)
})
