export type Vector2 = {
  x: number
  y: number
}

export type Boid = {
  id: number
  position: Vector2
  velocity: Vector2
}

export type SimulationParameters = {
  separationRadius: number
  separationStrength: number
  alignmentRadius: number
  alignmentStrength: number
  cohesionRadius: number
  cohesionStrength: number
  mouseAvoidanceDistance: number
}

export type SimulationState = {
  isLoading: boolean
  error: Error | null
  isPlaying: boolean
  boidCount: number
  parameters: SimulationParameters
  boids: Boid[]
  fps: number
}

export type PerformanceMetrics = {
  fps: number
  frameTime: number
  updateTime: number
}