import { useCallback, useEffect, useRef, useState } from "react"
import type { Boid, SimulationParameters } from "./types"
import { useBoidWasm } from "./useBoidWasm"
import { usePerformanceMonitor } from "./usePerformanceMonitor"

const DEFAULT_PARAMETERS: SimulationParameters = {
  separationRadius: 25,
  separationStrength: 1.5,
  alignmentRadius: 50,
  alignmentStrength: 1.0,
  cohesionRadius: 50,
  cohesionStrength: 1.0,
  mouseAvoidanceDistance: 100,
}

export function useSimulation() {
  const {
    wasmModule,
    isLoading,
    error: wasmError,
    initializeSimulation,
    updateSimulation,
    setMousePosition: setWasmMousePosition,
    getBoids,
    updateSeparationParams,
    updateAlignmentParams,
    updateCohesionParams,
    updateMouseAvoidanceDistance,
  } = useBoidWasm()

  const [isPlaying, setIsPlaying] = useState(false)
  const [boidCount, setBoidCount] = useState(100)
  const [parameters, setParameters] = useState<SimulationParameters>(DEFAULT_PARAMETERS)
  const [boids, setBoids] = useState<Boid[]>([])
  // アニメーションループ実行中の例外(WASM側のクラッシュ等)を保持する。
  // wasmErrorはロード失敗時のみセットされるため、実行時エラーは別で管理する。
  const [runtimeError, setRuntimeError] = useState<Error | null>(null)

  const animationFrameRef = useRef<number>(0)
  const isPlayingRef = useRef(isPlaying)

  const performanceMonitor = usePerformanceMonitor(60, {
    onPerformanceWarning: (warning) => {
      console.warn(`Performance warning: FPS dropped to ${warning.fps} (target: ${warning.target})`)
    },
  })

  // isPlayingRefを常に最新に保つ
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  // WASMロード完了後にシミュレーション初期化
  useEffect(() => {
    if (wasmModule && !isLoading) {
      initializeSimulation(boidCount, 800, 600)
      setBoids(getBoids())
    }
  }, [wasmModule, isLoading, boidCount, initializeSimulation, getBoids])

  // アニメーションループ
  const animate = useCallback(
    function animateLoop() {
      if (!isPlayingRef.current) {
        return
      }

      try {
        performanceMonitor.startFrame()

        // シミュレーション更新
        performanceMonitor.startUpdate()
        updateSimulation()
        performanceMonitor.endUpdate()

        // レンダリング準備
        performanceMonitor.startRender()
        setBoids(getBoids())
        performanceMonitor.endRender()

        performanceMonitor.endFrame()
        animationFrameRef.current = requestAnimationFrame(animateLoop)
      } catch (err) {
        // WASM側の異常等でフレーム処理が失敗した場合、無音のままフリーズさせず
        // 再生を止めてエラー状態に遷移する(次フレームの予約もしない)
        setRuntimeError(
          err instanceof Error ? err : new Error("シミュレーションの実行中にエラーが発生しました")
        )
        setIsPlaying(false)
      }
    },
    [updateSimulation, getBoids, performanceMonitor]
  )

  // 再生状態変更時のアニメーション制御
  // biome-ignore lint/correctness/useExhaustiveDependencies: performanceMonitorの依存関係を意図的に除外
  useEffect(() => {
    if (isPlaying) {
      // アニメーション開始時のみリセット
      performanceMonitor.reset()
      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      // 停止時はFPSを0に設定するがタイマーはリセットしない
      performanceMonitor.stop()
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying])

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setRuntimeError(null)
    // boidCount自体は変更しないため、boidCountを依存配列に持つ
    // 初期化用useEffectはここでは再発火しない。そのため直接呼び出しても
    // changeBoidCountのような二重初期化にはならない。
    if (wasmModule) {
      initializeSimulation(boidCount, 800, 600)
      setBoids(getBoids())
    }
    performanceMonitor.reset()
  }, [wasmModule, boidCount, initializeSimulation, getBoids, performanceMonitor])

  // boidCount変更時の再初期化は、boidCountを依存配列に含むuseEffect
  // (WASMロード完了後にシミュレーション初期化)が一元的に担う。
  // ここで直接initializeSimulation/getBoidsを呼ぶと、state更新後の
  // 再レンダーでそのuseEffectも実行され、二重に初期化されてしまう。
  const changeBoidCount = useCallback((count: number) => {
    setBoidCount(count)
  }, [])

  const setMousePosition = useCallback(
    (x: number, y: number) => {
      setWasmMousePosition(x, y)
    },
    [setWasmMousePosition]
  )

  const updateParameter = useCallback(
    (key: keyof SimulationParameters, value: number) => {
      setParameters((prev) => {
        const newParams = { ...prev, [key]: value }

        // WASMパラメータ更新
        switch (key) {
          case "separationRadius":
          case "separationStrength":
            updateSeparationParams(newParams.separationRadius, newParams.separationStrength)
            break
          case "alignmentRadius":
          case "alignmentStrength":
            updateAlignmentParams(newParams.alignmentRadius, newParams.alignmentStrength)
            break
          case "cohesionRadius":
          case "cohesionStrength":
            updateCohesionParams(newParams.cohesionRadius, newParams.cohesionStrength)
            break
          case "mouseAvoidanceDistance":
            updateMouseAvoidanceDistance(newParams.mouseAvoidanceDistance)
            break
        }

        return newParams
      })
    },
    [
      updateSeparationParams,
      updateAlignmentParams,
      updateCohesionParams,
      updateMouseAvoidanceDistance,
    ]
  )

  return {
    // 状態
    isLoading,
    error: wasmError ?? runtimeError,
    isPlaying,
    boidCount,
    parameters,
    boids,
    fps: performanceMonitor.fps,

    // アクション
    togglePlayPause,
    reset,
    setBoidCount: changeBoidCount,
    setMousePosition,
    updateParameter,
  }
}
