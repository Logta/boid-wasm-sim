package main

import (
	"math"
	"testing"
)

func TestVector2Add(t *testing.T) {
	v1 := Vector2{X: 1.0, Y: 2.0}
	v2 := Vector2{X: 3.0, Y: 4.0}
	result := v1.Add(v2)
	
	expected := Vector2{X: 4.0, Y: 6.0}
	if result != expected {
		t.Errorf("Add() = %v, want %v", result, expected)
	}
}

func TestVector2Sub(t *testing.T) {
	v1 := Vector2{X: 5.0, Y: 7.0}
	v2 := Vector2{X: 2.0, Y: 3.0}
	result := v1.Sub(v2)
	
	expected := Vector2{X: 3.0, Y: 4.0}
	if result != expected {
		t.Errorf("Sub() = %v, want %v", result, expected)
	}
}

func TestVector2Mul(t *testing.T) {
	v := Vector2{X: 2.0, Y: 3.0}
	result := v.Mul(2.0)
	
	expected := Vector2{X: 4.0, Y: 6.0}
	if result != expected {
		t.Errorf("Mul() = %v, want %v", result, expected)
	}
}

func TestVector2Div(t *testing.T) {
	v := Vector2{X: 6.0, Y: 8.0}
	result := v.Div(2.0)
	
	expected := Vector2{X: 3.0, Y: 4.0}
	if result != expected {
		t.Errorf("Div() = %v, want %v", result, expected)
	}
}

func TestVector2DivByZero(t *testing.T) {
	v := Vector2{X: 6.0, Y: 8.0}
	result := v.Div(0.0)
	
	expected := Vector2{X: 0.0, Y: 0.0}
	if result != expected {
		t.Errorf("Div by zero = %v, want %v", result, expected)
	}
}

func TestVector2Magnitude(t *testing.T) {
	v := Vector2{X: 3.0, Y: 4.0}
	result := v.Magnitude()
	
	expected := 5.0
	if math.Abs(result-expected) > 1e-9 {
		t.Errorf("Magnitude() = %v, want %v", result, expected)
	}
}

func TestVector2Normalize(t *testing.T) {
	v := Vector2{X: 3.0, Y: 4.0}
	result := v.Normalize()
	
	expected := Vector2{X: 0.6, Y: 0.8}
	if math.Abs(result.X-expected.X) > 1e-9 || math.Abs(result.Y-expected.Y) > 1e-9 {
		t.Errorf("Normalize() = %v, want %v", result, expected)
	}
}

func TestVector2NormalizeZero(t *testing.T) {
	v := Vector2{X: 0.0, Y: 0.0}
	result := v.Normalize()
	
	expected := Vector2{X: 0.0, Y: 0.0}
	if result != expected {
		t.Errorf("Normalize zero vector = %v, want %v", result, expected)
	}
}

func TestVector2Limit(t *testing.T) {
	v := Vector2{X: 6.0, Y: 8.0}
	result := v.Limit(5.0)
	
	// Should be normalized to magnitude 5
	expectedMag := 5.0
	if math.Abs(result.Magnitude()-expectedMag) > 1e-9 {
		t.Errorf("Limit() magnitude = %v, want %v", result.Magnitude(), expectedMag)
	}
}

func TestVector2LimitNoChange(t *testing.T) {
	v := Vector2{X: 2.0, Y: 3.0}
	result := v.Limit(5.0)
	
	// Should not change since magnitude is less than limit
	if result != v {
		t.Errorf("Limit() = %v, want %v", result, v)
	}
}

func TestVector2Distance(t *testing.T) {
	v1 := Vector2{X: 0.0, Y: 0.0}
	v2 := Vector2{X: 3.0, Y: 4.0}
	result := v1.Distance(v2)
	
	expected := 5.0
	if math.Abs(result-expected) > 1e-9 {
		t.Errorf("Distance() = %v, want %v", result, expected)
	}
}