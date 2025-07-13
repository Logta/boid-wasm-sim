import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@/components/Canvas'
import { ControlPanel } from '@/components/ControlPanel'
import { useBoidSimulation } from '@/hooks/useBoidSimulation'

export default function App() {
  const {
    isRunning,
    boidCount,
    fps,
    parameters,
    setBoidCount,
    setParameters,
    toggleSimulation,
    reset,
    updateMouse,
    positions
  } = useBoidSimulation()

  return (
    <div className="flex h-screen bg-background">
      <ControlPanel
        isRunning={isRunning}
        boidCount={boidCount}
        fps={fps}
        parameters={parameters}
        onBoidCountChange={setBoidCount}
        onParametersChange={setParameters}
        onToggleSimulation={toggleSimulation}
        onReset={reset}
      />
      <div className="flex-1">
        <Canvas
          positions={positions}
          onMouseMove={updateMouse}
        />
      </div>
    </div>
  )
}