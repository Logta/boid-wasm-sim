package simulation

import (
	"math"
	"testing"

	"boid-wasm-sim/internal/boid"
	"boid-wasm-sim/internal/spatialgrid"
	"boid-wasm-sim/internal/vector"
)

const magnitudeEpsilon = 1e-9

func almostEqual(a, b float64) bool {
	return math.Abs(a-b) < magnitudeEpsilon
}

// newTestSimulation builds a Simulation directly from given boids, bypassing
// Init's random placement so tests can use deterministic positions. It lives
// in this package (not simulation_test) specifically to reach the
// unexported fields these white-box tests need.
func newTestSimulation(params Params, boids []boid.Boid) *Simulation {
	sim := &Simulation{
		params:       params,
		mousePos:     noMousePosition,
		canvasWidth:  800.0,
		canvasHeight: 600.0,
		grid:         spatialgrid.New(800.0, 600.0, 75.0),
		boids:        boids,
	}
	for i := range sim.boids {
		sim.grid.Insert(i, sim.boids[i].Position)
	}
	return sim
}

func TestDefaultParams(t *testing.T) {
	params := DefaultParams()

	if params.SeparationRadius != 25.0 {
		t.Errorf("SeparationRadius = %v, want 25.0", params.SeparationRadius)
	}
	if params.AlignmentRadius != 50.0 {
		t.Errorf("AlignmentRadius = %v, want 50.0", params.AlignmentRadius)
	}
	if params.CohesionRadius != 50.0 {
		t.Errorf("CohesionRadius = %v, want 50.0", params.CohesionRadius)
	}
	if params.MouseAvoidanceDistance != 100.0 {
		t.Errorf("MouseAvoidanceDistance = %v, want 100.0", params.MouseAvoidanceDistance)
	}
}

func TestBoidSeparation(t *testing.T) {
	b1 := boid.New(0.0, 0.0)
	b1.Velocity = vector.Vector2{X: 0.0, Y: 0.0}
	b2 := boid.New(10.0, 0.0) // Close to b1

	sim := newTestSimulation(Params{SeparationRadius: 30.0, SeparationStrength: 1.0}, []boid.Boid{b1, b2})

	force := sim.separate(&sim.boids[0], 0)

	// Force should point away from the other boid (negative X direction)
	if force.X >= 0 {
		t.Errorf("Separation force X = %v, should be negative (away from other boid)", force.X)
	}

	// 符号だけでなく力の大きさも検証する。boid同士が近いためLimit()により
	// 大きさは必ずMaxForceに飽和するので、strength倍後の大きさは
	// MaxForce*strengthに一致するはず。これにより強度パラメータの
	// 掛け忘れ・誤った係数の混入(例: 0.0001倍のような定数誤り)を検知できる。
	wantMagnitude := sim.boids[0].MaxForce * sim.params.SeparationStrength
	if !almostEqual(force.Magnitude(), wantMagnitude) {
		t.Errorf("Separation force magnitude = %v, want %v (MaxForce=%v * SeparationStrength=%v)",
			force.Magnitude(), wantMagnitude, sim.boids[0].MaxForce, sim.params.SeparationStrength)
	}

	sim.params.SeparationStrength = 2.0
	doubledForce := sim.separate(&sim.boids[0], 0)
	wantDoubledMagnitude := sim.boids[0].MaxForce * sim.params.SeparationStrength
	if !almostEqual(doubledForce.Magnitude(), wantDoubledMagnitude) {
		t.Errorf("Separation force magnitude with strength=2.0 = %v, want %v",
			doubledForce.Magnitude(), wantDoubledMagnitude)
	}
}

