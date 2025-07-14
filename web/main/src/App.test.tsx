import { render, screen } from "@testing-library/react"
import { expect, test } from "vitest"
import { App } from "./App"

// シンプルな統合テスト（t-wadaのTDD原則に従った価値のあるテスト）
test("アプリケーションが正常に起動する", () => {
  render(<App />)

  // 最低限の要素が存在することを確認
  expect(screen.getByText("WASMモジュール読み込み中...")).toBeInTheDocument()
})
