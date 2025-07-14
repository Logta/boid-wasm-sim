package main

import "math"

// SimulationParams holds all simulation parameters
type SimulationParams struct {
	SeparationRadius       float64
	SeparationStrength     float64
	AlignmentRadius        float64
	AlignmentStrength      float64
	CohesionRadius         float64
	CohesionStrength       float64
	MouseAvoidanceDistance float64
}

// Global state
var (
	boids        []Boid
	params       SimulationParams
	canvasWidth  float64 = 800.0
	canvasHeight float64 = 600.0
	mousePos     Vector2 = Vector2{X: -1000.0, Y: -1000.0}
	spatialGrid  *SpatialGrid
)

// Optimized flocking behaviors using spatial grid
func (b *Boid) separate(boidIndex int) Vector2 {
	steer := Vector2{X: 0, Y: 0}
	count := 0
	separationRadiusSquared := params.SeparationRadius * params.SeparationRadius

	// Get nearby boids using spatial grid
	nearbyIndices := spatialGrid.GetNeighbors(b.Position, params.SeparationRadius)
	
	for _, otherIndex := range nearbyIndices {
		if otherIndex == boidIndex {
			continue // Skip self
		}
		
		other := &boids[otherIndex]
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
		return steer.Mul(params.SeparationStrength)
	}

	return Vector2{X: 0, Y: 0}
}

func (b *Boid) align(boidIndex int) Vector2 {
	sum := Vector2{X: 0, Y: 0}
	count := 0
	alignmentRadiusSquared := params.AlignmentRadius * params.AlignmentRadius

	// Get nearby boids using spatial grid
	nearbyIndices := spatialGrid.GetNeighbors(b.Position, params.AlignmentRadius)
	
	for _, otherIndex := range nearbyIndices {
		if otherIndex == boidIndex {
			continue // Skip self
		}
		
		other := &boids[otherIndex]
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
		return steer.Mul(params.AlignmentStrength)
	}

	return Vector2{X: 0, Y: 0}
}

func (b *Boid) cohesion(boidIndex int) Vector2 {
	sum := Vector2{X: 0, Y: 0}
	count := 0
	cohesionRadiusSquared := params.CohesionRadius * params.CohesionRadius

	// Get nearby boids using spatial grid
	nearbyIndices := spatialGrid.GetNeighbors(b.Position, params.CohesionRadius)
	
	for _, otherIndex := range nearbyIndices {
		if otherIndex == boidIndex {
			continue // Skip self
		}
		
		other := &boids[otherIndex]
		distanceSquared := b.Position.DistanceSquared(other.Position)
		if distanceSquared > 0 && distanceSquared < cohesionRadiusSquared {
			sum = sum.Add(other.Position)
			count++
		}
	}

	if count > 0 {
		center := sum.Div(float64(count))
		return b.seek(center).Mul(params.CohesionStrength)
	}

	return Vector2{X: 0, Y: 0}
}

func (b *Boid) avoidMouse() Vector2 {
	mouseAvoidanceDistanceSquared := params.MouseAvoidanceDistance * params.MouseAvoidanceDistance
	distanceSquared := b.Position.DistanceSquared(mousePos)
	if distanceSquared < mouseAvoidanceDistanceSquared {
		steer := b.Position.Sub(mousePos)
		steer = steer.Normalize()
		return steer.Mul(b.MaxForce * 3.0)
	}
	return Vector2{X: 0, Y: 0}
}