package main

import "math"

// SpatialGrid represents a spatial partitioning grid for efficient neighbor searching
type SpatialGrid struct {
	cellSize float64
	width    float64
	height   float64
	cols     int
	rows     int
	cells    [][]int // 1D array of cells, each containing boid indices
}

// NewSpatialGrid creates a new spatial grid
func NewSpatialGrid(width, height, cellSize float64) *SpatialGrid {
	cols := int(math.Ceil(width / cellSize))
	rows := int(math.Ceil(height / cellSize))
	totalCells := rows * cols
	
	cells := make([][]int, totalCells)
	for i := range cells {
		cells[i] = make([]int, 0, 10) // pre-allocate capacity
	}
	
	return &SpatialGrid{
		cellSize: cellSize,
		width:    width,
		height:   height,
		cols:     cols,
		rows:     rows,
		cells:    cells,
	}
}

// Clear resets all cells
func (sg *SpatialGrid) Clear() {
	for i := range sg.cells {
		sg.cells[i] = sg.cells[i][:0] // reset slice but keep capacity
	}
}

// Insert adds a boid to the grid
func (sg *SpatialGrid) Insert(boidIndex int, position Vector2) {
	row, col := sg.getCellCoords(position)
	if sg.isValidCell(row, col) {
		cellIndex := row * sg.cols + col
		sg.cells[cellIndex] = append(sg.cells[cellIndex], boidIndex)
	}
}

// GetNeighbors returns all boid indices in cells within the given radius
func (sg *SpatialGrid) GetNeighbors(position Vector2, radius float64) []int {
	neighbors := make([]int, 0, 20) // pre-allocate
	
	// Calculate cell range to check
	cellRadius := int(math.Ceil(radius / sg.cellSize))
	centerRow, centerCol := sg.getCellCoords(position)
	
	for row := centerRow - cellRadius; row <= centerRow + cellRadius; row++ {
		for col := centerCol - cellRadius; col <= centerCol + cellRadius; col++ {
			if sg.isValidCell(row, col) {
				cellIndex := row * sg.cols + col
				neighbors = append(neighbors, sg.cells[cellIndex]...)
			}
		}
	}
	
	return neighbors
}

// getCellCoords converts world position to grid coordinates
func (sg *SpatialGrid) getCellCoords(position Vector2) (int, int) {
	col := int(position.X / sg.cellSize)
	row := int(position.Y / sg.cellSize)
	return row, col
}

// isValidCell checks if cell coordinates are within grid bounds
func (sg *SpatialGrid) isValidCell(row, col int) bool {
	return row >= 0 && row < sg.rows && col >= 0 && col < sg.cols
}