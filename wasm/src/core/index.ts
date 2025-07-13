/**
 * ボイドクラス - 群れの中の個体を表現
 * 位置と速度の情報を保持し、群れの行動を実現する
 */
export class Boid {
  x: f32;  // X座標
  y: f32;  // Y座標
  vx: f32; // X方向の速度
  vy: f32; // Y方向の速度

  constructor(x: f32, y: f32, vx: f32, vy: f32) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }
}

// ボイドの行動パラメータ
let separationDistance: f32 = 25.0;    // 分離行動の影響距離
let alignmentDistance: f32 = 50.0;     // 整列行動の影響距離
let cohesionDistance: f32 = 50.0;      // 結合行動の影響距離
let separationForce: f32 = 0.2;        // 分離行動の力の強さ
let alignmentForce: f32 = 0.1;         // 整列行動の力の強さ
let cohesionForce: f32 = 0.1;          // 結合行動の力の強さ
let maxSpeed: f32 = 1.5;               // 最大速度
let maxForce: f32 = 0.03;              // 最大操舵力
let mouseAvoidDistance: f32 = 100.0;   // マウス回避の影響距離
let mouseAvoidForce: f32 = 5.0;        // マウス回避の力の強さ

// キャンバスサイズ
let canvasWidth: f32 = 800;
let canvasHeight: f32 = 600;

// グローバル変数
let boids: Boid[] = [];      // ボイドの配列
let mouseX: f32 = -1000;     // マウスのX座標（初期値は画面外）
let mouseY: f32 = -1000;     // マウスのY座標（初期値は画面外）

/**
 * ボイドシミュレーションの初期化
 * @param count ボイドの個体数
 * @param width キャンバスの幅
 * @param height キャンバスの高さ
 */
export function init(count: i32, width: f32, height: f32): void {
  canvasWidth = width;
  canvasHeight = height;
  boids = [];

  // 指定された個体数のボイドを生成
  for (let i = 0; i < count; i++) {
    const angle = Mathf.random() * 2.0 * Mathf.PI;
    const speed = Mathf.random() * 0.5 + 0.2; // 0.2～0.7の範囲でランダムな速度
    boids.push(new Boid(
      Mathf.random() * width,   // ランダムなX座標
      Mathf.random() * height,  // ランダムなY座標
      Mathf.cos(angle) * speed, // X方向の初期速度
      Mathf.sin(angle) * speed  // Y方向の初期速度
    ));
  }
}

/**
 * ボイドの行動パラメータを設定する
 * @param sepDist 分離行動の影響距離
 * @param alignDist 整列行動の影響距離
 * @param cohDist 結合行動の影響距離
 * @param sepForce 分離行動の力の強さ
 * @param alignForce 整列行動の力の強さ
 * @param cohForce 結合行動の力の強さ
 * @param mouseAvoidDist マウス回避の影響距離
 * @param mouseAvoidF マウス回避の力の強さ
 */
export function setParameters(
  sepDist: f32, alignDist: f32, cohDist: f32,
  sepForce: f32, alignForce: f32, cohForce: f32,
  mouseAvoidDist: f32, mouseAvoidF: f32
): void {
  separationDistance = sepDist;
  alignmentDistance = alignDist;
  cohesionDistance = cohDist;
  separationForce = sepForce;
  alignmentForce = alignForce;
  cohesionForce = cohForce;
  mouseAvoidDistance = mouseAvoidDist;
  mouseAvoidForce = mouseAvoidF;
}

/**
 * マウス位置を更新する
 * @param x マウスのX座標
 * @param y マウスのY座標
 */
export function updateMouse(x: f32, y: f32): void {
  mouseX = x;
  mouseY = y;
}

/**
 * 2つのボイド間の距離を計算する（トーラス境界を考慮）
 * @param b1 ボイド1
 * @param b2 ボイド2
 * @returns 距離
 */
