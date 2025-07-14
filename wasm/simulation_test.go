package main

import (
	"testing"
)

func TestSimulationParams(t *testing.T) {
	params := SimulationParams{
		SeparationRadius:       25.0,
		SeparationStrength:     1.5,
		AlignmentRadius:        50.0,
		AlignmentStrength:      1.0,
		CohesionRadius:         50.0,
		CohesionStrength:       1.0,
		MouseAvoidanceDistance: 100.0,
	}
	
	if params.SeparationRadius != 25.0 {
		t.Errorf("SeparationRadius = %v, want 25.0", params.SeparationRadius)
	}
}

func TestBoidSeparation(t *testing.T) {
	// Set up test environment
	params = SimulationParams{
		SeparationRadius:   30.0,
		SeparationStrength: 1.0,
	}
	
	// Create two boids close to each other
	boid1 := NewBoid(0.0, 0.0)
	boid1.Velocity = Vector2{X: 0.0, Y: 0.0}
	
	boid2 := NewBoid(10.0, 0.0) // Close to boid1
	
	boids = []Boid{boid1, boid2}
	
	force := boid1.separate()
	
	// Force should point away from the other boid (negative X direction)
	if force.X >= 0 {
		t.Errorf("Separation force X = %v, should be negative (away from other boid)", force.X)
	}
	
	// Reset global state
	boids = nil
}

func TestBoidAlignment(t *testing.T) {
	// Set up test environment
	params = SimulationParams{
		AlignmentRadius:   60.0,
		AlignmentStrength: 1.0,
	}
	
	// Create boids with different velocities
	boid1 := NewBoid(0.0, 0.0)
	boid1.Velocity = Vector2{X: 0.0, Y: 0.0}
	boid1.MaxSpeed = 2.0
	boid1.MaxForce = 1.0
	
	boid2 := NewBoid(30.0, 0.0)
	boid2.Velocity = Vector2{X: 1.0, Y: 0.0}
	
	boids = []Boid{boid1, boid2}
	
	force := boid1.align()
	
	// Force should point in the direction of other boids' velocities
	if force.X <= 0 {
		t.Errorf("Alignment force X = %v, should be positive (toward other velocity)", force.X)
	}
	
	// Reset global state
	boids = nil
}

func TestBoidCohesion(t *testing.T) {
	// Set up test environment
	params = SimulationParams{
		CohesionRadius:   60.0,
		CohesionStrength: 1.0,
	}
	
	// Create boids
	boid1 := NewBoid(0.0, 0.0)
	boid1.Velocity = Vector2{X: 0.0, Y: 0.0}
	boid1.MaxSpeed = 2.0
	boid1.MaxForce = 1.0
	
	boid2 := NewBoid(30.0, 0.0)
	
	boids = []Boid{boid1, boid2}
	
	force := boid1.cohesion()
	
	// Force should point toward the center of other boids
	if force.X <= 0 {
		t.Errorf("Cohesion force X = %v, should be positive (toward other boid)", force.X)
	}
	
	// Reset global state
	boids = nil
}

func TestBoidAvoidMouse(t *testing.T) {
	// Set up test environment
	params = SimulationParams{
		MouseAvoidanceDistance: 50.0,
	}
	
	mousePos = Vector2{X: 10.0, Y: 0.0}
	
	boid := NewBoid(0.0, 0.0)
	boid.MaxForce = 1.0
	
	force := boid.avoidMouse()
	
	// Force should point away from mouse (negative X direction)
	if force.X >= 0 {
		t.Errorf("Mouse avoidance force X = %v, should be negative (away from mouse)", force.X)
	}
	
	// Test when mouse is far away
	mousePos = Vector2{X: 100.0, Y: 0.0}
	force = boid.avoidMouse()
	
	// Force should be zero when mouse is far
	if force.X != 0.0 || force.Y != 0.0 {
		t.Errorf("Mouse avoidance force when far = %v, should be zero", force)
	}
	
	// Reset global state
	mousePos = Vector2{X: -1000.0, Y: -1000.0}
}

func TestBoidNoSelfInteraction(t *testing.T) {
	// Set up test environment
	params = SimulationParams{
		SeparationRadius:   30.0,
		SeparationStrength: 1.0,
		AlignmentRadius:    60.0,
		AlignmentStrength:  1.0,
		CohesionRadius:     60.0,
		CohesionStrength:   1.0,
	}
	
	// Create single boid
	boid := NewBoid(0.0, 0.0)
	boid.Velocity = Vector2{X: 1.0, Y: 0.0}
	
	boids = []Boid{boid}
	
	// Test that boid doesn't interact with itself
	sepForce := boid.separate()
	alignForce := boid.align()
	cohForce := boid.cohesion()
	
	zeroVec := Vector2{X: 0.0, Y: 0.0}
	
	if sepForce != zeroVec {
		t.Errorf("Self-separation force = %v, should be zero", sepForce)
	}
	
	if alignForce != zeroVec {
		t.Errorf("Self-alignment force = %v, should be zero", alignForce)
	}
	
	if cohForce != zeroVec {
		t.Errorf("Self-cohesion force = %v, should be zero", cohForce)
	}
	
	// Reset global state
	boids = nil
}

func TestBoidForcesOutsideRadius(t *testing.T) {
	// Set up test environment with small radii
	params = SimulationParams{
		SeparationRadius:   5.0,
		SeparationStrength: 1.0,
		AlignmentRadius:    5.0,
		AlignmentStrength:  1.0,
		CohesionRadius:     5.0,
		CohesionStrength:   1.0,
	}
	
	// Create boids far apart
	boid1 := NewBoid(0.0, 0.0)
	boid1.Velocity = Vector2{X: 0.0, Y: 0.0}
	
	boid2 := NewBoid(100.0, 0.0) // Far from boid1
	
	boids = []Boid{boid1, boid2}
	
	sepForce := boid1.separate()
	alignForce := boid1.align()
	cohForce := boid1.cohesion()
	
	zeroVec := Vector2{X: 0.0, Y: 0.0}
	
	if sepForce != zeroVec {
		t.Errorf("Separation force outside radius = %v, should be zero", sepForce)
	}
	
	if alignForce != zeroVec {
		t.Errorf("Alignment force outside radius = %v, should be zero", alignForce)
	}
	
	if cohForce != zeroVec {
		t.Errorf("Cohesion force outside radius = %v, should be zero", cohForce)
	}
	
	// Reset global state
	boids = nil
}