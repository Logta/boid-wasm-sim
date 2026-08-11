package main

import (
	"math"
	"testing"
)

const magnitudeEpsilon = 1e-9

func almostEqual(a, b float64) bool {
	return math.Abs(a-b) < magnitudeEpsilon
}

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

	// Initialize spatial grid
	spatialGrid = NewSpatialGrid(800.0, 600.0, 75.0)

	// Create two boids close to each other
	boid1 := NewBoid(0.0, 0.0)
	boid1.Velocity = Vector2{X: 0.0, Y: 0.0}

	boid2 := NewBoid(10.0, 0.0) // Close to boid1

	boids = []Boid{boid1, boid2}

	// Populate spatial grid
	spatialGrid.Clear()
	for i := range boids {
		spatialGrid.Insert(i, boids[i].Position)
	}

	force := boid1.separate(0)

	// Force should point away from the other boid (negative X direction)
	if force.X >= 0 {
		t.Errorf("Separation force X = %v, should be negative (away from other boid)", force.X)
	}

	// 符号だけでなく力の大きさも検証する。boid同士が近いためLimit()により
	// 大きさは必ずMaxForceに飽和するので、strength倍後の大きさは
	// MaxForce*strengthに一致するはず。これにより強度パラメータの
	// 掛け忘れ・誤った係数の混入(例: 0.0001倍のような定数誤り)を検知できる。
	wantMagnitude := boid1.MaxForce * params.SeparationStrength
	if !almostEqual(force.Magnitude(), wantMagnitude) {
		t.Errorf("Separation force magnitude = %v, want %v (MaxForce=%v * SeparationStrength=%v)",
			force.Magnitude(), wantMagnitude, boid1.MaxForce, params.SeparationStrength)
	}

	params.SeparationStrength = 2.0
	doubledForce := boid1.separate(0)
	wantDoubledMagnitude := boid1.MaxForce * params.SeparationStrength
	if !almostEqual(doubledForce.Magnitude(), wantDoubledMagnitude) {
		t.Errorf("Separation force magnitude with strength=2.0 = %v, want %v",
			doubledForce.Magnitude(), wantDoubledMagnitude)
	}

	// Reset global state
	boids = nil
	spatialGrid = nil
}

func TestBoidAlignment(t *testing.T) {
	// Set up test environment
	params = SimulationParams{
		AlignmentRadius:   60.0,
		AlignmentStrength: 1.0,
	}

	// Initialize spatial grid
	spatialGrid = NewSpatialGrid(800.0, 600.0, 75.0)

	// Create boids with different velocities
	boid1 := NewBoid(0.0, 0.0)
	boid1.Velocity = Vector2{X: 0.0, Y: 0.0}
	boid1.MaxSpeed = 2.0
	boid1.MaxForce = 1.0

	boid2 := NewBoid(30.0, 0.0)
	boid2.Velocity = Vector2{X: 1.0, Y: 0.0}

	boids = []Boid{boid1, boid2}

	// Populate spatial grid
	spatialGrid.Clear()
	for i := range boids {
		spatialGrid.Insert(i, boids[i].Position)
	}

	force := boid1.align(0)

	// Force should point in the direction of other boids' velocities
	if force.X <= 0 {
		t.Errorf("Alignment force X = %v, should be positive (toward other velocity)", force.X)
	}

	// 符号だけでなく力の大きさも検証する。boid2の速度により整列の目標は
	// 必ずLimit()で飽和するため、大きさはMaxForce*strengthに一致するはず。
	wantMagnitude := boid1.MaxForce * params.AlignmentStrength
	if !almostEqual(force.Magnitude(), wantMagnitude) {
		t.Errorf("Alignment force magnitude = %v, want %v (MaxForce=%v * AlignmentStrength=%v)",
			force.Magnitude(), wantMagnitude, boid1.MaxForce, params.AlignmentStrength)
	}

	params.AlignmentStrength = 2.0
	doubledForce := boid1.align(0)
	wantDoubledMagnitude := boid1.MaxForce * params.AlignmentStrength
	if !almostEqual(doubledForce.Magnitude(), wantDoubledMagnitude) {
		t.Errorf("Alignment force magnitude with strength=2.0 = %v, want %v",
			doubledForce.Magnitude(), wantDoubledMagnitude)
	}

	// Reset global state
	boids = nil
	spatialGrid = nil
}

func TestBoidCohesion(t *testing.T) {
	// Set up test environment
	params = SimulationParams{
		CohesionRadius:   60.0,
		CohesionStrength: 1.0,
	}

	// Initialize spatial grid
	spatialGrid = NewSpatialGrid(800.0, 600.0, 75.0)

	// Create boids
	boid1 := NewBoid(0.0, 0.0)
	boid1.Velocity = Vector2{X: 0.0, Y: 0.0}
	boid1.MaxSpeed = 2.0
	boid1.MaxForce = 1.0

	boid2 := NewBoid(30.0, 0.0)

	boids = []Boid{boid1, boid2}

	// Populate spatial grid
	spatialGrid.Clear()
	for i := range boids {
		spatialGrid.Insert(i, boids[i].Position)
	}

	force := boid1.cohesion(0)

	// Force should point toward the center of other boids
	if force.X <= 0 {
		t.Errorf("Cohesion force X = %v, should be positive (toward other boid)", force.X)
	}

	// 符号だけでなく力の大きさも検証する。seek()内のLimit()で必ず飽和するため、
	// 大きさはMaxForce*strengthに一致するはず。
	wantMagnitude := boid1.MaxForce * params.CohesionStrength
	if !almostEqual(force.Magnitude(), wantMagnitude) {
		t.Errorf("Cohesion force magnitude = %v, want %v (MaxForce=%v * CohesionStrength=%v)",
			force.Magnitude(), wantMagnitude, boid1.MaxForce, params.CohesionStrength)
	}

	params.CohesionStrength = 2.0
	doubledForce := boid1.cohesion(0)
	wantDoubledMagnitude := boid1.MaxForce * params.CohesionStrength
	if !almostEqual(doubledForce.Magnitude(), wantDoubledMagnitude) {
		t.Errorf("Cohesion force magnitude with strength=2.0 = %v, want %v",
			doubledForce.Magnitude(), wantDoubledMagnitude)
	}

	// Reset global state
	boids = nil
	spatialGrid = nil
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

	// Initialize spatial grid
	spatialGrid = NewSpatialGrid(800.0, 600.0, 75.0)

	// Create single boid
	boid := NewBoid(0.0, 0.0)
	boid.Velocity = Vector2{X: 1.0, Y: 0.0}

	boids = []Boid{boid}

	// Populate spatial grid
	spatialGrid.Clear()
	for i := range boids {
		spatialGrid.Insert(i, boids[i].Position)
	}

	// Test that boid doesn't interact with itself
	sepForce := boid.separate(0)
	alignForce := boid.align(0)
	cohForce := boid.cohesion(0)

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
	spatialGrid = nil
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

	// Initialize spatial grid
	spatialGrid = NewSpatialGrid(800.0, 600.0, 75.0)

	// Create boids far apart
	boid1 := NewBoid(0.0, 0.0)
	boid1.Velocity = Vector2{X: 0.0, Y: 0.0}

	boid2 := NewBoid(100.0, 0.0) // Far from boid1

	boids = []Boid{boid1, boid2}

	// Populate spatial grid
	spatialGrid.Clear()
	for i := range boids {
		spatialGrid.Insert(i, boids[i].Position)
	}

	sepForce := boid1.separate(0)
	alignForce := boid1.align(0)
	cohForce := boid1.cohesion(0)

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
	spatialGrid = nil
}
