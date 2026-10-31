package vector

import (
	"math"
	"testing"
)

// closeTo は a と b の差が許容誤差以内かを返す。NaN が混ざると false になるので、
// `math.Abs(a-b) > eps` で判定すると NaN を見逃す（NaN との比較は常に false）問題を避けられる。
func closeTo(a, b float64) bool {
	return math.Abs(a-b) <= 1e-9
}

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
	if !closeTo(result, expected) {
		t.Errorf("Magnitude() = %v, want %v", result, expected)
	}
}

func TestVector2Normalize(t *testing.T) {
	v := Vector2{X: 3.0, Y: 4.0}
	result := v.Normalize()

	expected := Vector2{X: 0.6, Y: 0.8}
	if !closeTo(result.X, expected.X) || !closeTo(result.Y, expected.Y) {
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
	if !closeTo(result.Magnitude(), expectedMag) {
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
	if !closeTo(result, expected) {
		t.Errorf("Distance() = %v, want %v", result, expected)
	}
}

// 原点以外どうしで測ることで、dx/dy の符号を取り違える実装を検知する。
func TestVector2DistanceBetweenNonOriginPoints(t *testing.T) {
	v1 := Vector2{X: 4.0, Y: 6.0}
	v2 := Vector2{X: 1.0, Y: 2.0}

	if got := v1.Distance(v2); !closeTo(got, 5.0) {
		t.Errorf("Distance() = %v, want 5", got)
	}
	if got := v2.Distance(v1); !closeTo(got, 5.0) {
		t.Errorf("Distance() reversed = %v, want 5", got)
	}
}

func TestVector2DistanceSquared(t *testing.T) {
	v1 := Vector2{X: 4.0, Y: 6.0}
	v2 := Vector2{X: 1.0, Y: 2.0}

	if got := v1.DistanceSquared(v2); got != 25.0 {
		t.Errorf("DistanceSquared() = %v, want 25", got)
	}
	if got := v2.DistanceSquared(v1); got != 25.0 {
		t.Errorf("DistanceSquared() reversed = %v, want 25", got)
	}
}
