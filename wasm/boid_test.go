package main

import (
	"math"
	"testing"
)

func TestNewBoid(t *testing.T) {
	boid := NewBoid(10.0, 20.0)
	
	if boid.Position.X != 10.0 || boid.Position.Y != 20.0 {
		t.Errorf("NewBoid position = (%v, %v), want (10, 20)", boid.Position.X, boid.Position.Y)
	}
	
	if boid.MaxSpeed != 2.0 {
		t.Errorf("NewBoid MaxSpeed = %v, want 2.0", boid.MaxSpeed)
	}
	
	if boid.MaxForce != 0.03 {
		t.Errorf("NewBoid MaxForce = %v, want 0.03", boid.MaxForce)
	}
	
	// Acceleration should be zero initially
	if boid.Acceleration.X != 0.0 || boid.Acceleration.Y != 0.0 {
		t.Errorf("NewBoid acceleration = (%v, %v), want (0, 0)", boid.Acceleration.X, boid.Acceleration.Y)
	}
}

func TestBoidUpdate(t *testing.T) {
	boid := NewBoid(0.0, 0.0)
	boid.Velocity = Vector2{X: 1.0, Y: 1.0}
	boid.Acceleration = Vector2{X: 0.1, Y: 0.1}
	
	initialPos := boid.Position
	
	boid.Update()
	
	// Velocity should be updated by acceleration
	expectedVel := Vector2{X: 1.1, Y: 1.1}
	if math.Abs(boid.Velocity.X-expectedVel.X) > 1e-9 || math.Abs(boid.Velocity.Y-expectedVel.Y) > 1e-9 {
		t.Errorf("After update velocity = %v, want %v", boid.Velocity, expectedVel)
	}
	
	// Position should be updated by velocity
	expectedPos := initialPos.Add(expectedVel)
	if math.Abs(boid.Position.X-expectedPos.X) > 1e-9 || math.Abs(boid.Position.Y-expectedPos.Y) > 1e-9 {
		t.Errorf("After update position = %v, want %v", boid.Position, expectedPos)
	}
	
	// Acceleration should be reset to zero
	if boid.Acceleration.X != 0.0 || boid.Acceleration.Y != 0.0 {
		t.Errorf("After update acceleration = %v, want (0, 0)", boid.Acceleration)
	}
}

func TestBoidApplyForce(t *testing.T) {
	boid := NewBoid(0.0, 0.0)
	boid.Acceleration = Vector2{X: 0.1, Y: 0.1}
	
	force := Vector2{X: 0.05, Y: 0.02}
	boid.ApplyForce(force)
	
	expected := Vector2{X: 0.15, Y: 0.12}
	if math.Abs(boid.Acceleration.X-expected.X) > 1e-9 || math.Abs(boid.Acceleration.Y-expected.Y) > 1e-9 {
		t.Errorf("After ApplyForce acceleration = %v, want %v", boid.Acceleration, expected)
	}
}

func TestBoidWrapAround(t *testing.T) {
	tests := []struct {
		name     string
		initial  Vector2
		width    float64
		height   float64
		expected Vector2
	}{
		{
			name:     "left edge",
			initial:  Vector2{X: -1.0, Y: 50.0},
			width:    100.0,
			height:   100.0,
			expected: Vector2{X: 100.0, Y: 50.0},
		},
		{
			name:     "right edge",
			initial:  Vector2{X: 101.0, Y: 50.0},
			width:    100.0,
			height:   100.0,
			expected: Vector2{X: 0.0, Y: 50.0},
		},
		{
			name:     "top edge",
			initial:  Vector2{X: 50.0, Y: -1.0},
			width:    100.0,
			height:   100.0,
			expected: Vector2{X: 50.0, Y: 100.0},
		},
		{
			name:     "bottom edge",
			initial:  Vector2{X: 50.0, Y: 101.0},
			width:    100.0,
			height:   100.0,
			expected: Vector2{X: 50.0, Y: 0.0},
		},
		{
			name:     "inside bounds",
			initial:  Vector2{X: 50.0, Y: 50.0},
			width:    100.0,
			height:   100.0,
			expected: Vector2{X: 50.0, Y: 50.0},
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			boid := NewBoid(tt.initial.X, tt.initial.Y)
			boid.WrapAround(tt.width, tt.height)
			
			if boid.Position != tt.expected {
				t.Errorf("WrapAround() = %v, want %v", boid.Position, tt.expected)
			}
		})
	}
}

func TestBoidSeek(t *testing.T) {
	boid := NewBoid(0.0, 0.0)
	boid.Velocity = Vector2{X: 0.0, Y: 0.0}
	boid.MaxSpeed = 2.0
	boid.MaxForce = 1.0
	
	target := Vector2{X: 10.0, Y: 0.0}
	force := boid.seek(target)
	
	// Force should point towards the target
	if force.X <= 0 {
		t.Errorf("seek() force.X = %v, should be positive (towards target)", force.X)
	}
	
	// Force magnitude should not exceed MaxForce
	if force.Magnitude() > boid.MaxForce+1e-9 {
		t.Errorf("seek() force magnitude = %v, should not exceed MaxForce %v", force.Magnitude(), boid.MaxForce)
	}
}