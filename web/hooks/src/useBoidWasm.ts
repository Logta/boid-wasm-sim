import { useState, useEffect, useCallback } from "react"
import type { Boid } from "./types"

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

        // Go WASMランタイムをロード
        const wasmExecResponse = await fetch("/wasm_exec.js")
        const wasmExecText = await wasmExecResponse.text()
        
        // wasm_exec.jsを実行してGoオブジェクトを作成
        const script = document.createElement('script')
        script.textContent = wasmExecText
        document.head.appendChild(script)

        // GoのWASMインスタンスを作成
        const go = new (window as any).Go()
        const wasmResponse = await fetch("/boid.wasm")
        const wasmBytes = await wasmResponse.arrayBuffer()
        const wasmModule = await WebAssembly.instantiate(wasmBytes, go.importObject)
        
        // WASMを実行
        go.run(wasmModule.instance)

        // グローバル関数をラップ
        const wasmExports: WasmExports = {
          initializeSimulation: (window as any).initializeSimulation,
          updateSimulation: (window as any).updateSimulation,
          setMousePosition: (window as any).setMousePosition,
          getBoidCount: (window as any).getBoidCount,
          getBoidPositionX: (window as any).getBoidPositionX,
          getBoidPositionY: (window as any).getBoidPositionY,
          getBoidVelocityX: (window as any).getBoidVelocityX,
          getBoidVelocityY: (window as any).getBoidVelocityY,
          updateSeparationParams: (window as any).updateSeparationParams,
          updateAlignmentParams: (window as any).updateAlignmentParams,
          updateCohesionParams: (window as any).updateCohesionParams,
          updateMouseAvoidanceDistance: (window as any).updateMouseAvoidanceDistance,
        }
        
        setWasmModule(wasmExports)
        
        // スクリプトをクリーンアップ
        document.head.removeChild(script)
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
        id: i,
        position: {
          x: wasmModule.getBoidPositionX(i),
          y: wasmModule.getBoidPositionY(i)
        },
        velocity: {
          x: wasmModule.getBoidVelocityX(i),
          y: wasmModule.getBoidVelocityY(i)
        }
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