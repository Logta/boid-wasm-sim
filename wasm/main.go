//go:build js && wasm

package main

import (
	"math/rand"
	"syscall/js"
	"time"
)

// JavaScript exports
func initializeSimulation(this js.Value, args []js.Value) interface{} {
	boidCount := args[0].Int()
	width := args[1].Float()
	height := args[2].Float()

	canvasWidth = width
	canvasHeight = height
	boids = make([]Boid, 0, boidCount)

	rand.Seed(time.Now().UnixNano())

	for i := 0; i < boidCount; i++ {
		x := rand.Float64() * canvasWidth
		y := rand.Float64() * canvasHeight
		boids = append(boids, NewBoid(x, y))
	}

	return nil
}

func updateSimulation(this js.Value, args []js.Value) interface{} {
	for i := range boids {
		boid := &boids[i]

		// Calculate flocking forces
		separation := boid.separate()
		alignment := boid.align()
		cohesionForce := boid.cohesion()
		mouseAvoidance := boid.avoidMouse()

		// Apply forces
		boid.ApplyForce(separation)
		boid.ApplyForce(alignment)
		boid.ApplyForce(cohesionForce)
		boid.ApplyForce(mouseAvoidance)

		// Update position
		boid.Update()

		// Handle boundaries
		boid.WrapAround(canvasWidth, canvasHeight)
	}

	return nil
}

func setMousePosition(this js.Value, args []js.Value) interface{} {
	mousePos.X = args[0].Float()
	mousePos.Y = args[1].Float()
	return nil
}

func getBoidCount(this js.Value, args []js.Value) interface{} {
	return len(boids)
}

func getBoidPositionX(this js.Value, args []js.Value) interface{} {
	index := args[0].Int()
	if index < 0 || index >= len(boids) {
		return 0.0
	}
	return boids[index].Position.X
}

func getBoidPositionY(this js.Value, args []js.Value) interface{} {
	index := args[0].Int()
	if index < 0 || index >= len(boids) {
		return 0.0
	}
	return boids[index].Position.Y
}

func getBoidVelocityX(this js.Value, args []js.Value) interface{} {
	index := args[0].Int()
	if index < 0 || index >= len(boids) {
		return 0.0
	}
	return boids[index].Velocity.X
}

func getBoidVelocityY(this js.Value, args []js.Value) interface{} {
	index := args[0].Int()
	if index < 0 || index >= len(boids) {
		return 0.0
	}
	return boids[index].Velocity.Y
}

func updateSeparationParams(this js.Value, args []js.Value) interface{} {
	params.SeparationRadius = args[0].Float()
	params.SeparationStrength = args[1].Float()
	return nil
}

func updateAlignmentParams(this js.Value, args []js.Value) interface{} {
	params.AlignmentRadius = args[0].Float()
	params.AlignmentStrength = args[1].Float()
	return nil
}

func updateCohesionParams(this js.Value, args []js.Value) interface{} {
	params.CohesionRadius = args[0].Float()
	params.CohesionStrength = args[1].Float()
	return nil
}

func updateMouseAvoidanceDistance(this js.Value, args []js.Value) interface{} {
	params.MouseAvoidanceDistance = args[0].Float()
	return nil
}

func main() {
	// Initialize default parameters
	params = SimulationParams{
		SeparationRadius:       25.0,
		SeparationStrength:     1.5,
		AlignmentRadius:        50.0,
		AlignmentStrength:      1.0,
		CohesionRadius:         50.0,
		CohesionStrength:       1.0,
		MouseAvoidanceDistance: 100.0,
	}

	// Register functions for JavaScript
	js.Global().Set("initializeSimulation", js.FuncOf(initializeSimulation))
	js.Global().Set("updateSimulation", js.FuncOf(updateSimulation))
	js.Global().Set("setMousePosition", js.FuncOf(setMousePosition))
	js.Global().Set("getBoidCount", js.FuncOf(getBoidCount))
	js.Global().Set("getBoidPositionX", js.FuncOf(getBoidPositionX))
	js.Global().Set("getBoidPositionY", js.FuncOf(getBoidPositionY))
	js.Global().Set("getBoidVelocityX", js.FuncOf(getBoidVelocityX))
	js.Global().Set("getBoidVelocityY", js.FuncOf(getBoidVelocityY))
	js.Global().Set("updateSeparationParams", js.FuncOf(updateSeparationParams))
	js.Global().Set("updateAlignmentParams", js.FuncOf(updateAlignmentParams))
	js.Global().Set("updateCohesionParams", js.FuncOf(updateCohesionParams))
	js.Global().Set("updateMouseAvoidanceDistance", js.FuncOf(updateMouseAvoidanceDistance))

	// Keep the program running
	select {}
}