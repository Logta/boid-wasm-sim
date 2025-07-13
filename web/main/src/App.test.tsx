import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { App } from "./App"

describe("App", () => {
  it("アプリケーションのタイトルが表示される", () => {
    render(<App />)
    expect(screen.getByText("Boid WASM Simulation")).toBeInTheDocument()
  })

  it("Canvas要素が表示される", () => {
    render(<App />)
    expect(screen.getByRole("img", { name: /simulation canvas/i })).toBeInTheDocument()
  })

  it("サイドバーが表示される", () => {
    render(<App />)
    expect(screen.getByRole("complementary")).toBeInTheDocument()
  })
})