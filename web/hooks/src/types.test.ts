import { expect, test } from "vitest"
import type { Boid, SimulationParameters } from "./types"

// シンプルで価値のある型テスト
test("Boid型が正しく定義されている", () => {
  const boid: Boid = {
    id: 1,
    position: { x: 100, y: 200 },
    velocity: { x: 1.5, y: -0.5 },
  }

  expect(boid.id).toBe(1)
  expect(boid.position.x).toBe(100)
  expect(boid.position.y).toBe(200)
  expect(boid.velocity.x).toBe(1.5)
  expect(boid.velocity.y).toBe(-0.5)
})

test("SimulationParameters型が正しく定義されている", () => {
  const params: SimulationParameters = {
    separationRadius: 25,
    separationStrength: 1.5,
    alignmentRadius: 50,
    alignmentStrength: 1.0,
    cohesionRadius: 50,
    cohesionStrength: 1.0,
    mouseAvoidanceDistance: 100,
  }

  // 全ての必要なプロパティが存在することを確認
  expect(typeof params.separationRadius).toBe("number")
  expect(typeof params.separationStrength).toBe("number")
  expect(typeof params.alignmentRadius).toBe("number")
  expect(typeof params.alignmentStrength).toBe("number")
  expect(typeof params.cohesionRadius).toBe("number")
  expect(typeof params.cohesionStrength).toBe("number")
  expect(typeof params.mouseAvoidanceDistance).toBe("number")
})
