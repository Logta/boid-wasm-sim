package boid

import (
	"math"
	"testing"

	"boid-wasm-sim/internal/vector"
)

func TestNewBoid(t *testing.T) {
	b := New(10.0, 20.0)

	if b.Position.X != 10.0 || b.Position.Y != 20.0 {
		t.Errorf("New position = (%v, %v), want (10, 20)", b.Position.X, b.Position.Y)
	}

	if b.MaxSpeed != 2.0 {
		t.Errorf("New MaxSpeed = %v, want 2.0", b.MaxSpeed)
	}

	if b.MaxForce != 0.03 {
		t.Errorf("New MaxForce = %v, want 0.03", b.MaxForce)
	}

	// Acceleration should be zero initially
	if b.Acceleration.X != 0.0 || b.Acceleration.Y != 0.0 {
		t.Errorf("New acceleration = (%v, %v), want (0, 0)", b.Acceleration.X, b.Acceleration.Y)
	}
}

func TestBoidUpdate(t *testing.T) {
	b := New(0.0, 0.0)
	b.Velocity = vector.Vector2{X: 1.0, Y: 1.0}
	b.Acceleration = vector.Vector2{X: 0.1, Y: 0.1}

	initialPos := b.Position

	b.Update()

	// Velocity should be updated by acceleration
	expectedVel := vector.Vector2{X: 1.1, Y: 1.1}
	if math.Abs(b.Velocity.X-expectedVel.X) > 1e-9 || math.Abs(b.Velocity.Y-expectedVel.Y) > 1e-9 {
		t.Errorf("After update velocity = %v, want %v", b.Velocity, expectedVel)
	}

	// Position should be updated by velocity
	expectedPos := initialPos.Add(expectedVel)
	if math.Abs(b.Position.X-expectedPos.X) > 1e-9 || math.Abs(b.Position.Y-expectedPos.Y) > 1e-9 {
		t.Errorf("After update position = %v, want %v", b.Position, expectedPos)
	}

	// Acceleration should be reset to zero
	if b.Acceleration.X != 0.0 || b.Acceleration.Y != 0.0 {
		t.Errorf("After update acceleration = %v, want (0, 0)", b.Acceleration)
	}
}

func TestBoidApplyForce(t *testing.T) {
	b := New(0.0, 0.0)
	b.Acceleration = vector.Vector2{X: 0.1, Y: 0.1}

	force := vector.Vector2{X: 0.05, Y: 0.02}
	b.ApplyForce(force)

	expected := vector.Vector2{X: 0.15, Y: 0.12}
	if math.Abs(b.Acceleration.X-expected.X) > 1e-9 || math.Abs(b.Acceleration.Y-expected.Y) > 1e-9 {
		t.Errorf("After ApplyForce acceleration = %v, want %v", b.Acceleration, expected)
	}
}

func TestBoidWrapAround(t *testing.T) {
	tests := []struct {
		name     string
		initial  vector.Vector2
		width    float64
		height   float64
		expected vector.Vector2
	}{
		{
			name:     "left edge",
			initial:  vector.Vector2{X: -1.0, Y: 50.0},
			width:    100.0,
			height:   100.0,
			expected: vector.Vector2{X: 100.0, Y: 50.0},
		},
		{
			name:     "right edge",
			initial:  vector.Vector2{X: 101.0, Y: 50.0},
			width:    100.0,
			height:   100.0,
			expected: vector.Vector2{X: 0.0, Y: 50.0},
		},
		{
			name:     "top edge",
			initial:  vector.Vector2{X: 50.0, Y: -1.0},
			width:    100.0,
			height:   100.0,
			expected: vector.Vector2{X: 50.0, Y: 100.0},
		},
		{
			name:     "bottom edge",
			initial:  vector.Vector2{X: 50.0, Y: 101.0},
			width:    100.0,
			height:   100.0,
			expected: vector.Vector2{X: 50.0, Y: 0.0},
		},
		{
			name:     "inside bounds",
			initial:  vector.Vector2{X: 50.0, Y: 50.0},
			width:    100.0,
			height:   100.0,
			expected: vector.Vector2{X: 50.0, Y: 50.0},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			b := New(tt.initial.X, tt.initial.Y)
			b.WrapAround(tt.width, tt.height)

			if b.Position != tt.expected {
				t.Errorf("WrapAround() = %v, want %v", b.Position, tt.expected)
			}
		})
	}
}

func TestBoidSeek(t *testing.T) {
	b := New(0.0, 0.0)
	b.Velocity = vector.Vector2{X: 0.0, Y: 0.0}
	b.MaxSpeed = 2.0
	b.MaxForce = 1.0

	target := vector.Vector2{X: 10.0, Y: 0.0}
	force := b.Seek(target)

	// Force should point towards the target
	if force.X <= 0 {
		t.Errorf("Seek() force.X = %v, should be positive (towards target)", force.X)
	}

	// Force magnitude should not exceed MaxForce
	if force.Magnitude() > b.MaxForce+1e-9 {
		t.Errorf("Seek() force magnitude = %v, should not exceed MaxForce %v", force.Magnitude(), b.MaxForce)
	}
}
