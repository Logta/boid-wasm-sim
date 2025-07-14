import { useState, useEffect, useCallback, useRef } from "react"
import { useBoidWasm } from "./useBoidWasm"
import { usePerformanceMonitor } from "./usePerformanceMonitor"
import type { SimulationParameters, Boid } from "./types"

const DEFAULT_PARAMETERS: SimulationParameters = {
  separationRadius: 25,
  separationStrength: 1.5,
  alignmentRadius: 50,
  alignmentStrength: 1.0,
  cohesionRadius: 50,
  cohesionStrength: 1.0,
  mouseAvoidanceDistance: 100
}

export function useSimulation() {
  const {
    wasmModule,
    isLoading,
    error,
    initializeSimulation,
    updateSimulation,
    setMousePosition: setWasmMousePosition,
    getBoids,
    updateSeparationParams,
    updateAlignmentParams,
    updateCohesionParams,
    updateMouseAvoidanceDistance
  } = useBoidWasm()

  const [isPlaying, setIsPlaying] = useState(false)
  const [boidCount, setBoidCount] = useState(100)
  const [parameters, setParameters] = useState<SimulationParameters>(DEFAULT_PARAMETERS)
  const [boids, setBoids] = useState<Boid[]>([])

  const animationFrameRef = useRef<number>(0)
  const isPlayingRef = useRef(isPlaying)
  
  const performanceMonitor = usePerformanceMonitor(60, {
    onPerformanceWarning: (warning) => {
      console.warn(`Performance warning: FPS dropped to ${warning.fps} (target: ${warning.target})`)
    }
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
  const animate = useCallback(function animateLoop() {
    if (!isPlayingRef.current) {
      return
    }

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
  }, [updateSimulation, getBoids, performanceMonitor])

  // 再生状態変更時のアニメーション制御
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
    setIsPlaying(prev => !prev)
  }, [])

  const reset = useCallback(() => {
    setIsPlaying(false)
    if (wasmModule) {
      initializeSimulation(boidCount, 800, 600)
      setBoids(getBoids())
    }
    performanceMonitor.reset()
  }, [wasmModule, boidCount, initializeSimulation, getBoids, performanceMonitor])

  const changeBoidCount = useCallback((count: number) => {
    setBoidCount(count)
    if (wasmModule) {
      initializeSimulation(count, 800, 600)
      setBoids(getBoids())
    }
  }, [wasmModule, initializeSimulation, getBoids])

  const setMousePosition = useCallback((x: number, y: number) => {
    setWasmMousePosition(x, y)
  }, [setWasmMousePosition])

  const updateParameter = useCallback((key: keyof SimulationParameters, value: number) => {
    setParameters(prev => {
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
  }, [updateSeparationParams, updateAlignmentParams, updateCohesionParams, updateMouseAvoidanceDistance])

  return {
    // 状態
    isLoading,
    error,
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
    updateParameter
  }
}