//go:build js && wasm

// Command boid-wasm-sim is the WASM entrypoint: it registers a set of
// JavaScript-callable functions that unmarshal js.Value arguments and
// delegate to package simulation, and marshals its results back into JS
// values. It intentionally contains no flocking logic of its own.
package main

import (
	"math"
	"syscall/js"

	"boid-wasm-sim/internal/simulation"
)

var sim *simulation.Simulation

// numberArgs reads the first n arguments as numbers. It reports false when
// an argument is missing or is not a JS number, because js.Value.Float/Int
// panic on other types and a panic ends the Go program for good (every
// later call from JS would then fail).
func numberArgs(args []js.Value, n int) ([]float64, bool) {
	if len(args) < n {
		return nil, false
	}
	values := make([]float64, n)
	for i := 0; i < n; i++ {
		if args[i].Type() != js.TypeNumber {
			return nil, false
		}
		values[i] = args[i].Float()
	}
	return values, true
}

func initializeSimulation(this js.Value, args []js.Value) interface{} {
	v, ok := numberArgs(args, 3)
	if !ok {
		println("initializeSimulation: expected (count, width, height) as numbers")
		return nil
	}
	count := v[0]
	if math.IsNaN(count) || count < 0 || count > simulation.MaxBoids {
		println("initializeSimulation: boid count out of range")
		return nil
	}

	if err := sim.Init(int(count), v[1], v[2]); err != nil {
		println("initializeSimulation:", err.Error())
	}
	return nil
}

func updateSimulation(this js.Value, args []js.Value) interface{} {
	sim.Update()
	return nil
}

func setMousePosition(this js.Value, args []js.Value) interface{} {
	if v, ok := numberArgs(args, 2); ok {
		sim.SetMousePosition(v[0], v[1])
	}
	return nil
}

func getBoidCount(this js.Value, args []js.Value) interface{} {
	return sim.BoidCount()
}

func updateSeparationParams(this js.Value, args []js.Value) interface{} {
	if v, ok := numberArgs(args, 2); ok {
		sim.UpdateSeparationParams(v[0], v[1])
	}
	return nil
}

func updateAlignmentParams(this js.Value, args []js.Value) interface{} {
	if v, ok := numberArgs(args, 2); ok {
		sim.UpdateAlignmentParams(v[0], v[1])
	}
	return nil
}

func updateCohesionParams(this js.Value, args []js.Value) interface{} {
	if v, ok := numberArgs(args, 2); ok {
		sim.UpdateCohesionParams(v[0], v[1])
	}
	return nil
}

func updateMouseAvoidanceDistance(this js.Value, args []js.Value) interface{} {
	if v, ok := numberArgs(args, 1); ok {
		sim.UpdateMouseAvoidanceDistance(v[0])
	}
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
