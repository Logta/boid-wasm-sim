// Vector2の型定義と関数
export type Vector2 = {
  x: f32
  y: f32
}

export function createVector2(x: f32 = 0.0, y: f32 = 0.0): Vector2 {
  return { x, y }
}

export function addVector2(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function subtractVector2(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function multiplyVector2(v: Vector2, scalar: f32): Vector2 {
  return { x: v.x * scalar, y: v.y * scalar }
}

export function divideVector2(v: Vector2, scalar: f32): Vector2 {
  if (scalar === 0.0) return { x: 0.0, y: 0.0 }
  return { x: v.x / scalar, y: v.y / scalar }
}

export function magnitudeVector2(v: Vector2): f32 {
  return Mathf.sqrt(v.x * v.x + v.y * v.y)
}

export function normalizeVector2(v: Vector2): Vector2 {
  const mag = magnitudeVector2(v)
  if (mag === 0.0) return { x: 0.0, y: 0.0 }
  return divideVector2(v, mag)
}

export function distanceVector2(a: Vector2, b: Vector2): f32 {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Mathf.sqrt(dx * dx + dy * dy)
}

export function limitVector2(v: Vector2, max: f32): Vector2 {
  const mag = magnitudeVector2(v)
  if (mag > max) {
    return multiplyVector2(normalizeVector2(v), max)
  }
  return { x: v.x, y: v.y }
}

// Boidの型定義と関数
export type Boid = {
  position: Vector2
  velocity: Vector2
  acceleration: Vector2
  maxSpeed: f32
  maxForce: f32
}

export function createBoid(x: f32, y: f32): Boid {
  return {
    position: createVector2(x, y),
    velocity: createVector2(
      (Math.random() - 0.5) as f32 * 2.0,
      (Math.random() - 0.5) as f32 * 2.0
    ),
    acceleration: createVector2(0.0, 0.0),
    maxSpeed: 2.0,
    maxForce: 0.03
  }
}

export function updateBoid(boid: Boid): void {
  boid.velocity = addVector2(boid.velocity, boid.acceleration)
  boid.velocity = limitVector2(boid.velocity, boid.maxSpeed)
  boid.position = addVector2(boid.position, boid.velocity)
  boid.acceleration = multiplyVector2(boid.acceleration, 0.0) // リセット
}

export function applyForceToBoid(boid: Boid, force: Vector2): void {
  boid.acceleration = addVector2(boid.acceleration, force)
}

export function wrapBoidAround(boid: Boid, width: f32, height: f32): void {
  if (boid.position.x < 0) boid.position.x = width
  if (boid.position.x > width) boid.position.x = 0
  if (boid.position.y < 0) boid.position.y = height
  if (boid.position.y > height) boid.position.y = 0
}

// シミュレーションパラメータの型定義と関数
export type SimulationParams = {
  separationRadius: f32
  separationStrength: f32
  alignmentRadius: f32
  alignmentStrength: f32
  cohesionRadius: f32
  cohesionStrength: f32
  mouseAvoidanceDistance: f32
}

export function createSimulationParams(): SimulationParams {
  return {
    separationRadius: 25.0,
    separationStrength: 1.5,
    alignmentRadius: 50.0,
    alignmentStrength: 1.0,
    cohesionRadius: 50.0,
    cohesionStrength: 1.0,
    mouseAvoidanceDistance: 100.0
  }
}