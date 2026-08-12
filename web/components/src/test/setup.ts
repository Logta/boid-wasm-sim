import "@testing-library/jest-dom"

// jsdomはResizeObserverを実装していないが、Radix UI(Slider/Select等)は
// サイズ計測のために内部で利用しているため、テスト用の最小スタブを用意する。
function ResizeObserverStub() {
  return {
    observe() {
      // テストではサイズ計測結果を使わないため何もしない
    },
    unobserve() {
      // テストではサイズ計測結果を使わないため何もしない
    },
    disconnect() {
      // テストではサイズ計測結果を使わないため何もしない
    },
  }
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}
