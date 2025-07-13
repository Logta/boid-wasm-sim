import { 
  Vector2,
  createVector2,
  addVector2,
  subtractVector2,
  multiplyVector2,
  divideVector2,
  magnitudeVector2,
  normalizeVector2,
  distanceVector2,
  limitVector2
} from "../types"

describe("Vector2", () => {
  it("should create vector with default values", () => {
    const v = createVector2()
    expect(v.x).toBe(0.0)
    expect(v.y).toBe(0.0)
  })

  it("should create vector with specified values", () => {
    const v = createVector2(3.0, 4.0)
    expect(v.x).toBe(3.0)
    expect(v.y).toBe(4.0)
  })

  it("should add two vectors correctly", () => {
    const v1 = createVector2(1.0, 2.0)
    const v2 = createVector2(3.0, 4.0)
    const result = addVector2(v1, v2)
    expect(result.x).toBe(4.0)
    expect(result.y).toBe(6.0)
  })

  it("should subtract two vectors correctly", () => {
    const v1 = createVector2(5.0, 7.0)
    const v2 = createVector2(2.0, 3.0)
    const result = subtractVector2(v1, v2)
    expect(result.x).toBe(3.0)
    expect(result.y).toBe(4.0)
  })

  it("should multiply vector by scalar correctly", () => {
    const v = createVector2(2.0, 3.0)
    const result = multiplyVector2(v, 2.0)
    expect(result.x).toBe(4.0)
    expect(result.y).toBe(6.0)
  })

  it("should divide vector by scalar correctly", () => {
    const v = createVector2(6.0, 8.0)
    const result = divideVector2(v, 2.0)
    expect(result.x).toBe(3.0)
    expect(result.y).toBe(4.0)
  })

  it("should handle division by zero", () => {
    const v = createVector2(6.0, 8.0)
    const result = divideVector2(v, 0.0)
    expect(result.x).toBe(0.0)
    expect(result.y).toBe(0.0)
  })

  it("should calculate magnitude correctly", () => {
    const v = createVector2(3.0, 4.0)
    const magnitude = magnitudeVector2(v)
    expect(magnitude).toBe(5.0)
  })

  it("should normalize vector correctly", () => {
    const v = createVector2(3.0, 4.0)
    const normalized = normalizeVector2(v)
    expect(normalized.x).toBeCloseTo(0.6)
    expect(normalized.y).toBeCloseTo(0.8)
  })

  it("should handle zero vector normalization", () => {
    const v = createVector2(0.0, 0.0)
    const normalized = normalizeVector2(v)
    expect(normalized.x).toBe(0.0)
    expect(normalized.y).toBe(0.0)
  })

  it("should calculate distance correctly", () => {
    const v1 = createVector2(0.0, 0.0)
    const v2 = createVector2(3.0, 4.0)
    const distance = distanceVector2(v1, v2)
    expect(distance).toBe(5.0)
  })

  it("should limit vector magnitude correctly", () => {
    const v = createVector2(6.0, 8.0) // magnitude 10
    const limited = limitVector2(v, 5.0)
    const magnitude = magnitudeVector2(limited)
    expect(magnitude).toBeCloseTo(5.0)
  })

  it("should not modify vector if under limit", () => {
    const v = createVector2(2.0, 3.0) // magnitude ~3.6
    const limited = limitVector2(v, 5.0)
    expect(limited.x).toBe(2.0)
    expect(limited.y).toBe(3.0)
  })
})