func TestBoidAlignment(t *testing.T) {
	b1 := boid.New(0.0, 0.0)
	b1.Velocity = vector.Vector2{X: 0.0, Y: 0.0}
	b1.MaxSpeed = 2.0
	b1.MaxForce = 1.0

	b2 := boid.New(30.0, 0.0)
	b2.Velocity = vector.Vector2{X: 1.0, Y: 0.0}

	sim := newTestSimulation(Params{AlignmentRadius: 60.0, AlignmentStrength: 1.0}, []boid.Boid{b1, b2})

	force := sim.align(&sim.boids[0], 0)

	// Force should point in the direction of other boids' velocities
	if force.X <= 0 {
		t.Errorf("Alignment force X = %v, should be positive (toward other velocity)", force.X)
	}

	// 符号だけでなく力の大きさも検証する。b2の速度により整列の目標は
	// 必ずLimit()で飽和するため、大きさはMaxForce*strengthに一致するはず。
	wantMagnitude := sim.boids[0].MaxForce * sim.params.AlignmentStrength
	if !almostEqual(force.Magnitude(), wantMagnitude) {
		t.Errorf("Alignment force magnitude = %v, want %v (MaxForce=%v * AlignmentStrength=%v)",
			force.Magnitude(), wantMagnitude, sim.boids[0].MaxForce, sim.params.AlignmentStrength)
	}

	sim.params.AlignmentStrength = 2.0
	doubledForce := sim.align(&sim.boids[0], 0)
	wantDoubledMagnitude := sim.boids[0].MaxForce * sim.params.AlignmentStrength
	if !almostEqual(doubledForce.Magnitude(), wantDoubledMagnitude) {
		t.Errorf("Alignment force magnitude with strength=2.0 = %v, want %v",
			doubledForce.Magnitude(), wantDoubledMagnitude)
	}
}

func TestBoidCohesion(t *testing.T) {
	b1 := boid.New(0.0, 0.0)
	b1.Velocity = vector.Vector2{X: 0.0, Y: 0.0}
	b1.MaxSpeed = 2.0
	b1.MaxForce = 1.0

	b2 := boid.New(30.0, 0.0)

	sim := newTestSimulation(Params{CohesionRadius: 60.0, CohesionStrength: 1.0}, []boid.Boid{b1, b2})

	force := sim.cohere(&sim.boids[0], 0)

	// Force should point toward the center of other boids
	if force.X <= 0 {
		t.Errorf("Cohesion force X = %v, should be positive (toward other boid)", force.X)
	}

	// 符号だけでなく力の大きさも検証する。boid.Seek内のLimit()で必ず飽和するため、
	// 大きさはMaxForce*strengthに一致するはず。
	wantMagnitude := sim.boids[0].MaxForce * sim.params.CohesionStrength
	if !almostEqual(force.Magnitude(), wantMagnitude) {
		t.Errorf("Cohesion force magnitude = %v, want %v (MaxForce=%v * CohesionStrength=%v)",
			force.Magnitude(), wantMagnitude, sim.boids[0].MaxForce, sim.params.CohesionStrength)
	}

	sim.params.CohesionStrength = 2.0
	doubledForce := sim.cohere(&sim.boids[0], 0)
	wantDoubledMagnitude := sim.boids[0].MaxForce * sim.params.CohesionStrength
	if !almostEqual(doubledForce.Magnitude(), wantDoubledMagnitude) {
		t.Errorf("Cohesion force magnitude with strength=2.0 = %v, want %v",
			doubledForce.Magnitude(), wantDoubledMagnitude)
	}
}

func TestBoidAvoidMouse(t *testing.T) {
	sim := New(Params{MouseAvoidanceDistance: 50.0})
	sim.mousePos = vector.Vector2{X: 10.0, Y: 0.0}

	b := boid.New(0.0, 0.0)
	b.MaxForce = 1.0

	force := sim.avoidMouse(&b)

	// Force should point away from mouse (negative X direction)
	if force.X >= 0 {
		t.Errorf("Mouse avoidance force X = %v, should be negative (away from mouse)", force.X)
	}

	// Test when mouse is far away
	sim.mousePos = vector.Vector2{X: 100.0, Y: 0.0}
	force = sim.avoidMouse(&b)

	// Force should be zero when mouse is far
	if force.X != 0.0 || force.Y != 0.0 {
		t.Errorf("Mouse avoidance force when far = %v, should be zero", force)
	}
}

