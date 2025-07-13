export class Boid {
  x: f32;
  y: f32;
  vx: f32;
  vy: f32;

  constructor(x: f32, y: f32, vx: f32, vy: f32) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }
}

let separationDistance: f32 = 25.0;
let alignmentDistance: f32 = 50.0;
let cohesionDistance: f32 = 50.0;
let separationForce: f32 = 1.5;
let alignmentForce: f32 = 1.0;
let cohesionForce: f32 = 1.0;
let maxSpeed: f32 = 2.0;
let maxForce: f32 = 0.05;
let mouseAvoidDistance: f32 = 100.0;
let mouseAvoidForce: f32 = 5.0;

let canvasWidth: f32 = 800;
let canvasHeight: f32 = 600;

let boids: Boid[] = [];
let mouseX: f32 = -1000;
let mouseY: f32 = -1000;

export function init(count: i32, width: f32, height: f32): void {
  canvasWidth = width;
  canvasHeight = height;
  boids = [];

  for (let i = 0; i < count; i++) {
    const angle = Mathf.random() * 2.0 * Mathf.PI;
    boids.push(new Boid(
      Mathf.random() * width,
      Mathf.random() * height,
      Mathf.cos(angle) * maxSpeed,
      Mathf.sin(angle) * maxSpeed
    ));
  }
}

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

export function updateMouse(x: f32, y: f32): void {
  mouseX = x;
  mouseY = y;
}

function getDistance(b1: Boid, b2: Boid): f32 {
  let dx = abs(b1.x - b2.x);
  let dy = abs(b1.y - b2.y);

  if (dx > canvasWidth / 2) dx = canvasWidth - dx;
  if (dy > canvasHeight / 2) dy = canvasHeight - dy;

  return Mathf.sqrt(dx * dx + dy * dy);
}

function getWrappedDiff(p1: f32, p2: f32, max: f32): f32 {
  let diff = p2 - p1;
  if (diff > max / 2) diff -= max;
  else if (diff < -max / 2) diff += max;
  return diff;
}

function updateBoid(index: i32): void {
  const boid = boids[index];

  let sepX: f32 = 0, sepY: f32 = 0;
  let alignX: f32 = 0, alignY: f32 = 0;
  let cohX: f32 = 0, cohY: f32 = 0;
  let sepCount = 0, alignCount = 0, cohCount = 0;

  for (let i = 0; i < boids.length; i++) {
    if (i === index) continue;

    const other = boids[i];
    const dist = getDistance(boid, other);

    if (dist < separationDistance && dist > 0) {
      const dx = getWrappedDiff(other.x, boid.x, canvasWidth);
      const dy = getWrappedDiff(other.y, boid.y, canvasHeight);
      sepX += dx / dist;
      sepY += dy / dist;
      sepCount++;
    }

    if (dist < alignmentDistance) {
      alignX += other.vx;
      alignY += other.vy;
      alignCount++;
    }

    if (dist < cohesionDistance) {
      cohX += other.x;
      cohY += other.y;
      cohCount++;
    }
  }

  if (sepCount > 0) {
    sepX /= sepCount as f32;
    sepY /= sepCount as f32;
    const mag = Mathf.sqrt(sepX * sepX + sepY * sepY);
    if (mag > 0) {
      sepX = (sepX / mag) * maxSpeed;
      sepY = (sepY / mag) * maxSpeed;
      sepX = (sepX - boid.vx) * separationForce;
      sepY = (sepY - boid.vy) * separationForce;
    }
  }

  if (alignCount > 0) {
    alignX /= alignCount as f32;
    alignY /= alignCount as f32;
    const mag = Mathf.sqrt(alignX * alignX + alignY * alignY);
    if (mag > 0) {
      alignX = (alignX / mag) * maxSpeed;
      alignY = (alignY / mag) * maxSpeed;
      alignX = (alignX - boid.vx) * alignmentForce;
      alignY = (alignY - boid.vy) * alignmentForce;
    }
  }

  if (cohCount > 0) {
    cohX /= cohCount as f32;
    cohY /= cohCount as f32;
    cohX = getWrappedDiff(boid.x, cohX, canvasWidth);
    cohY = getWrappedDiff(boid.y, cohY, canvasHeight);
    const mag = Mathf.sqrt(cohX * cohX + cohY * cohY);
    if (mag > 0) {
      cohX = (cohX / mag) * maxSpeed;
      cohY = (cohY / mag) * maxSpeed;
      cohX = (cohX - boid.vx) * cohesionForce;
      cohY = (cohY - boid.vy) * cohesionForce;
    }
  }

  let mouseForceX: f32 = 0, mouseForceY: f32 = 0;
  if (mouseX >= 0 && mouseY >= 0) {
    const mouseDist = Mathf.sqrt(
      (boid.x - mouseX) * (boid.x - mouseX) +
      (boid.y - mouseY) * (boid.y - mouseY)
    );

    if (mouseDist < mouseAvoidDistance && mouseDist > 0) {
      mouseForceX = (boid.x - mouseX) / mouseDist;
      mouseForceY = (boid.y - mouseY) / mouseDist;
      mouseForceX *= mouseAvoidForce;
      mouseForceY *= mouseAvoidForce;
    }
  }

  boid.vx += sepX + alignX + cohX + mouseForceX;
  boid.vy += sepY + alignY + cohY + mouseForceY;

  const speed = Mathf.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
  if (speed > maxSpeed) {
    boid.vx = (boid.vx / speed) * maxSpeed;
    boid.vy = (boid.vy / speed) * maxSpeed;
  }

  boid.x += boid.vx;
  boid.y += boid.vy;

  if (boid.x < 0) boid.x += canvasWidth;
  else if (boid.x >= canvasWidth) boid.x -= canvasWidth;
  if (boid.y < 0) boid.y += canvasHeight;
  else if (boid.y >= canvasHeight) boid.y -= canvasHeight;
}

export function update(): void {
  for (let i = 0; i < boids.length; i++) {
    updateBoid(i);
  }
}

export function getPositions(): Float32Array {
  const positions = new Float32Array(boids.length * 4);
  for (let i = 0; i < boids.length; i++) {
    const boid = boids[i];
    positions[i * 4] = boid.x;
    positions[i * 4 + 1] = boid.y;
    positions[i * 4 + 2] = boid.vx;
    positions[i * 4 + 3] = boid.vy;
  }
  return positions;
}

function abs(x: f32): f32 {
  return x < 0 ? -x : x;
}