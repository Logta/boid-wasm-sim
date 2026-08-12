import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    // useBoidWasm/useSimulationはDOM(fetch/document/window)に依存するためjsdomが必要
    environment: "jsdom",
    // useBoidWasmが動的に注入する<script>を実行できるようにする
    environmentOptions: {
      jsdom: {
        runScripts: "dangerously",
      },
    },
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
})
