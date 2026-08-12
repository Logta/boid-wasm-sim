// Package simulation owns the boid flock as a whole: its shared state
// (the boids, tunable parameters, spatial index, and mouse position) and
// the flocking behaviors that need to look at more than one boid to compute
// a steering force. A single Boid's own physics (position/velocity
// integration, boundary wrapping, steering toward one target) lives in
// package boid instead, since those operations only need the boid's own
// fields.
package simulation

import (
	"math"
	"math/rand"

	"boid-wasm-sim/internal/boid"
	"boid-wasm-sim/internal/spatialgrid"
	"boid-wasm-sim/internal/vector"
)

// Params holds all tunable flocking parameters.
type Params struct {
	SeparationRadius       float64
	SeparationStrength     float64
	AlignmentRadius        float64
	AlignmentStrength      float64
	CohesionRadius         float64
	CohesionStrength       float64
	MouseAvoidanceDistance float64
}

// DefaultParams returns the parameter set a freshly started simulation uses.
func DefaultParams() Params {
	return Params{
		SeparationRadius:       25.0,
		SeparationStrength:     1.5,
		AlignmentRadius:        50.0,
		AlignmentStrength:      1.0,
		CohesionRadius:         50.0,
		CohesionStrength:       1.0,
		MouseAvoidanceDistance: 100.0,
	}
}

// noMousePosition is used while no cursor position has been reported yet,
// placed far enough away that avoidMouse never triggers for it.
var noMousePosition = vector.Vector2{X: -1000.0, Y: -1000.0}

// interactionCellSize is the spatial grid's cell size. It only needs to be
// in the same ballpark as the radii Params actually uses, since
// GetNeighbors widens its search by extra cells for any radius bigger than
// one cell; the UI currently caps every radius slider at 150
// (web/components/src/Sidebar.tsx), so this stays well under that.
const interactionCellSize = 75.0

// Simulation owns the full state of a running boid flock.
type Simulation struct {
	boids        []boid.Boid
	params       Params
	canvasWidth  float64
	canvasHeight float64
	mousePos     vector.Vector2
	grid         *spatialgrid.SpatialGrid
}

// New creates a simulation with the given parameters and no boids yet.
// Call Init to populate it before calling Update.
func New(params Params) *Simulation {
	return &Simulation{
		params:   params,
		mousePos: noMousePosition,
	}
}

// Init (re)populates the simulation with count boids scattered randomly
// across a width x height canvas, replacing any boids it had before.
func (s *Simulation) Init(count int, width, height float64) {
	s.canvasWidth = width
	s.canvasHeight = height
	s.grid = spatialgrid.New(width, height, interactionCellSize)

	s.boids = make([]boid.Boid, 0, count)
	for i := 0; i < count; i++ {
		x := rand.Float64() * width
		y := rand.Float64() * height
		s.boids = append(s.boids, boid.New(x, y))
	}
}

// Update advances the simulation by one frame: it rebuilds the spatial
// index for this frame's positions, computes flocking forces for every
// boid, and integrates motion.
func (s *Simulation) Update() {
	s.grid.Clear()
	for i := range s.boids {
		s.grid.Insert(i, s.boids[i].Position)
	}

	for i := range s.boids {
		b := &s.boids[i]

		separation := s.separate(b, i)
		alignment := s.align(b, i)
		cohesion := s.cohere(b, i)
		mouseAvoidance := s.avoidMouse(b)

		b.ApplyForce(separation)
		b.ApplyForce(alignment)
		b.ApplyForce(cohesion)
		b.ApplyForce(mouseAvoidance)

		b.Update()
		b.WrapAround(s.canvasWidth, s.canvasHeight)
	}
}

// SetMousePosition updates the point boids steer away from.
func (s *Simulation) SetMousePosition(x, y float64) {
	s.mousePos = vector.Vector2{X: x, Y: y}
}

// BoidCount returns the number of boids currently simulated.
func (s *Simulation) BoidCount() int {
	return len(s.boids)
}

// UpdateSeparationParams changes the separation behavior's radius and strength.
func (s *Simulation) UpdateSeparationParams(radius, strength float64) {
	s.params.SeparationRadius = radius
	s.params.SeparationStrength = strength
}

// UpdateAlignmentParams changes the alignment behavior's radius and strength.
func (s *Simulation) UpdateAlignmentParams(radius, strength float64) {
	s.params.AlignmentRadius = radius
	s.params.AlignmentStrength = strength
}

// UpdateCohesionParams changes the cohesion behavior's radius and strength.
func (s *Simulation) UpdateCohesionParams(radius, strength float64) {
	s.params.CohesionRadius = radius
	s.params.CohesionStrength = strength
}

// UpdateMouseAvoidanceDistance changes how far away boids start avoiding the mouse.
func (s *Simulation) UpdateMouseAvoidanceDistance(distance float64) {
	s.params.MouseAvoidanceDistance = distance
}