function getDistance(b1: Boid, b2: Boid): f32 {
  let dx = abs(b1.x - b2.x);
  let dy = abs(b1.y - b2.y);

  // トーラス境界での最短距離を計算
  if (dx > canvasWidth / 2) dx = canvasWidth - dx;
  if (dy > canvasHeight / 2) dy = canvasHeight - dy;

  return Mathf.sqrt(dx * dx + dy * dy);
}

/**
 * トーラス境界での2点間の差分を計算する
 * @param p1 点1の座標
 * @param p2 点2の座標
 * @param max 境界の最大値
 * @returns 最短方向の差分
 */
function getWrappedDiff(p1: f32, p2: f32, max: f32): f32 {
  let diff = p2 - p1;
  // 境界をまたぐ場合の最短距離を考慮
  if (diff > max / 2) diff -= max;
  else if (diff < -max / 2) diff += max;
  return diff;
}

/**
 * 個々のボイドの位置と速度を更新する
 * ボイドの3つの基本行動（分離・整列・結合）とマウス回避を実装
 * @param index 更新するボイドのインデックス
 */
function updateBoid(index: i32): void {
  const boid = boids[index];

  // 各行動の力を累積する変数
  let sepX: f32 = 0, sepY: f32 = 0;     // 分離行動の力
  let alignX: f32 = 0, alignY: f32 = 0; // 整列行動の力
  let cohX: f32 = 0, cohY: f32 = 0;     // 結合行動の力
  let sepCount = 0, alignCount = 0, cohCount = 0; // 各行動の影響を受ける近隣ボイドの数

  // 他のすべてのボイドとの相互作用を計算
  for (let i = 0; i < boids.length; i++) {
    if (i === index) continue; // 自分自身は除外

    const other = boids[i];
    const dist = getDistance(boid, other);

    // 分離行動：近すぎる場合は離れる
    if (dist < separationDistance && dist > 0) {
      const dx = getWrappedDiff(other.x, boid.x, canvasWidth);
      const dy = getWrappedDiff(other.y, boid.y, canvasHeight);
      sepX += dx / dist; // 距離で正規化して方向を得る
      sepY += dy / dist;
      sepCount++;
    }

    // 整列行動：近隣ボイドの速度に合わせる
    if (dist < alignmentDistance) {
      alignX += other.vx;
      alignY += other.vy;
      alignCount++;
    }

    // 結合行動：近隣ボイドの中心に向かう
    if (dist < cohesionDistance) {
      cohX += other.x;
      cohY += other.y;
      cohCount++;
    }
  }

  // 分離行動の力を計算
  if (sepCount > 0) {
    sepX /= sepCount as f32; // 平均方向を計算
    sepY /= sepCount as f32;
    const mag = Mathf.sqrt(sepX * sepX + sepY * sepY);
    if (mag > 0) {
      sepX = (sepX / mag) * separationForce; // 正規化して強度を適用
      sepY = (sepY / mag) * separationForce;
      // 力の大きさを制限
      const forceMag = Mathf.sqrt(sepX * sepX + sepY * sepY);
      if (forceMag > maxForce) {
        sepX = (sepX / forceMag) * maxForce;
        sepY = (sepY / forceMag) * maxForce;
      }
    }
  }

  // 整列行動の力を計算
  if (alignCount > 0) {
    alignX /= alignCount as f32; // 近隣ボイドの平均速度
    alignY /= alignCount as f32;
    const mag = Mathf.sqrt(alignX * alignX + alignY * alignY);
    if (mag > 0) {
      alignX = (alignX / mag) * maxSpeed; // 目標速度に正規化
      alignY = (alignY / mag) * maxSpeed;
      alignX = (alignX - boid.vx) * alignmentForce; // 現在の速度との差分
      alignY = (alignY - boid.vy) * alignmentForce;
      // 力の大きさを制限
      const forceMag = Mathf.sqrt(alignX * alignX + alignY * alignY);
      if (forceMag > maxForce) {
        alignX = (alignX / forceMag) * maxForce;
        alignY = (alignY / forceMag) * maxForce;
      }
    }
  }

  // 結合行動の力を計算
  if (cohCount > 0) {
    cohX /= cohCount as f32; // 近隣ボイドの重心を計算
    cohY /= cohCount as f32;
    cohX = getWrappedDiff(boid.x, cohX, canvasWidth); // トーラス境界での方向
    cohY = getWrappedDiff(boid.y, cohY, canvasHeight);
    const mag = Mathf.sqrt(cohX * cohX + cohY * cohY);
    if (mag > 0) {
      cohX = (cohX / mag) * maxSpeed; // 目標速度に正規化
      cohY = (cohY / mag) * maxSpeed;
      cohX = (cohX - boid.vx) * cohesionForce; // 現在の速度との差分
      cohY = (cohY - boid.vy) * cohesionForce;
      // 力の大きさを制限
      const forceMag = Mathf.sqrt(cohX * cohX + cohY * cohY);
      if (forceMag > maxForce) {
        cohX = (cohX / forceMag) * maxForce;
        cohY = (cohY / forceMag) * maxForce;
      }
    }
  }

  // マウス回避の力を計算
  let mouseForceX: f32 = 0, mouseForceY: f32 = 0;
  if (mouseX >= 0 && mouseY >= 0) { // マウスが画面内にある場合
    const mouseDist = Mathf.sqrt(
      (boid.x - mouseX) * (boid.x - mouseX) +
      (boid.y - mouseY) * (boid.y - mouseY)
    );

    // マウスが近すぎる場合は回避行動
    if (mouseDist < mouseAvoidDistance && mouseDist > 0) {
      mouseForceX = (boid.x - mouseX) / mouseDist; // マウスから離れる方向
      mouseForceY = (boid.y - mouseY) / mouseDist;
      mouseForceX *= mouseAvoidForce; // 回避力を適用
      mouseForceY *= mouseAvoidForce;
    }
  }

  // すべての力を合成して速度に加算
  boid.vx += sepX + alignX + cohX + mouseForceX;
  boid.vy += sepY + alignY + cohY + mouseForceY;

  // 速度制限：最大速度を超えないようにする
  const speed = Mathf.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
  if (speed > maxSpeed) {
    boid.vx = (boid.vx / speed) * maxSpeed;
    boid.vy = (boid.vy / speed) * maxSpeed;
  }

  // 位置を更新
  boid.x += boid.vx;
  boid.y += boid.vy;

  // 境界処理：スムーズな境界ラッピング（瞬間移動ではなく）
  if (boid.x < 0) boid.x = canvasWidth - 1;
  else if (boid.x >= canvasWidth) boid.x = 1;
  if (boid.y < 0) boid.y = canvasHeight - 1;
  else if (boid.y >= canvasHeight) boid.y = 1;
}

