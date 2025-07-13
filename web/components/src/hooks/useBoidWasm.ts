import { useState, useEffect, useCallback } from "react"

type Boid = {
  x: number
  y: number
  vx: number
  vy: number
}

type WasmExports = {
  initializeSimulation: (count: number, width: number, height: number) => void
  updateSimulation: () => void
  setMousePosition: (x: number, y: number) => void
  getBoidCount: () => number
  getBoidPositionX: (index: number) => number
  getBoidPositionY: (index: number) => number
  getBoidVelocityX: (index: number) => number
  getBoidVelocityY: (index: number) => number
  updateSeparationParams: (radius: number, strength: number) => void
  updateAlignmentParams: (radius: number, strength: number) => void
  updateCohesionParams: (radius: number, strength: number) => void
  updateMouseAvoidanceDistance: (distance: number) => void
}

export function useBoidWasm() {
  const [wasmModule, setWasmModule] = useState<WasmExports | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadWasm() {
      try {
        setIsLoading(true)
        setError(null)

        // WASMモジュールをロード
        const wasmPath = "/build/boid.wasm" // public配下のWASMファイル
        const wasmModule = await WebAssembly.instantiateStreaming(fetch(wasmPath))
        
        setWasmModule(wasmModule.instance.exports as WasmExports)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown WASM load error"))
        setWasmModule(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadWasm()
  }, [])

  const initializeSimulation = useCallback((count: number, width: number, height: number) => {
    if (wasmModule) {
      wasmModule.initializeSimulation(count, width, height)
    }
  }, [wasmModule])

  const updateSimulation = useCallback(() => {
    if (wasmModule) {
      wasmModule.updateSimulation()
    }
  }, [wasmModule])

  const setMousePosition = useCallback((x: number, y: number) => {
    if (wasmModule) {
      wasmModule.setMousePosition(x, y)
    }
  }, [wasmModule])

  const getBoids = useCallback((): Boid[] => {
    if (!wasmModule) return []

    const count = wasmModule.getBoidCount()
    const boids: Boid[] = []

    for (let i = 0; i < count; i++) {
      boids.push({
        x: wasmModule.getBoidPositionX(i),
        y: wasmModule.getBoidPositionY(i),
        vx: wasmModule.getBoidVelocityX(i),
        vy: wasmModule.getBoidVelocityY(i)
      })
    }

    return boids
  }, [wasmModule])

  const updateSeparationParams = useCallback((radius: number, strength: number) => {
    if (wasmModule) {
      wasmModule.updateSeparationParams(radius, strength)
    }
  }, [wasmModule])

  const updateAlignmentParams = useCallback((radius: number, strength: number) => {
    if (wasmModule) {
      wasmModule.updateAlignmentParams(radius, strength)
    }
  }, [wasmModule])

  const updateCohesionParams = useCallback((radius: number, strength: number) => {
    if (wasmModule) {
      wasmModule.updateCohesionParams(radius, strength)
    }
  }, [wasmModule])

  const updateMouseAvoidanceDistance = useCallback((distance: number) => {
    if (wasmModule) {
      wasmModule.updateMouseAvoidanceDistance(distance)
    }
  }, [wasmModule])

  return {
    wasmModule,
    isLoading,
    error,
    initializeSimulation,
    updateSimulation,
    setMousePosition,
    getBoids,
    updateSeparationParams,
    updateAlignmentParams,
    updateCohesionParams,
    updateMouseAvoidanceDistance
  }
}