func TestBoidNoSelfInteraction(t *testing.T) {
	b := boid.New(0.0, 0.0)
	b.Velocity = vector.Vector2{X: 1.0, Y: 0.0}

	sim := newTestSimulation(Params{
		SeparationRadius:   30.0,
		SeparationStrength: 1.0,
		AlignmentRadius:    60.0,
		AlignmentStrength:  1.0,
		CohesionRadius:     60.0,
		CohesionStrength:   1.0,
	}, []boid.Boid{b})

	sepForce := sim.separate(&sim.boids[0], 0)
	alignForce := sim.align(&sim.boids[0], 0)
	cohForce := sim.cohere(&sim.boids[0], 0)

	zeroVec := vector.Vector2{X: 0.0, Y: 0.0}

	if sepForce != zeroVec {
		t.Errorf("Self-separation force = %v, should be zero", sepForce)
	}
	if alignForce != zeroVec {
		t.Errorf("Self-alignment force = %v, should be zero", alignForce)
	}
	if cohForce != zeroVec {
		t.Errorf("Self-cohesion force = %v, should be zero", cohForce)
	}
}

func TestBoidForcesOutsideRadius(t *testing.T) {
	b1 := boid.New(0.0, 0.0)
	b1.Velocity = vector.Vector2{X: 0.0, Y: 0.0}
	b2 := boid.New(100.0, 0.0) // Far from b1

	sim := newTestSimulation(Params{
		SeparationRadius:   5.0,
		SeparationStrength: 1.0,
		AlignmentRadius:    5.0,
		AlignmentStrength:  1.0,
		CohesionRadius:     5.0,
		CohesionStrength:   1.0,
	}, []boid.Boid{b1, b2})

	sepForce := sim.separate(&sim.boids[0], 0)
	alignForce := sim.align(&sim.boids[0], 0)
	cohForce := sim.cohere(&sim.boids[0], 0)

	zeroVec := vector.Vector2{X: 0.0, Y: 0.0}

	if sepForce != zeroVec {
		t.Errorf("Separation force outside radius = %v, should be zero", sepForce)
	}
	if alignForce != zeroVec {
		t.Errorf("Alignment force outside radius = %v, should be zero", alignForce)
	}
	if cohForce != zeroVec {
		t.Errorf("Cohesion force outside radius = %v, should be zero", cohForce)
	}
}

// --- Simulation lifecycle: previously only reachable via main.go's
// //go:build js && wasm wrappers, so go test never compiled this logic.

func TestInit(t *testing.T) {
	sim := New(DefaultParams())
	sim.Init(50, 800, 600)

	if sim.BoidCount() != 50 {
		t.Errorf("BoidCount() = %d, want 50", sim.BoidCount())
	}

	for i, b := range sim.boids {
		if b.Position.X < 0 || b.Position.X > 800 || b.Position.Y < 0 || b.Position.Y > 600 {
			t.Errorf("boid %d position %v out of the 800x600 canvas", i, b.Position)
		}
	}
}

func TestInit_ReplacesPreviousBoids(t *testing.T) {
	sim := New(DefaultParams())
	sim.Init(50, 800, 600)
	sim.Init(10, 800, 600)

	if sim.BoidCount() != 10 {
		t.Errorf("BoidCount() after re-Init = %d, want 10", sim.BoidCount())
	}
}

func TestUpdate_MovesBoidsAndKeepsThemInBounds(t *testing.T) {
	sim := New(DefaultParams())
	sim.Init(20, 800, 600)

	before := make([]vector.Vector2, sim.BoidCount())
	for i, b := range sim.boids {
		before[i] = b.Position
	}

	sim.Update()

	moved := false
	for i, b := range sim.boids {
		if b.Position != before[i] {
			moved = true
		}
		if b.Position.X < 0 || b.Position.X > 800 || b.Position.Y < 0 || b.Position.Y > 600 {
			t.Errorf("boid %d position %v left the canvas after Update()", i, b.Position)
		}
	}
	if !moved {
		t.Error("Update() did not move any boid")
	}
}

