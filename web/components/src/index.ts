// UIコンポーネント
export { Header } from "./Header"
export { Sidebar } from "./Sidebar"
export { BoidRenderer } from "./BoidRenderer"
export { SimulationCanvas } from "./SimulationCanvas"

// 制御コンポーネント
export { BoidCountSelector } from "./BoidCountSelector"
export { ParameterPanel } from "./ParameterPanel"
export { ParameterSlider } from "./ParameterSlider"
export { SimulationControls } from "./SimulationControls"

// hooks
export { useBoidWasm } from "./hooks/useBoidWasm"
export { useSimulation } from "./hooks/useSimulation"
export { usePerformanceMonitor } from "./hooks/usePerformanceMonitor"

// 型定義
export type SimulationParameters = {
  separationRadius: number
  separationStrength: number
  alignmentRadius: number
  alignmentStrength: number
  cohesionRadius: number
  cohesionStrength: number
  mouseAvoidanceDistance: number
}

export type Boid = {
  x: number
  y: number
  vx: number
  vy: number
}