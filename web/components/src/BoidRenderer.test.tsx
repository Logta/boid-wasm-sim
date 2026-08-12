import type { Boid } from "@boid-wasm-sim/hooks"
import { fireEvent, render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { BoidRenderer } from "./BoidRenderer"

function renderBoidRenderer(overrides: Partial<React.ComponentProps<typeof BoidRenderer>> = {}) {
  const onMouseMove = vi.fn()
  const boids: Boid[] = []

  render(
    <BoidRenderer
      width={800}
      height={600}
      boids={boids}
      fps={60}
      onMouseMove={onMouseMove}
      {...overrides}
    />
  )

  return { onMouseMove }
}

test("キャンバス上でマウスを動かすと、キャンバス左上を原点とした座標がonMouseMoveに渡される", () => {
  const { onMouseMove } = renderBoidRenderer()

  const canvas = screen.getByRole("img", { name: "ボイドシミュレーションキャンバス" })
  // jsdomのgetBoundingClientRectは既定で全て0を返すため、
  // キャンバスがページ内で(10, 20)の位置にあるものとしてスタブする
  canvas.getBoundingClientRect = () =>
    ({
      left: 10,
      top: 20,
      right: 810,
      bottom: 620,
      width: 800,
      height: 600,
      x: 10,
      y: 20,
      toJSON() {
        return this
      },
    }) as DOMRect

  fireEvent.mouseMove(canvas, { clientX: 110, clientY: 220 })

  expect(onMouseMove).toHaveBeenCalledWith(100, 200)
})

test("fpsとboid数がオーバーレイに表示される", () => {
  const boids: Boid[] = [
    { id: 0, position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } },
    { id: 1, position: { x: 1, y: 1 }, velocity: { x: 0, y: 0 } },
  ]

  renderBoidRenderer({ fps: 42, boids })

  expect(screen.getByText("FPS: 42")).toBeInTheDocument()
  expect(screen.getByText("ボイド: 2匹")).toBeInTheDocument()
})