func TestBoidData_ReflectsBoidState(t *testing.T) {
	sim := New(DefaultParams())
	sim.Init(3, 800, 600)

	data := sim.BoidData()
	if len(data) != 3 {
		t.Fatalf("BoidData() returned %d entries, want 3", len(data))
	}

	for i, d := range data {
		b := sim.boids[i]
		if d.X != b.Position.X || d.Y != b.Position.Y || d.VX != b.Velocity.X || d.VY != b.Velocity.Y {
			t.Errorf("BoidData()[%d] = %+v, want position=%v velocity=%v", i, d, b.Position, b.Velocity)
		}
	}
}

func TestSetMousePosition(t *testing.T) {
	sim := New(DefaultParams())
	sim.SetMousePosition(42.0, 24.0)

	if sim.mousePos.X != 42.0 || sim.mousePos.Y != 24.0 {
		t.Errorf("mousePos = %v, want (42, 24)", sim.mousePos)
	}
}

func TestUpdateParams_WireIntoParams(t *testing.T) {
	sim := New(DefaultParams())

	sim.UpdateSeparationParams(11, 22)
	if sim.params.SeparationRadius != 11 || sim.params.SeparationStrength != 22 {
		t.Errorf("after UpdateSeparationParams: params = %+v", sim.params)
	}

	sim.UpdateAlignmentParams(33, 44)
	if sim.params.AlignmentRadius != 33 || sim.params.AlignmentStrength != 44 {
		t.Errorf("after UpdateAlignmentParams: params = %+v", sim.params)
	}

	sim.UpdateCohesionParams(55, 66)
	if sim.params.CohesionRadius != 55 || sim.params.CohesionStrength != 66 {
		t.Errorf("after UpdateCohesionParams: params = %+v", sim.params)
	}

	sim.UpdateMouseAvoidanceDistance(77)
	if sim.params.MouseAvoidanceDistance != 77 {
		t.Errorf("after UpdateMouseAvoidanceDistance: params = %+v", sim.params)
	}
}

// 同じ位置に重なった boid は距離 0 で方向が定まらないため、どの行動でも
// 近傍として数えない（数えると自分の速度を打ち消す向きの力が生じてしまう）。
func TestFlocking_IgnoresCoincidentBoids(t *testing.T) {
	b1 := boid.New(100.0, 100.0)
	b1.Velocity = vector.Vector2{X: 1.0, Y: 0.0}
	b2 := boid.New(100.0, 100.0)
	b2.Velocity = vector.Vector2{X: 0.0, Y: 1.0}

	sim := newTestSimulation(Params{
		SeparationRadius:   30.0,
		SeparationStrength: 1.0,
		AlignmentRadius:    60.0,
		AlignmentStrength:  1.0,
		CohesionRadius:     60.0,
		CohesionStrength:   1.0,
	}, []boid.Boid{b1, b2})

	zeroVec := vector.Vector2{X: 0.0, Y: 0.0}
	if f := sim.separate(&sim.boids[0], 0); f != zeroVec {
		t.Errorf("separation with coincident boid = %v, want zero", f)
	}
	if f := sim.align(&sim.boids[0], 0); f != zeroVec {
		t.Errorf("alignment with coincident boid = %v, want zero", f)
	}
	if f := sim.cohere(&sim.boids[0], 0); f != zeroVec {
		t.Errorf("cohesion with coincident boid = %v, want zero", f)
	}
}

