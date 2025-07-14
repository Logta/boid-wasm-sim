// UIコンポーネント
export { Header } from "./Header"
export { Sidebar } from "./Sidebar"
export { BoidRenderer } from "./BoidRenderer"

// shadcn/ui コンポーネント
export * from "./ui"

// Hooks and Types (re-exported from @boid-wasm-sim/hooks)
export { useBoidWasm, useSimulation, usePerformanceMonitor } from "@boid-wasm-sim/hooks"
export type { SimulationParameters, Boid } from "@boid-wasm-sim/hooks"