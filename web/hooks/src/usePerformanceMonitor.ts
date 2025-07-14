import { useState, useRef, useCallback } from "react"

type PerformanceWarning = {
  fps: number
  target: number
  frameTime: number
}

type PerformanceOptions = {
  onPerformanceWarning?: (warning: PerformanceWarning) => void
  warningThreshold?: number // FPSがこの値を下回ると警告
}

export function usePerformanceMonitor(
  targetFps = 60,
  options: PerformanceOptions = {}
) {
  const { onPerformanceWarning, warningThreshold = targetFps * 0.8 } = options

  const [fps, setFps] = useState(0)
  const [frameTime, setFrameTime] = useState(0)
  const [updateTime, setUpdateTime] = useState(0)
  const [renderTime, setRenderTime] = useState(0)

  const frameStartRef = useRef<number>(0)
  const updateStartRef = useRef<number>(0)
  const renderStartRef = useRef<number>(0)
  
  const frameCountRef = useRef<number>(0)
  const lastFpsUpdateRef = useRef<number>(0)
  const frameTimesRef = useRef<number[]>([])

  const startFrame = useCallback(() => {
    frameStartRef.current = performance.now()
  }, [])

  const endFrame = useCallback(() => {
    const now = performance.now()
    const frameTime = now - frameStartRef.current
    
    setFrameTime(frameTime)
    frameTimesRef.current.push(frameTime)
    
    // 最大100フレーム分保持
    if (frameTimesRef.current.length > 100) {
      frameTimesRef.current.shift()
    }
    
    frameCountRef.current++
    
    // 1秒ごとにFPS更新
    if (now - lastFpsUpdateRef.current >= 1000) {
      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
      const currentFps = Math.min(1000 / avgFrameTime, targetFps)
      
      setFps(Math.round(currentFps))
      
      // パフォーマンス警告
      if (currentFps < warningThreshold && onPerformanceWarning) {
        onPerformanceWarning({
          fps: currentFps,
          target: targetFps,
          frameTime: avgFrameTime
        })
      }
      
      lastFpsUpdateRef.current = now
      frameCountRef.current = 0
    }
  }, [targetFps, warningThreshold, onPerformanceWarning])

  const startUpdate = useCallback(() => {
    updateStartRef.current = performance.now()
  }, [])

  const endUpdate = useCallback(() => {
    const updateTime = performance.now() - updateStartRef.current
    setUpdateTime(updateTime)
  }, [])

  const startRender = useCallback(() => {
    renderStartRef.current = performance.now()
  }, [])

  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStartRef.current
    setRenderTime(renderTime)
  }, [])

  const reset = useCallback(() => {
    setFps(0)
    setFrameTime(0)
    setUpdateTime(0)
    setRenderTime(0)
    frameCountRef.current = 0
    lastFpsUpdateRef.current = performance.now()
    frameTimesRef.current = []
  }, [])

  return {
    fps,
    frameTime,
    updateTime,
    renderTime,
    startFrame,
    endFrame,
    startUpdate,
    endUpdate,
    startRender,
    endRender,
    reset
  }
}