import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Header } from "./Header"

describe("Header", () => {
  it("アプリケーションタイトルが表示される", () => {
    render(<Header />)
    expect(screen.getByText("Boid WASM Simulation")).toBeInTheDocument()
  })

  it("ヘッダー要素として表示される", () => {
    render(<Header />)
    expect(screen.getByRole("banner")).toBeInTheDocument()
  })
})