// BoidData is a snapshot of one boid's position and velocity, shaped for
// hand-off across the JS boundary.
type BoidData struct {
	X, Y, VX, VY float64
}

// BoidData returns a snapshot of every boid's position and velocity.
func (s *Simulation) BoidData() []BoidData {
	data := make([]BoidData, len(s.boids))
	for i, b := range s.boids {
		data[i] = BoidData{X: b.Position.X, Y: b.Position.Y, VX: b.Velocity.X, VY: b.Velocity.Y}
	}
	return data
}

// --- Flocking behaviors ---
//
// These need to look at other boids and the shared parameters, so unlike
// boid.Boid's own methods they live here rather than on Boid itself. Each
// takes the boid being updated together with its index into s.boids; the
// two must refer to the same boid. Update, their only caller, guarantees
// that by construction.

func (s *Simulation) separate(b *boid.Boid, boidIndex int) vector.Vector2 {
	steer := vector.Vector2{X: 0, Y: 0}
	count := 0
	separationRadiusSquared := s.params.SeparationRadius * s.params.SeparationRadius

	nearbyIndices := s.grid.GetNeighbors(b.Position, s.params.SeparationRadius)

	for _, otherIndex := range nearbyIndices {
		if otherIndex == boidIndex {
			continue // Skip self
		}

		other := &s.boids[otherIndex]
		distanceSquared := b.Position.DistanceSquared(other.Position)
		if distanceSquared > 0 && distanceSquared < separationRadiusSquared {
			distance := math.Sqrt(distanceSquared)
			diff := b.Position.Sub(other.Position)
			diff = diff.Normalize()
			diff = diff.Div(distance) // Weight by distance
			steer = steer.Add(diff)
			count++
		}
	}

	if count > 0 {
		steer = steer.Div(float64(count))
		steer = steer.Normalize()
		steer = steer.Mul(b.MaxSpeed)
		steer = steer.Sub(b.Velocity)
		steer = steer.Limit(b.MaxForce)
		return steer.Mul(s.params.SeparationStrength)
	}

	return vector.Vector2{X: 0, Y: 0}
}

func (s *Simulation) align(b *boid.Boid, boidIndex int) vector.Vector2 {
	sum := vector.Vector2{X: 0, Y: 0}
	count := 0
	alignmentRadiusSquared := s.params.AlignmentRadius * s.params.AlignmentRadius

	nearbyIndices := s.grid.GetNeighbors(b.Position, s.params.AlignmentRadius)

	for _, otherIndex := range nearbyIndices {
		if otherIndex == boidIndex {
			continue
		}

		other := &s.boids[otherIndex]
		distanceSquared := b.Position.DistanceSquared(other.Position)
		if distanceSquared > 0 && distanceSquared < alignmentRadiusSquared {
			sum = sum.Add(other.Velocity)
			count++
		}
	}

	if count > 0 {
		sum = sum.Div(float64(count))
		sum = sum.Normalize()
		sum = sum.Mul(b.MaxSpeed)
		steer := sum.Sub(b.Velocity)
		steer = steer.Limit(b.MaxForce)
		return steer.Mul(s.params.AlignmentStrength)
	}

	return vector.Vector2{X: 0, Y: 0}
}

// cohere steers b toward the average position of nearby boids. (Named to
// match the verb form of separate/align, unlike the "cohesion" noun this
// package used before.)
func (s *Simulation) cohere(b *boid.Boid, boidIndex int) vector.Vector2 {
	sum := vector.Vector2{X: 0, Y: 0}
	count := 0
	cohesionRadiusSquared := s.params.CohesionRadius * s.params.CohesionRadius

	nearbyIndices := s.grid.GetNeighbors(b.Position, s.params.CohesionRadius)

	for _, otherIndex := range nearbyIndices {
		if otherIndex == boidIndex {
			continue
		}

		other := &s.boids[otherIndex]
		distanceSquared := b.Position.DistanceSquared(other.Position)
		if distanceSquared > 0 && distanceSquared < cohesionRadiusSquared {
			sum = sum.Add(other.Position)
			count++
		}
	}

	if count > 0 {
		center := sum.Div(float64(count))
		return b.Seek(center).Mul(s.params.CohesionStrength)
	}

	return vector.Vector2{X: 0, Y: 0}
}

func (s *Simulation) avoidMouse(b *boid.Boid) vector.Vector2 {
	mouseAvoidanceDistanceSquared := s.params.MouseAvoidanceDistance * s.params.MouseAvoidanceDistance
	distanceSquared := b.Position.DistanceSquared(s.mousePos)
	if distanceSquared < mouseAvoidanceDistanceSquared {
		steer := b.Position.Sub(s.mousePos)
		steer = steer.Normalize()
		// マウス回避には他の行動と違いStrengthパラメータがないため、
		// 暫定的にMaxForceの3倍を強さとして使っている(既存の挙動を維持)。
		return steer.Mul(b.MaxForce * 3.0)
	}
	return vector.Vector2{X: 0, Y: 0}
}
