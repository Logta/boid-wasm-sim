package spatialgrid

import (
	"testing"

	"boid-wasm-sim/internal/vector"
)

func containsInt(haystack []int, needle int) bool {
	for _, v := range haystack {
		if v == needle {
			return true
		}
	}
	return false
}

// getCellCoordsはXをcol、Yをrowに対応させる。非正方形グリッドで
// row/colを取り違えると、GetNeighbors経由の間接テストでは
// insert/queryが同じ(誤った)変換を使うため自己矛盾せず気づけない。
// そのため座標変換そのものを直接検証する。
func TestGetCellCoords(t *testing.T) {
	grid := New(800.0, 200.0, 50.0) // cols=16, rows=4 (非正方形)

	tests := []struct {
		name    string
		pos     vector.Vector2
		wantRow int
		wantCol int
	}{
		{"origin", vector.Vector2{X: 0, Y: 0}, 0, 0},
		{"縦方向(小さいX・大きいY)", vector.Vector2{X: 10, Y: 150}, 3, 0},
		{"横方向(大きいX・小さいY)", vector.Vector2{X: 150, Y: 10}, 0, 3},
		{"セル境界ちょうど", vector.Vector2{X: 100, Y: 100}, 2, 2},
		{"境界の手前", vector.Vector2{X: 99.9, Y: 49.9}, 0, 1},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			row, col := grid.getCellCoords(tt.pos)
			if row != tt.wantRow || col != tt.wantCol {
				t.Errorf("getCellCoords(%v) = (row=%d, col=%d), want (row=%d, col=%d)",
					tt.pos, row, col, tt.wantRow, tt.wantCol)
			}
		})
	}
}

func TestIsValidCell(t *testing.T) {
	grid := New(800.0, 200.0, 50.0) // cols=16, rows=4

	tests := []struct {
		name     string
		row, col int
		want     bool
	}{
		{"左上端", 0, 0, true},
		{"右下端", 3, 15, true},
		{"row負", -1, 0, false},
		{"col負", 0, -1, false},
		{"rowが範囲外", 4, 0, false},
		{"colが範囲外", 0, 16, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := grid.isValidCell(tt.row, tt.col)
			if got != tt.want {
				t.Errorf("isValidCell(%d, %d) = %v, want %v", tt.row, tt.col, got, tt.want)
			}
		})
	}
}

func TestInsertAndGetNeighbors(t *testing.T) {
	grid := New(800.0, 600.0, 75.0)
	grid.Insert(0, vector.Vector2{X: 10, Y: 10})
	grid.Insert(1, vector.Vector2{X: 500, Y: 500})

	near := grid.GetNeighbors(vector.Vector2{X: 15, Y: 15}, 30.0)
	if !containsInt(near, 0) {
		t.Errorf("expected boid 0 to be found near (15,15), got %v", near)
	}
	if containsInt(near, 1) {
		t.Errorf("boid 1 at (500,500) should not be a neighbor, got %v", near)
	}
}

// 幅(800)と高さ(200)が大きく異なる非正方形グリッドで、行方向の境界に近い
// 座標を使う。row/colを取り違えるとこの座標はグリッド範囲外と誤判定され、
// Insert/GetNeighborsが黙って対象boidを取りこぼす(パニックにはならない)。
func TestGetNeighbors_AsymmetricGridBoundary(t *testing.T) {
	grid := New(800.0, 200.0, 50.0)           // cols=16, rows=4
	pos := vector.Vector2{X: 750.0, Y: 190.0} // 正しくは row=3, col=15 (グリッド内)

	grid.Insert(0, pos)
	near := grid.GetNeighbors(pos, 10.0)

	if !containsInt(near, 0) {
		t.Errorf("expected boid 0 to be found near %v, got %v", pos, near)
	}
}

func TestGetNeighbors_OutOfBoundsPositionIsIgnored(t *testing.T) {
	grid := New(800.0, 600.0, 75.0)

	// グリッド範囲外(負の座標)へのInsertはパニックせず、単に無視される
	grid.Insert(0, vector.Vector2{X: -100, Y: -100})

	near := grid.GetNeighbors(vector.Vector2{X: 0, Y: 0}, 1000.0)
	if containsInt(near, 0) {
		t.Errorf("out-of-bounds boid should not appear as a neighbor, got %v", near)
	}
}

func TestGetNeighbors_ZeroRadiusOnlyChecksOwnCell(t *testing.T) {
	grid := New(800.0, 600.0, 75.0)

	// 同一セル内
	grid.Insert(0, vector.Vector2{X: 10, Y: 10})
	// 隣接セル(cellSize=75なので x=80はセルが1つ隣)だが、ユークリッド距離は小さい
	grid.Insert(1, vector.Vector2{X: 80, Y: 10})

	near := grid.GetNeighbors(vector.Vector2{X: 10, Y: 10}, 0.0)

	if !containsInt(near, 0) {
		t.Errorf("expected boid 0 in the same cell to be found, got %v", near)
	}
	if containsInt(near, 1) {
		t.Errorf("半径0では隣接セルのboid 1は対象にならないはず, got %v", near)
	}
}

func TestClear(t *testing.T) {
	grid := New(800.0, 600.0, 75.0)
	grid.Insert(0, vector.Vector2{X: 10, Y: 10})

	grid.Clear()

	near := grid.GetNeighbors(vector.Vector2{X: 10, Y: 10}, 30.0)
	if containsInt(near, 0) {
		t.Errorf("Clear()後はどのboidも見つからないはず, got %v", near)
	}
}
