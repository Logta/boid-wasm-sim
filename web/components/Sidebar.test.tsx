import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Sidebar } from "./Sidebar"

describe("Sidebar", () => {
  it("サイドバーが表示される", () => {
    render(<Sidebar />)
    expect(screen.getByRole("complementary")).toBeInTheDocument()
  })

  it("コントロールタイトルが表示される", () => {
    render(<Sidebar />)
    expect(screen.getByText("Controls")).toBeInTheDocument()
  })

  it("boid数セレクターが表示される", () => {
    render(<Sidebar />)
    expect(screen.getByText("Boid Count")).toBeInTheDocument()
  })

  it("パラメータ調整セクションが表示される", () => {
    render(<Sidebar />)
    expect(screen.getByText("Parameters")).toBeInTheDocument()
  })

  it("制御ボタンセクションが表示される", () => {
    render(<Sidebar />)
    expect(screen.getByText("Simulation Control")).toBeInTheDocument()
  })
})