// 半径ちょうどの距離にいる boid は近傍に含めない（半径は開区間）。
func TestFlocking_ExcludesBoidsExactlyOnRadius(t *testing.T) {
	b1 := boid.New(100.0, 100.0)
	b1.Velocity = vector.Vector2{X: 1.0, Y: 0.0}
	onSeparationRadius := boid.New(125.0, 100.0)
	onSeparationRadius.Velocity = vector.Vector2{X: 0.0, Y: 1.0}
	onOtherRadii := boid.New(100.0, 150.0)
	onOtherRadii.Velocity = vector.Vector2{X: 0.0, Y: 1.0}

	sim := newTestSimulation(Params{
		SeparationRadius:   25.0,
		SeparationStrength: 1.0,
		AlignmentRadius:    50.0,
		AlignmentStrength:  1.0,
		CohesionRadius:     50.0,
		CohesionStrength:   1.0,
	}, []boid.Boid{b1, onSeparationRadius, onOtherRadii})

	zeroVec := vector.Vector2{X: 0.0, Y: 0.0}
	if f := sim.separate(&sim.boids[0], 0); f != zeroVec {
		t.Errorf("separation with boid exactly on radius = %v, want zero", f)
	}
	// onSeparationRadius（距離 25）は整列・結合の半径 50 の内側なので、
	// 整列・結合の判定には距離 50 ちょうどの onOtherRadii だけが残るよう除外する
	sim.boids = []boid.Boid{b1, onOtherRadii}
	sim.grid.Clear()
	for i := range sim.boids {
		sim.grid.Insert(i, sim.boids[i].Position)
	}
	if f := sim.align(&sim.boids[0], 0); f != zeroVec {
		t.Errorf("alignment with boid exactly on radius = %v, want zero", f)
	}
	if f := sim.cohere(&sim.boids[0], 0); f != zeroVec {
		t.Errorf("cohesion with boid exactly on radius = %v, want zero", f)
	}
}

func TestBoidAvoidMouse_MagnitudeAndBoundary(t *testing.T) {
	sim := New(Params{MouseAvoidanceDistance: 100.0})
	b := boid.New(100.0, 100.0)

	// 範囲内では MaxForce の 3 倍の大きさで押し返す
	sim.SetMousePosition(130.0, 140.0)
	force := sim.avoidMouse(&b)
	if want := b.MaxForce * 3.0; !almostEqual(force.Magnitude(), want) {
		t.Errorf("mouse avoidance magnitude = %v, want %v", force.Magnitude(), want)
	}

	// 距離がちょうど MouseAvoidanceDistance なら範囲外
	sim.SetMousePosition(200.0, 100.0)
	if f := sim.avoidMouse(&b); f != (vector.Vector2{}) {
		t.Errorf("mouse avoidance exactly at distance = %v, want zero", f)
	}
}

// マウス位置が未報告の間は、キャンバス内のどこにいても回避が働かない。
func TestBoidAvoidMouse_InactiveBeforeMouseIsReported(t *testing.T) {
	sim := New(DefaultParams())
	for _, pos := range []vector.Vector2{{X: 0, Y: 0}, {X: 1010, Y: 1000}, {X: 2000, Y: 2000}} {
		b := boid.New(pos.X, pos.Y)
		if f := sim.avoidMouse(&b); f != (vector.Vector2{}) {
			t.Errorf("mouse avoidance at %v before any mouse position = %v, want zero", pos, f)
		}
	}
}

// Init はキャンバス全体に散らばるように配置する（一隅に偏らない）。
func TestInit_SpreadsBoidsAcrossCanvas(t *testing.T) {
	sim := New(DefaultParams())
	sim.Init(500, 1000, 800)

	maxX, maxY := 0.0, 0.0
	for i, b := range sim.boids {
		if b.Position.X < 0 || b.Position.X > 1000 || b.Position.Y < 0 || b.Position.Y > 800 {
			t.Fatalf("boid %d position %v out of the 1000x800 canvas", i, b.Position)
		}
		maxX = math.Max(maxX, b.Position.X)
		maxY = math.Max(maxY, b.Position.Y)
	}
	if maxX < 500 || maxY < 400 {
		t.Errorf("boids are not spread across the canvas: max x=%v, max y=%v", maxX, maxY)
	}
}

