import type { SimulationParameters } from "@boid-wasm-sim/hooks"
import { fireEvent, render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { Sidebar } from "./Sidebar"

const DEFAULT_PARAMETERS: SimulationParameters = {
  separationRadius: 25,
  separationStrength: 1.5,
  alignmentRadius: 50,
  alignmentStrength: 1.0,
  cohesionRadius: 50,
  cohesionStrength: 1.0,
  mouseAvoidanceDistance: 100,
}

function renderSidebar(overrides: Partial<React.ComponentProps<typeof Sidebar>> = {}) {
  const onBoidCountChange = vi.fn()
  const onPlayPause = vi.fn()
  const onReset = vi.fn()
  const onParameterChange = vi.fn()

  render(
    <Sidebar
      boidCount={100}
      isPlaying={false}
      parameters={DEFAULT_PARAMETERS}
      onBoidCountChange={onBoidCountChange}
      onPlayPause={onPlayPause}
      onReset={onReset}
      onParameterChange={onParameterChange}
      {...overrides}
    />
  )

  return { onBoidCountChange, onPlayPause, onReset, onParameterChange }
}

test("再生ボタンを押すとonPlayPauseが呼ばれる", () => {
  const { onPlayPause } = renderSidebar()

  fireEvent.click(screen.getByRole("button", { name: /再生/ }))

  expect(onPlayPause).toHaveBeenCalledTimes(1)
})

test("再生中は停止ボタンが表示され、押すとonPlayPauseが呼ばれる", () => {
  const { onPlayPause } = renderSidebar({ isPlaying: true })

  fireEvent.click(screen.getByRole("button", { name: /停止/ }))

  expect(onPlayPause).toHaveBeenCalledTimes(1)
})

test("リセットボタンを押すとonResetが呼ばれる", () => {
  const { onReset } = renderSidebar()

  fireEvent.click(screen.getByRole("button", { name: /リセット/ }))

  expect(onReset).toHaveBeenCalledTimes(1)
})

test("各パラメータの現在値がラベル横に表示される", () => {
  renderSidebar({
    parameters: { ...DEFAULT_PARAMETERS, separationRadius: 40, cohesionStrength: 2.2 },
  })

  expect(screen.getByText("40")).toBeInTheDocument()
  expect(screen.getByText("2.2")).toBeInTheDocument()
})

test("分離半径のスライダーを右矢印キーで操作するとonParameterChangeが呼ばれる", () => {
  const { onParameterChange } = renderSidebar()

  // 分離行動セクション内の最初のスライダー(半径)
  const sliders = screen.getAllByRole("slider")
  const separationRadiusSlider = sliders[0]

  separationRadiusSlider.focus()
  fireEvent.keyDown(separationRadiusSlider, { key: "ArrowRight" })

  expect(onParameterChange).toHaveBeenCalledWith("separationRadius", 30)
})
