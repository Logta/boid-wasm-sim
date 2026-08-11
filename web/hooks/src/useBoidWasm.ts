import { useCallback, useEffect, useState } from "react"
import type { Boid } from "./types"

declare global {
  interface Window {
    Go: new () => {
      // Goランタイムはプログラムが終了するまで解決しないPromiseを返す
      run: (instance: WebAssembly.Instance) => Promise<void>
      importObject: WebAssembly.Imports
    }
    initializeSimulation: (count: number, width: number, height: number) => void
    updateSimulation: () => void
    setMousePosition: (x: number, y: number) => void
    getBoidCount: () => number
    getAllBoidData: () => Array<{ x: number; y: number; vx: number; vy: number }>
    updateSeparationParams: (radius: number, strength: number) => void
    updateAlignmentParams: (radius: number, strength: number) => void
    updateCohesionParams: (radius: number, strength: number) => void
    updateMouseAvoidanceDistance: (distance: number) => void
  }
}

type WasmExports = {
  initializeSimulation: (count: number, width: number, height: number) => void
  updateSimulation: () => void
  setMousePosition: (x: number, y: number) => void
  getBoidCount: () => number
  getAllBoidData: () => Array<{ x: number; y: number; vx: number; vy: number }>
  updateSeparationParams: (radius: number, strength: number) => void
  updateAlignmentParams: (radius: number, strength: number) => void
  updateCohesionParams: (radius: number, strength: number) => void
  updateMouseAvoidanceDistance: (distance: number) => void
}

const WASM_EXPORT_KEYS: (keyof WasmExports)[] = [
  "initializeSimulation",
  "updateSimulation",
  "setMousePosition",
  "getBoidCount",
  "getAllBoidData",
  "updateSeparationParams",
  "updateAlignmentParams",
  "updateCohesionParams",
  "updateMouseAvoidanceDistance",
]

export function useBoidWasm() {
  const [wasmModule, setWasmModule] = useState<WasmExports | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadWasm() {
      try {
        setIsLoading(true)
        setError(null)

        // Go WASMランタイムをロード（相対パスを使用）
        const wasmExecResponse = await fetch("./wasm_exec.js")
        const wasmExecText = await wasmExecResponse.text()

        // wasm_exec.jsを実行してGoオブジェクトを作成
        const script = document.createElement("script")
        script.textContent = wasmExecText
        document.head.appendChild(script)

        // GoのWASMインスタンスを作成（相対パスを使用）
        const go = new window.Go()
        const wasmResponse = await fetch("./boid.wasm")
        const wasmBytes = await wasmResponse.arrayBuffer()
        const wasmModule = await WebAssembly.instantiate(wasmBytes, go.importObject)

        // WASMを実行。go.run()はGoプログラムが終了するまで解決しないため
        // awaitはしないが、実行中の異常終了(reject)は非同期に検知してエラー状態へ反映する。
        go.run(wasmModule.instance).catch((runErr: unknown) => {
          if (!isMounted) return
          setError(
            runErr instanceof Error
              ? runErr
              : new Error("WASM実行中に予期しないエラーが発生しました")
          )
          setWasmModule(null)
        })

        // グローバル関数をラップ
        const wasmExports: WasmExports = {
          initializeSimulation: window.initializeSimulation,
          updateSimulation: window.updateSimulation,
          setMousePosition: window.setMousePosition,
          getBoidCount: window.getBoidCount,
          getAllBoidData: window.getAllBoidData,
          updateSeparationParams: window.updateSeparationParams,
          updateAlignmentParams: window.updateAlignmentParams,
          updateCohesionParams: window.updateCohesionParams,
          updateMouseAvoidanceDistance: window.updateMouseAvoidanceDistance,
        }

        // Goプログラムが期待する関数を登録し終える前に読み取ってしまうと
        // 一見「ロード成功」に見えたまま後続の呼び出しで初めて壊れるため、
        // ここで必ず検証してから公開する。
        const missingExports = WASM_EXPORT_KEYS.filter(
          (key) => typeof wasmExports[key] !== "function"
        )
        if (missingExports.length > 0) {
          throw new Error(
            `WASMモジュールの初期化に失敗しました（未登録の関数: ${missingExports.join(", ")}）`
          )
        }

        if (isMounted) {
          setWasmModule(wasmExports)
        }

        // スクリプトをクリーンアップ
        document.head.removeChild(script)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err : new Error("Unknown WASM load error"))
        setWasmModule(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadWasm()

    return () => {
      isMounted = false
    }
  }, [])

  const initializeSimulation = useCallback(
    (count: number, width: number, height: number) => {
      if (wasmModule) {
        wasmModule.initializeSimulation(count, width, height)
      }
    },
    [wasmModule]
  )

  const updateSimulation = useCallback(() => {
    if (wasmModule) {
      wasmModule.updateSimulation()
    }
  }, [wasmModule])

  const setMousePosition = useCallback(
    (x: number, y: number) => {
      if (wasmModule) {
        wasmModule.setMousePosition(x, y)
      }
    },
    [wasmModule]
  )

  const getBoids = useCallback((): Boid[] => {
    if (!wasmModule) return []

    // バッチAPIを使用して効率的にデータを取得
    const boidDataArray = wasmModule.getAllBoidData()
    const boids: Boid[] = []

    for (let i = 0; i < boidDataArray.length; i++) {
      const data = boidDataArray[i]
      boids.push({
        id: i,
        position: {
          x: data.x,
          y: data.y,
        },
        velocity: {
          x: data.vx,
          y: data.vy,
        },
      })
    }

    return boids
  }, [wasmModule])

  const updateSeparationParams = useCallback(
    (radius: number, strength: number) => {
      if (wasmModule) {
        wasmModule.updateSeparationParams(radius, strength)
      }
    },
    [wasmModule]
  )

  const updateAlignmentParams = useCallback(
    (radius: number, strength: number) => {
      if (wasmModule) {
        wasmModule.updateAlignmentParams(radius, strength)
      }
    },
    [wasmModule]
  )

  const updateCohesionParams = useCallback(
    (radius: number, strength: number) => {
      if (wasmModule) {
        wasmModule.updateCohesionParams(radius, strength)
      }
    },
    [wasmModule]
  )

  const updateMouseAvoidanceDistance = useCallback(
    (distance: number) => {
      if (wasmModule) {
        wasmModule.updateMouseAvoidanceDistance(distance)
      }
    },
    [wasmModule]
  )

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
    updateMouseAvoidanceDistance,
  }
}
