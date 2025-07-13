import { 
  Boid,
  createBoid,
  updateBoid,
  applyForceToBoid,
  wrapBoidAround,
  createVector2
} from "../types"

describe("Boid", () => {
  it("should create boid with specified position", () => {
    const boid = createBoid(10.0, 20.0)
    expect(boid.position.x).toBe(10.0)
    expect(boid.position.y).toBe(20.0)
    expect(boid.maxSpeed).toBe(2.0)
    expect(boid.maxForce).toBe(0.03)
  })

  it("should have random initial velocity", () => {
    const boid = createBoid(0.0, 0.0)
    // 速度は-2.0から2.0の範囲にあるべき
    expect(boid.velocity.x).toBeGreaterThanOrEqual(-2.0)
    expect(boid.velocity.x).toBeLessThanOrEqual(2.0)
    expect(boid.velocity.y).toBeGreaterThanOrEqual(-2.0)
    expect(boid.velocity.y).toBeLessThanOrEqual(2.0)
  })

  it("should apply force correctly", () => {
    const boid = createBoid(0.0, 0.0)
    const initialAccel = { x: boid.acceleration.x, y: boid.acceleration.y }
    const force = createVector2(1.0, 2.0)
    
    applyForceToBoid(boid, force)
    
    expect(boid.acceleration.x).toBe(initialAccel.x + 1.0)
    expect(boid.acceleration.y).toBe(initialAccel.y + 2.0)
  })

  it("should update position and velocity", () => {
    const boid = createBoid(0.0, 0.0)
    boid.velocity = createVector2(1.0, 1.0)
    boid.acceleration = createVector2(0.5, 0.5)
    
    const initialPos = { x: boid.position.x, y: boid.position.y }
    
    updateBoid(boid)
    
    // 速度は加速度が加わって更新される
    expect(boid.velocity.x).toBe(1.5)
    expect(boid.velocity.y).toBe(1.5)
    
    // 位置は速度分移動する
    expect(boid.position.x).toBe(initialPos.x + 1.5)
    expect(boid.position.y).toBe(initialPos.y + 1.5)
    
    // 加速度はリセットされる
    expect(boid.acceleration.x).toBe(0.0)
    expect(boid.acceleration.y).toBe(0.0)
  })

  it("should wrap around boundaries correctly", () => {
    const boid = createBoid(-5.0, 0.0) // 左端を超える
    wrapBoidAround(boid, 100.0, 100.0)
    expect(boid.position.x).toBe(100.0)

    boid.position.x = 105.0 // 右端を超える
    wrapBoidAround(boid, 100.0, 100.0)
    expect(boid.position.x).toBe(0.0)

    boid.position.y = -5.0 // 上端を超える
    wrapBoidAround(boid, 100.0, 100.0)
    expect(boid.position.y).toBe(100.0)

    boid.position.y = 105.0 // 下端を超える
    wrapBoidAround(boid, 100.0, 100.0)
    expect(boid.position.y).toBe(0.0)
  })

  it("should limit velocity to maxSpeed", () => {
    const boid = createBoid(0.0, 0.0)
    boid.velocity = createVector2(5.0, 5.0) // 最大速度を超える
    boid.acceleration = createVector2(0.0, 0.0)
    
    updateBoid(boid)
    
    // 速度が最大速度に制限されているか確認
    const magnitude = Math.sqrt(boid.velocity.x * boid.velocity.x + boid.velocity.y * boid.velocity.y)
    expect(magnitude).toBeCloseTo(boid.maxSpeed)
  })
})