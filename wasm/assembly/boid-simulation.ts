import { 
  Boid, 
  Vector2, 
  SimulationParams,
  createBoid,
  createVector2,
  createSimulationParams,
  updateBoid,
  applyForceToBoid,
  wrapBoidAround,
  addVector2,
  subtractVector2,
  multiplyVector2,
  divideVector2,
  normalizeVector2,
  limitVector2,
  distanceVector2,
  magnitudeVector2
} from "./types"

// グローバル状態
let boids: Boid[] = []
let params: SimulationParams = createSimulationParams()
let canvasWidth: f32 = 800.0
let canvasHeight: f32 = 600.0
let mousePosition: Vector2 = createVector2(-1000.0, -1000.0)

// 初期化関数
export function initializeSimulation(boidCount: i32, width: f32, height: f32): void {
  canvasWidth = width
  canvasHeight = height
  boids = []
  
  for (let i = 0; i < boidCount; i++) {
    const x = (Math.random() * canvasWidth) as f32
    const y = (Math.random() * canvasHeight) as f32
    boids.push(createBoid(x, y))
  }
}

// 分離行動: 近くのboidから離れる
function separate(boid: Boid): Vector2 {
  let steer = createVector2(0.0, 0.0)
  let count = 0

  for (let i = 0; i < boids.length; i++) {
    const other = boids[i]
    const distance = distanceVector2(boid.position, other.position)
    
    if (distance > 0 && distance < params.separationRadius) {
      const diff = subtractVector2(boid.position, other.position)
      const normalized = normalizeVector2(diff)
      const weighted = divideVector2(normalized, distance)
      steer = addVector2(steer, weighted)
      count++
    }
  }

  if (count > 0) {
    const averaged = divideVector2(steer, count as f32)
    const normalized = normalizeVector2(averaged)
    const desired = multiplyVector2(normalized, boid.maxSpeed)
    const steering = subtractVector2(desired, boid.velocity)
    return multiplyVector2(limitVector2(steering, boid.maxForce), params.separationStrength)
  }

  return createVector2(0.0, 0.0)
}

// 整列行動: 近くのboidと同じ方向に向かう
function align(boid: Boid): Vector2 {
  let sum = createVector2(0.0, 0.0)
  let count = 0

  for (let i = 0; i < boids.length; i++) {
    const other = boids[i]
    const distance = distanceVector2(boid.position, other.position)
    
    if (distance > 0 && distance < params.alignmentRadius) {
      sum = addVector2(sum, other.velocity)
      count++
    }
  }

  if (count > 0) {
    const averaged = divideVector2(sum, count as f32)
    const normalized = normalizeVector2(averaged)
    const desired = multiplyVector2(normalized, boid.maxSpeed)
    const steering = subtractVector2(desired, boid.velocity)
    return multiplyVector2(limitVector2(steering, boid.maxForce), params.alignmentStrength)
  }

  return createVector2(0.0, 0.0)
}

// 結合行動: 近くのboidの中心に向かう
function cohesion(boid: Boid): Vector2 {
  let sum = createVector2(0.0, 0.0)
  let count = 0

  for (let i = 0; i < boids.length; i++) {
    const other = boids[i]
    const distance = distanceVector2(boid.position, other.position)
    
    if (distance > 0 && distance < params.cohesionRadius) {
      sum = addVector2(sum, other.position)
      count++
    }
  }

  if (count > 0) {
    const center = divideVector2(sum, count as f32)
    return multiplyVector2(seek(boid, center), params.cohesionStrength)
  }

  return createVector2(0.0, 0.0)
}

// 指定位置に向かう力を計算
function seek(boid: Boid, target: Vector2): Vector2 {
  const desired = subtractVector2(target, boid.position)
  const normalized = normalizeVector2(desired)
  const scaled = multiplyVector2(normalized, boid.maxSpeed)
  const steering = subtractVector2(scaled, boid.velocity)
  return limitVector2(steering, boid.maxForce)
}

// マウス回避行動
function avoidMouse(boid: Boid): Vector2 {
  const distance = distanceVector2(boid.position, mousePosition)
  
  if (distance < params.mouseAvoidanceDistance) {
    const steer = subtractVector2(boid.position, mousePosition)
    const normalized = normalizeVector2(steer)
    const force = multiplyVector2(normalized, boid.maxForce * 3.0)
    return force
  }

  return createVector2(0.0, 0.0)
}

// シミュレーション更新
export function updateSimulation(): void {
  for (let i = 0; i < boids.length; i++) {
    const boid = boids[i]
    
    // 三つの基本行動を計算
    const separation = separate(boid)
    const alignment = align(boid)
    const cohesionForce = cohesion(boid)
    const mouseAvoidance = avoidMouse(boid)
    
    // 力を適用
    applyForceToBoid(boid, separation)
    applyForceToBoid(boid, alignment)
    applyForceToBoid(boid, cohesionForce)
    applyForceToBoid(boid, mouseAvoidance)
    
    // 位置更新
    updateBoid(boid)
    
    // 境界処理
    wrapBoidAround(boid, canvasWidth, canvasHeight)
  }
}

// マウス位置を設定
export function setMousePosition(x: f32, y: f32): void {
  mousePosition.x = x
  mousePosition.y = y
}

// パラメータ更新関数
export function updateSeparationParams(radius: f32, strength: f32): void {
  params.separationRadius = radius
  params.separationStrength = strength
}

export function updateAlignmentParams(radius: f32, strength: f32): void {
  params.alignmentRadius = radius
  params.alignmentStrength = strength
}

export function updateCohesionParams(radius: f32, strength: f32): void {
  params.cohesionRadius = radius
  params.cohesionStrength = strength
}

export function updateMouseAvoidanceDistance(distance: f32): void {
  params.mouseAvoidanceDistance = distance
}

// データ取得用関数
export function getBoidCount(): i32 {
  return boids.length
}

export function getBoidPositionX(index: i32): f32 {
  if (index < 0 || index >= boids.length) return 0.0
  return boids[index].position.x
}

export function getBoidPositionY(index: i32): f32 {
  if (index < 0 || index >= boids.length) return 0.0
  return boids[index].position.y
}

export function getBoidVelocityX(index: i32): f32 {
  if (index < 0 || index >= boids.length) return 0.0
  return boids[index].velocity.x
}

export function getBoidVelocityY(index: i32): f32 {
  if (index < 0 || index >= boids.length) return 0.0
  return boids[index].velocity.y
}