// JS から渡る値は UI 経由では常に妥当だが、不正な値で Go ランタイムが panic すると
// 以降すべての呼び出しが失敗するため、Init は不正な引数を拒否して状態を変えない。
func TestInit_RejectsInvalidArguments(t *testing.T) {
	tests := []struct {
		name          string
		count         int
		width, height float64
	}{
		{"negative count", -1, 800, 600},
		{"too many boids", MaxBoids + 1, 800, 600},
		{"zero width", 10, 0, 600},
		{"negative height", 10, 800, -1},
		{"NaN width", 10, math.NaN(), 600},
		{"infinite height", 10, 800, math.Inf(1)},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			sim := New(DefaultParams())
			if err := sim.Init(5, 800, 600); err != nil {
				t.Fatalf("valid Init returned error: %v", err)
			}

			if err := sim.Init(tt.count, tt.width, tt.height); err == nil {
				t.Errorf("Init(%d, %v, %v) returned nil error", tt.count, tt.width, tt.height)
			}
			if sim.BoidCount() != 5 {
				t.Errorf("BoidCount() after rejected Init = %d, want 5 (unchanged)", sim.BoidCount())
			}
			sim.Update() // 以前の状態のまま動き続けられる
		})
	}
}

func TestInit_AcceptsBoundaryCounts(t *testing.T) {
	sim := New(DefaultParams())
	for _, count := range []int{0, MaxBoids} {
		if err := sim.Init(count, 800, 600); err != nil {
			t.Errorf("Init(%d, 800, 600) returned error: %v", count, err)
		}
		if sim.BoidCount() != count {
			t.Errorf("BoidCount() = %d, want %d", sim.BoidCount(), count)
		}
	}
}

func TestUpdate_BeforeInitDoesNotPanic(t *testing.T) {
	sim := New(DefaultParams())
	sim.Update()
	if sim.BoidCount() != 0 {
		t.Errorf("BoidCount() = %d, want 0", sim.BoidCount())
	}
}

// 半径・強さ・回避距離に NaN/Inf/負の値が来ても無視し、直前の値を保つ。
func TestUpdateParams_IgnoreInvalidValues(t *testing.T) {
	for _, bad := range []float64{math.NaN(), math.Inf(1), math.Inf(-1), -1} {
		sim := New(DefaultParams())
		want := sim.params

		sim.UpdateSeparationParams(bad, 1)
		sim.UpdateSeparationParams(10, bad)
		sim.UpdateAlignmentParams(bad, 1)
		sim.UpdateAlignmentParams(10, bad)
		sim.UpdateCohesionParams(bad, 1)
		sim.UpdateCohesionParams(10, bad)
		sim.UpdateMouseAvoidanceDistance(bad)

		if sim.params != want {
			t.Errorf("params after invalid value %v = %+v, want unchanged %+v", bad, sim.params, want)
		}
	}
}

func TestSetMousePosition_IgnoresNonFiniteValues(t *testing.T) {
	sim := New(DefaultParams())
	sim.SetMousePosition(42, 24)

	sim.SetMousePosition(math.NaN(), 1)
	sim.SetMousePosition(1, math.Inf(1))

	if sim.mousePos != (vector.Vector2{X: 42, Y: 24}) {
		t.Errorf("mousePos = %v, want (42, 24) unchanged", sim.mousePos)
	}
}

// 強さ 0 はその行動を無効にする正当な値（UI のスライダーも 0 から）なので受け付ける。
func TestUpdateParams_AcceptZero(t *testing.T) {
	sim := New(DefaultParams())

	sim.UpdateSeparationParams(0, 0)
	sim.UpdateAlignmentParams(0, 0)
	sim.UpdateCohesionParams(0, 0)
	sim.UpdateMouseAvoidanceDistance(0)

	if sim.params != (Params{}) {
		t.Errorf("params after zeros = %+v, want all zero", sim.params)
	}
}
