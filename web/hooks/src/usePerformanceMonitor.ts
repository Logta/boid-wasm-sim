import { useCallback, useRef, useState } from "react"

type PerformanceWarning = {
  fps: number
  target: number
  frameTime: number
}

type PerformanceOptions = {
  onPerformanceWarning?: (warning: PerformanceWarning) => void
  warningThreshold?: number // FPSがこの値を下回ると警告
}

export function usePerformanceMonitor(targetFps = 60, options: PerformanceOptions = {}) {
  const { onPerformanceWarning, warningThreshold = targetFps * 0.8 } = options

  const [fps, setFps] = useState(0)
  const [frameTime, setFrameTime] = useState(0)
  const [updateTime, setUpdateTime] = useState(0)
  const [renderTime, setRenderTime] = useState(0)

  const frameStartRef = useRef<number>(0)
  const updateStartRef = useRef<number>(0)
  const renderStartRef = useRef<number>(0)

  const frameCountRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(performance.now())

  const startFrame = useCallback(() => {
    frameStartRef.current = performance.now()
  }, [])

  const endFrame = useCallback(() => {
    const now = performance.now()
    const frameTime = now - frameStartRef.current

    setFrameTime(frameTime)
    frameCountRef.current++

    // 1秒ごとにFPS計算
    if (now - lastTimeRef.current >= 1000) {
      const seconds = (now - lastTimeRef.current) / 1000
      const currentFps = Math.round(frameCountRef.current / seconds)

      setFps(currentFps)

      // パフォーマンス警告
      if (currentFps > 0 && currentFps < warningThreshold && onPerformanceWarning) {
        onPerformanceWarning({
          fps: currentFps,
          target: targetFps,
          frameTime: frameTime,
        })
      }

      frameCountRef.current = 0
      lastTimeRef.current = now
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
    lastTimeRef.current = performance.now()
  }, [])

  const stop = useCallback(() => {
    setFps(0)
    // タイマーはリセットしない - 次回開始時により正確な計測のため
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
    reset,
    stop,
  }
}