/**
 * すべてのボイドを更新する
 * メインのシミュレーションループから呼び出される
 */
export function update(): void {
  for (let i = 0; i < boids.length; i++) {
    updateBoid(i);
  }
}

/**
 * 全ボイドの位置と速度データを取得する
 * JavaScriptコードから呼び出されて描画に使用される
 * @returns Float32Array 各ボイドのx,y,vx,vyが順番に格納された配列
 */
export function getPositions(): Float32Array {
  // 正しいサイズの位置配列を作成（ボイド数 × 4要素）
  const arraySize = boids.length * 4;
  const positions = new Float32Array(arraySize);
  
  // 各ボイドの位置と速度情報を配列に格納
  for (let i = 0; i < boids.length; i++) {
    const boid = boids[i];
    positions[i * 4] = boid.x;      // X座標
    positions[i * 4 + 1] = boid.y;  // Y座標
    positions[i * 4 + 2] = boid.vx; // X方向速度
    positions[i * 4 + 3] = boid.vy; // Y方向速度
  }
  return positions;
}

/**
 * ボイドの個体数を取得する（デバッグ用）
 * @returns ボイドの総数
 */
export function getBoidCount(): i32 {
  return boids.length;
}

/**
 * 絶対値を計算するヘルパー関数
 * @param x 入力値
 * @returns 絶対値
 */
function abs(x: f32): f32 {
  return x < 0 ? -x : x;
}