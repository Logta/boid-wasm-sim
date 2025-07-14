import { defineConfig } from "vite"
import { resolve } from "path"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "@boid-wasm-sim/hooks",
      fileName: "index"
    },
    rollupOptions: {
      external: ["react"],
      output: {
        globals: {
          react: "React"
        }
      }
    }
  }
})