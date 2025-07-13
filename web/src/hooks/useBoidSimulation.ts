import { useState, useEffect, useRef, useCallback } from 'react'

interface BoidParameters {
  separationDistance: number
  alignmentDistance: number
  cohesionDistance: number
  separationForce: number
  alignmentForce: number
  cohesionForce: number
  mouseAvoidDistance: number
  mouseAvoidForce: number
}

interface WasmModule {
  init: (count: number, width: number, height: number) => void
  update: () => void
  setParameters: (
    sepDist: number, alignDist: number, cohDist: number,
    sepForce: number, alignForce: number, cohForce: number,
    mouseAvoidDist: number, mouseAvoidF: number
  ) => void
  updateMouse: (x: number, y: number) => void
  getPositions: () => Float32Array
}

export function useBoidSimulation() {
  const [isRunning, setIsRunning] = useState(false)
  const [boidCount, setBoidCount] = useState(500)
  const [fps, setFps] = useState(0)
  const [positions, setPositions] = useState<Float32Array>(new Float32Array(0))
  const [parameters, setParameters] = useState<BoidParameters>({
    separationDistance: 25,
    alignmentDistance: 50,
    cohesionDistance: 50,
    separationForce: 1.5,
    alignmentForce: 1.0,
    cohesionForce: 1.0,
    mouseAvoidDistance: 100,
    mouseAvoidForce: 5.0
  })

  const wasmRef = useRef<WasmModule | null>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const frameCountRef = useRef<number>(0)

  useEffect(() => {
    async function loadWasm() {
      try {
        const response = await fetch('/wasm/boid.wasm')
        const wasmBytes = await response.arrayBuffer()
        
        // AssemblyScript requires these imports
        const imports = {
          env: {
            abort: () => {
              throw new Error("AssemblyScript abort")
            },
            seed: () => Date.now()
          }
        }
        
        const wasmModule = await WebAssembly.instantiate(wasmBytes, imports)
        const exports = wasmModule.instance.exports as any
        
        // AssemblyScript exports for handling memory
        const memory = exports.memory
        
        wasmRef.current = {
          init: exports.init,
          update: exports.update,
          setParameters: exports.setParameters,
          updateMouse: exports.updateMouse,
          getBoidCount: exports.getBoidCount,
          getPositions: () => {
            try {
              const ptr = exports.getPositions()
              if (!ptr) return new Float32Array(0)
              
              // Check actual boid count from WASM
              const actualBoidCount = exports.getBoidCount()
              console.log(`WASM reports ${actualBoidCount} boids`)
              
              // Get memory buffer
              const memoryBuffer = memory.buffer
              
              // For AssemblyScript Float32Array, try reading the array buffer length from ptr - 8
              // AssemblyScript array header:
              // ptr - 20: allocation size
              // ptr - 16: array buffer size in bytes  
              // ptr - 12: array buffer id
              // ptr - 8:  array buffer capacity 
              // ptr - 4:  array buffer byte length
              // ptr:      data start
              
              const dataView = new DataView(memoryBuffer)
              
              // Try reading the buffer byte length from ptr - 4
              const bufferByteLength = dataView.getUint32(ptr - 4, true)
              
              // Expected size should be actualBoidCount * 4 * 4 bytes (4 floats per boid, 4 bytes per float)
              const expectedBytes = actualBoidCount * 4 * 4
              
              console.log(`Memory read: ptr=${ptr}, bufferByteLength=${bufferByteLength}, expectedBytes=${expectedBytes}`)
              
              // Use the expected size since the header might not be correctly read
              const elementLength = expectedBytes / 4 // Convert bytes to float32 count
              
              // Create Float32Array view starting from the data pointer
              const float32View = new Float32Array(memoryBuffer, ptr, elementLength)
              
              // Return a copy to avoid memory issues
              return new Float32Array(float32View)
            } catch (e) {
              console.error('Error reading positions:', e)
              return new Float32Array(0)
            }
          }
        }
        
        wasmRef.current?.init(boidCount, 800, 600)
        wasmRef.current?.setParameters(
          parameters.separationDistance,
          parameters.alignmentDistance,
          parameters.cohesionDistance,
          parameters.separationForce,
          parameters.alignmentForce,
          parameters.cohesionForce,
          parameters.mouseAvoidDistance,
          parameters.mouseAvoidForce
        )
        
        const initialPositions = wasmRef.current?.getPositions() || new Float32Array(0)
        console.log(`Expected ${boidCount} boids, got ${initialPositions.length / 4} boids`)
        setPositions(initialPositions)
      } catch (error) {
        console.error('Failed to load WASM module:', error)
      }
    }
    loadWasm()
  }, [])

  useEffect(() => {
    if (wasmRef.current) {
      console.log(`Reinitializing with ${boidCount} boids`)
      wasmRef.current.init(boidCount, 800, 600)
      wasmRef.current.setParameters(
        parameters.separationDistance,
        parameters.alignmentDistance,
        parameters.cohesionDistance,
        parameters.separationForce,
        parameters.alignmentForce,
        parameters.cohesionForce,
        parameters.mouseAvoidDistance,
        parameters.mouseAvoidForce
      )
      const newPositions = wasmRef.current.getPositions()
      console.log(`After reinit: expected ${boidCount}, got ${newPositions.length / 4} boids`)
      setPositions(newPositions)
    }
  }, [boidCount])

  useEffect(() => {
    if (wasmRef.current) {
      wasmRef.current.setParameters(
        parameters.separationDistance,
        parameters.alignmentDistance,
        parameters.cohesionDistance,
        parameters.separationForce,
        parameters.alignmentForce,
        parameters.cohesionForce,
        parameters.mouseAvoidDistance,
        parameters.mouseAvoidForce
      )
    }
  }, [parameters])

  const animate = useCallback((currentTime: number) => {
    if (!wasmRef.current) return

    if (currentTime - lastTimeRef.current >= 1000) {
      setFps(frameCountRef.current)
      frameCountRef.current = 0
      lastTimeRef.current = currentTime
    }
    frameCountRef.current++

    wasmRef.current.update()
    setPositions(wasmRef.current.getPositions())

    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [isRunning])

  useEffect(() => {
    if (isRunning && wasmRef.current) {
      animationRef.current = requestAnimationFrame(animate)
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, animate])

  const toggleSimulation = useCallback(() => {
    setIsRunning(prev => !prev)
  }, [])

  const reset = useCallback(() => {
    if (wasmRef.current) {
      wasmRef.current.init(boidCount, 800, 600)
      setPositions(wasmRef.current.getPositions())
    }
  }, [boidCount])

  const updateMouse = useCallback((x: number, y: number) => {
    if (wasmRef.current) {
      wasmRef.current.updateMouse(x, y)
    }
  }, [])

  return {
    isRunning,
    boidCount,
    fps,
    parameters,
    positions,
    setBoidCount,
    setParameters,
    toggleSimulation,
    reset,
    updateMouse
  }
}