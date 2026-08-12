// Package boid defines a single boid entity: its physical state and the
// self-contained behaviors that only require the boid's own fields
// (position/velocity integration, boundary wrapping, and steering toward a
// single target point). Behaviors that need to look at other boids or the
// flock's shared parameters live in package simulation instead.
package boid

import (
	"math/rand"

	"boid-wasm-sim/internal/vector"
)

// Boid represents a single boid entity.
type Boid struct {
	Position     vector.Vector2
	Velocity     vector.Vector2
	Acceleration vector.Vector2
	MaxSpeed     float64
	MaxForce     float64
}

// New creates a new boid at the specified position with a random initial velocity.
func New(x, y float64) Boid {
	return Boid{
		Position: vector.Vector2{X: x, Y: y},
		Velocity: vector.Vector2{
			X: (rand.Float64() - 0.5) * 2.0,
			Y: (rand.Float64() - 0.5) * 2.0,
		},
		Acceleration: vector.Vector2{X: 0, Y: 0},
		MaxSpeed:     2.0,
		MaxForce:     0.03,
	}
}

// Update integrates acceleration into velocity and velocity into position,
// then resets acceleration for the next frame.
func (b *Boid) Update() {
	// Update velocity by acceleration
	b.Velocity = b.Velocity.Add(b.Acceleration)

	// Limit velocity to max speed
	b.Velocity = b.Velocity.Limit(b.MaxSpeed)

	// Update position by velocity
	b.Position = b.Position.Add(b.Velocity)

	// Reset acceleration
	b.Acceleration = vector.Vector2{X: 0, Y: 0}
}

// ApplyForce applies a steering force to the boid's acceleration for this frame.
func (b *Boid) ApplyForce(force vector.Vector2) {
	b.Acceleration = b.Acceleration.Add(force)
}

// WrapAround moves the boid to the opposite edge when it crosses a canvas boundary.
func (b *Boid) WrapAround(width, height float64) {
	if b.Position.X < 0 {
		b.Position.X = width
	}
	if b.Position.X > width {
		b.Position.X = 0
	}
	if b.Position.Y < 0 {
		b.Position.Y = height
	}
	if b.Position.Y > height {
		b.Position.Y = 0
	}
}

// Seek calculates a steering force (capped at MaxForce) that steers this
// boid toward the given target. It only reads the boid's own fields, so
// callers that need a flock-aware target (e.g. the center of nearby boids
// for cohesion) compute that target first and pass it in here.
func (b *Boid) Seek(target vector.Vector2) vector.Vector2 {
	desired := target.Sub(b.Position)
	desired = desired.Normalize()
	desired = desired.Mul(b.MaxSpeed)
	steer := desired.Sub(b.Velocity)
	return steer.Limit(b.MaxForce)
}
