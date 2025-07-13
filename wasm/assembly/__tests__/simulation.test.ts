import { 
  initializeSimulation,
  updateSimulation,
  setMousePosition,
  getBoidCount,
  getBoidPositionX,
  getBoidPositionY,
  updateSeparationParams,
  updateAlignmentParams,
  updateCohesionParams,
  updateMouseAvoidanceDistance
} from "../boid-simulation"

describe("BoidSimulation", () => {
  beforeEach(() => {
    // 各テスト前にシミュレーションを初期化
    initializeSimulation(10, 800.0, 600.0)
  })

  it("should initialize simulation with correct boid count", () => {
    expect(getBoidCount()).toBe(10)
  })

  it("should initialize boids within canvas bounds", () => {
    const count = getBoidCount()
    for (let i = 0; i < count; i++) {
      const x = getBoidPositionX(i)
      const y = getBoidPositionY(i)
      
      expect(x).toBeGreaterThanOrEqual(0.0)
      expect(x).toBeLessThanOrEqual(800.0)
      expect(y).toBeGreaterThanOrEqual(0.0)
      expect(y).toBeLessThanOrEqual(600.0)
    }
  })

  it("should update boid positions", () => {
    const initialPositions: { x: f32, y: f32 }[] = []
    const count = getBoidCount()
    
    // 初期位置を記録
    for (let i = 0; i < count; i++) {
      initialPositions.push({
        x: getBoidPositionX(i),
        y: getBoidPositionY(i)
      })
    }
    
    // シミュレーション更新
    updateSimulation()
    
    // 位置が変化したか確認（少なくとも一つは動いているはず）
    let hasChanged = false
    for (let i = 0; i < count; i++) {
      const newX = getBoidPositionX(i)
      const newY = getBoidPositionY(i)
      
      if (newX !== initialPositions[i].x || newY !== initialPositions[i].y) {
        hasChanged = true
        break
      }
    }
    
    expect(hasChanged).toBe(true)
  })

  it("should handle mouse position updates", () => {
    setMousePosition(400.0, 300.0)
    // マウス位置設定は例外が出ないことを確認
    expect(() => updateSimulation()).not.toThrow()
  })

  it("should update separation parameters", () => {
    expect(() => updateSeparationParams(30.0, 2.0)).not.toThrow()
    expect(() => updateSimulation()).not.toThrow()
  })

  it("should update alignment parameters", () => {
    expect(() => updateAlignmentParams(60.0, 1.5)).not.toThrow()
    expect(() => updateSimulation()).not.toThrow()
  })

  it("should update cohesion parameters", () => {
    expect(() => updateCohesionParams(60.0, 1.5)).not.toThrow()
    expect(() => updateSimulation()).not.toThrow()
  })

  it("should update mouse avoidance distance", () => {
    expect(() => updateMouseAvoidanceDistance(150.0)).not.toThrow()
    expect(() => updateSimulation()).not.toThrow()
  })

  it("should handle out of bounds boid index", () => {
    expect(getBoidPositionX(-1)).toBe(0.0)
    expect(getBoidPositionY(-1)).toBe(0.0)
    expect(getBoidPositionX(999)).toBe(0.0)
    expect(getBoidPositionY(999)).toBe(0.0)
  })

  it("should maintain boids within canvas after wrapping", () => {
    // 複数回更新して境界処理をテスト
    for (let frame = 0; frame < 100; frame++) {
      updateSimulation()
    }
    
    const count = getBoidCount()
    for (let i = 0; i < count; i++) {
      const x = getBoidPositionX(i)
      const y = getBoidPositionY(i)
      
      expect(x).toBeGreaterThanOrEqual(0.0)
      expect(x).toBeLessThanOrEqual(800.0)
      expect(y).toBeGreaterThanOrEqual(0.0)
      expect(y).toBeLessThanOrEqual(600.0)
    }
  })

  it("should initialize different number of boids", () => {
    initializeSimulation(5, 400.0, 300.0)
    expect(getBoidCount()).toBe(5)

    initializeSimulation(100, 1000.0, 800.0)
    expect(getBoidCount()).toBe(100)
  })
})