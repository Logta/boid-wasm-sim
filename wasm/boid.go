package main

import "math/rand"

// Boid represents a single boid entity
type Boid struct {
	Position     Vector2
	Velocity     Vector2
	Acceleration Vector2
	MaxSpeed     float64
	MaxForce     float64
}

// NewBoid creates a new boid at the specified position
func NewBoid(x, y float64) Boid {
	return Boid{
		Position: Vector2{X: x, Y: y},
		Velocity: Vector2{
			X: (rand.Float64() - 0.5) * 2.0,
			Y: (rand.Float64() - 0.5) * 2.0,
		},
		Acceleration: Vector2{X: 0, Y: 0},
		MaxSpeed:     2.0,
		MaxForce:     0.03,
	}
}

// Update updates the boid's position and velocity
func (b *Boid) Update() {
	// Update velocity by acceleration
	b.Velocity = b.Velocity.Add(b.Acceleration)
	
	// Limit velocity to max speed
	b.Velocity = b.Velocity.Limit(b.MaxSpeed)
	
	// Update position by velocity
	b.Position = b.Position.Add(b.Velocity)
	
	// Reset acceleration
	b.Acceleration = Vector2{X: 0, Y: 0}
}

// ApplyForce applies a force to the boid
func (b *Boid) ApplyForce(force Vector2) {
	b.Acceleration = b.Acceleration.Add(force)
}

// WrapAround handles boundary wrapping
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

// seek calculates steering force toward a target
func (b *Boid) seek(target Vector2) Vector2 {
	desired := target.Sub(b.Position)
	desired = desired.Normalize()
	desired = desired.Mul(b.MaxSpeed)
	steer := desired.Sub(b.Velocity)
	return steer.Limit(b.MaxForce)
}