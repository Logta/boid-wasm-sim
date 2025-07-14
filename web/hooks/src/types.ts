export type Boid = {
  id: number
  position: { x: number; y: number }
  velocity: { x: number; y: number }
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

