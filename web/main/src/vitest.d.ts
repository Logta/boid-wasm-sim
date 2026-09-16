import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers"

// @testing-library/jest-dom 7.0.1 の型拡張は vitest 4 の Assertion を前提としており、
// vitest 5 では型引数が変わって適用されないため、Matchers 経由で拡張する。
declare module "vitest" {
  interface Matchers<T = unknown> extends TestingLibraryMatchers<T, void> {}
}
