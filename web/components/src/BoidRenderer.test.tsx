import type { Boid } from "@boid-wasm-sim/hooks"
import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, test, vi } from "vitest"
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

type Call = [method: string, ...args: unknown[]]

/** jsdomはCanvas 2Dを実装していないため、呼び出しを記録するだけのコンテキストを差し込む */
function stubCanvasContexts() {
  const contexts = new Map<HTMLCanvasElement, { calls: Call[] }>()
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (
    this: HTMLCanvasElement
  ) {
    let ctx = contexts.get(this)
    if (!ctx) {
      const calls: Call[] = []
      ctx = new Proxy(
        { calls },
        {
          get(target, prop) {
            if (prop === "calls") return target.calls
            if (prop === "createLinearGradient") {
              return (...args: unknown[]) => {
                calls.push(["createLinearGradient", ...args])
                return { addColorStop: () => undefined }
              }
            }
            return (...args: unknown[]) => {
              calls.push([String(prop), ...args])
            }
          },
          set(target, prop, value) {
            target.calls.push([`set:${String(prop)}`, value])
            return true
          },
        }
      ) as { calls: Call[] }
      contexts.set(this, ctx)
    }
    return ctx as unknown as CanvasRenderingContext2D
  } as typeof HTMLCanvasElement.prototype.getContext)
  return contexts
}

function callsOf(calls: Call[], method: string) {
  return calls.filter(([name]) => name === method).map(([, ...args]) => args)
}

afterEach(() => {
  vi.restoreAllMocks()
})

test("背景キャンバスにグラデーションと50px間隔の格子を描く", () => {
  const contexts = stubCanvasContexts()

  renderBoidRenderer({ width: 100, height: 50 })

  const background = screen
    .getByRole("img", { name: "ボイドシミュレーションキャンバス" })
    .parentElement?.querySelector<HTMLCanvasElement>('canvas[style*="display: none"]')
  if (!background) throw new Error("background canvas not found")
  const calls = contexts.get(background)?.calls ?? []

  expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith("2d")
  expect(callsOf(calls, "createLinearGradient")).toEqual([[0, 0, 100, 50]])
  expect(callsOf(calls, "fillRect")).toEqual([[0, 0, 100, 50]])
  // 縦線 x=0,50,100 と横線 y=0,50（幅・高さちょうども含む）を1つのパスで描く
  expect(callsOf(calls, "beginPath")).toHaveLength(1)
  expect(callsOf(calls, "moveTo")).toEqual([
    [0, 0],
    [50, 0],
    [100, 0],
    [0, 0],
    [0, 50],
  ])
  expect(callsOf(calls, "lineTo")).toEqual([
    [0, 50],
    [50, 50],
    [100, 50],
    [100, 0],
    [100, 50],
  ])
  expect(callsOf(calls, "stroke")).toHaveLength(1)
})

test("各boidを位置へ移動し進行方向へ回転した三角形として描き、グラデーションは使い回す", () => {
  const contexts = stubCanvasContexts()
  const boids: Boid[] = [
    { id: 0, position: { x: 10, y: 20 }, velocity: { x: 0, y: 1 } },
    { id: 1, position: { x: 30, y: 40 }, velocity: { x: -1, y: 0 } },
  ]

  renderBoidRenderer({ width: 100, height: 60, boids })

  const canvas = screen.getByRole("img", { name: "ボイドシミュレーションキャンバス" })
  const calls = contexts.get(canvas as HTMLCanvasElement)?.calls ?? []

  expect(callsOf(calls, "clearRect")).toEqual([[0, 0, 100, 60]])
  expect(callsOf(calls, "drawImage")).toEqual([[expect.any(HTMLCanvasElement), 0, 0]])
  expect(callsOf(calls, "translate")).toEqual([
    [10, 20],
    [30, 40],
  ])
  expect(callsOf(calls, "rotate")).toEqual([[Math.PI / 2], [Math.PI]])
  expect(callsOf(calls, "moveTo")).toEqual([
    [6, 0],
    [6, 0],
  ])
  expect(callsOf(calls, "lineTo")).toEqual([
    [-3, -3],
    [-3, 3],
    [-3, -3],
    [-3, 3],
  ])
  expect(callsOf(calls, "beginPath")).toHaveLength(2)
  expect(callsOf(calls, "closePath")).toHaveLength(2)
  expect(callsOf(calls, "save")).toHaveLength(2)
  expect(callsOf(calls, "restore")).toHaveLength(2)
  expect(callsOf(calls, "fill")).toHaveLength(2)
  expect(callsOf(calls, "stroke")).toHaveLength(2)
  // グラデーションは初回のboid描画時に一度だけ作る
  expect(callsOf(calls, "createLinearGradient")).toEqual([[-6, -6, 6, 6]])
})

test("boidsやサイズが変わると描き直す", () => {
  const contexts = stubCanvasContexts()
  const onMouseMove = vi.fn()
  const first: Boid[] = [{ id: 0, position: { x: 1, y: 2 }, velocity: { x: 1, y: 0 } }]
  const second: Boid[] = [{ id: 0, position: { x: 3, y: 4 }, velocity: { x: 1, y: 0 } }]

  const { rerender } = render(
    <BoidRenderer width={100} height={50} boids={first} fps={60} onMouseMove={onMouseMove} />
  )
  rerender(
    <BoidRenderer width={200} height={50} boids={second} fps={60} onMouseMove={onMouseMove} />
  )

  const canvas = screen.getByRole("img", { name: "ボイドシミュレーションキャンバス" })
  const background = canvas.parentElement?.querySelector<HTMLCanvasElement>(
    'canvas[style*="display: none"]'
  )
  if (!background) throw new Error("background canvas not found")
  const calls = contexts.get(canvas as HTMLCanvasElement)?.calls ?? []
  const backgroundCalls = contexts.get(background)?.calls ?? []

  expect(callsOf(calls, "translate")).toEqual([
    [1, 2],
    [3, 4],
  ])
  expect(callsOf(backgroundCalls, "fillRect")).toEqual([
    [0, 0, 100, 50],
    [0, 0, 200, 50],
  ])
})
