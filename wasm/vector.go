package main

import "math"

// Vector2 represents a 2D vector
type Vector2 struct {
	X, Y float64
}

// Add returns the sum of two vectors
func (v Vector2) Add(other Vector2) Vector2 {
	return Vector2{X: v.X + other.X, Y: v.Y + other.Y}
}

// Sub returns the difference of two vectors
func (v Vector2) Sub(other Vector2) Vector2 {
	return Vector2{X: v.X - other.X, Y: v.Y - other.Y}
}

// Mul returns the vector multiplied by a scalar
func (v Vector2) Mul(scalar float64) Vector2 {
	return Vector2{X: v.X * scalar, Y: v.Y * scalar}
}

// Div returns the vector divided by a scalar
func (v Vector2) Div(scalar float64) Vector2 {
	if scalar == 0 {
		return Vector2{X: 0, Y: 0}
	}
	return Vector2{X: v.X / scalar, Y: v.Y / scalar}
}

// Magnitude returns the magnitude of the vector
func (v Vector2) Magnitude() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y)
}

// Normalize returns a unit vector in the same direction
func (v Vector2) Normalize() Vector2 {
	mag := v.Magnitude()
	if mag == 0 {
		return Vector2{X: 0, Y: 0}
	}
	return v.Div(mag)
}

// Limit returns a vector with magnitude limited to max
func (v Vector2) Limit(max float64) Vector2 {
	mag := v.Magnitude()
	if mag > max {
		return v.Normalize().Mul(max)
	}
	return v
}

// Distance returns the distance between two vectors
func (v Vector2) Distance(other Vector2) float64 {
	dx := v.X - other.X
	dy := v.Y - other.Y
	return math.Sqrt(dx*dx + dy*dy)
}