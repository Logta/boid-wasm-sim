//go:build js && wasm

// Command boid-wasm-sim is the WASM entrypoint: it registers a set of
// JavaScript-callable functions that unmarshal js.Value arguments and
// delegate to package simulation, and marshals its results back into JS
// values. It intentionally contains no flocking logic of its own.
package main

import (
	"syscall/js"

	"boid-wasm-sim/internal/simulation"
)

var sim *simulation.Simulation

func initializeSimulation(this js.Value, args []js.Value) interface{} {
	count := args[0].Int()
	width := args[1].Float()
	height := args[2].Float()

	sim.Init(count, width, height)

	return nil
}

func updateSimulation(this js.Value, args []js.Value) interface{} {
	sim.Update()
	return nil
}

func setMousePosition(this js.Value, args []js.Value) interface{} {
	sim.SetMousePosition(args[0].Float(), args[1].Float())
	return nil
}

func getBoidCount(this js.Value, args []js.Value) interface{} {
	return sim.BoidCount()
}

func updateSeparationParams(this js.Value, args []js.Value) interface{} {
	sim.UpdateSeparationParams(args[0].Float(), args[1].Float())
	return nil
}

func updateAlignmentParams(this js.Value, args []js.Value) interface{} {
	sim.UpdateAlignmentParams(args[0].Float(), args[1].Float())
	return nil
}

func updateCohesionParams(this js.Value, args []js.Value) interface{} {
	sim.UpdateCohesionParams(args[0].Float(), args[1].Float())
	return nil
}

func updateMouseAvoidanceDistance(this js.Value, args []js.Value) interface{} {
	sim.UpdateMouseAvoidanceDistance(args[0].Float())
	return nil
}

// getAllBoidData is the batch API for efficient data retrieval: one JS call
// returns every boid's position and velocity instead of one call per boid.
func getAllBoidData(this js.Value, args []js.Value) interface{} {
	data := sim.BoidData()
	result := js.Global().Get("Array").New(len(data))

	for i, d := range data {
		boidData := js.Global().Get("Object").New()
		boidData.Set("x", d.X)
		boidData.Set("y", d.Y)
		boidData.Set("vx", d.VX)
		boidData.Set("vy", d.VY)
		result.SetIndex(i, boidData)
	}

	return result
}

func main() {
	sim = simulation.New(simulation.DefaultParams())

	// Register functions for JavaScript
	js.Global().Set("initializeSimulation", js.FuncOf(initializeSimulation))
	js.Global().Set("updateSimulation", js.FuncOf(updateSimulation))
	js.Global().Set("setMousePosition", js.FuncOf(setMousePosition))
	js.Global().Set("getBoidCount", js.FuncOf(getBoidCount))
	js.Global().Set("updateSeparationParams", js.FuncOf(updateSeparationParams))
	js.Global().Set("updateAlignmentParams", js.FuncOf(updateAlignmentParams))
	js.Global().Set("updateCohesionParams", js.FuncOf(updateCohesionParams))
	js.Global().Set("updateMouseAvoidanceDistance", js.FuncOf(updateMouseAvoidanceDistance))
	js.Global().Set("getAllBoidData", js.FuncOf(getAllBoidData))

	// Keep the program running
	select {}
}
