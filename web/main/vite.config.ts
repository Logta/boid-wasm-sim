import { copyFileSync, existsSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    react(),
    {
      name: "copy-wasm",
      buildStart() {
        // WASMファイルをpublicディレクトリにコピー
        const wasmSrc = join(__dirname, "../../wasm/boid.wasm")
        const wasmExecSrc = join(__dirname, "../../wasm/wasm_exec.js")
        const publicDir = join(__dirname, "public")

        // WASMファイルをコピー
        if (existsSync(wasmSrc)) {
          copyFileSync(wasmSrc, join(publicDir, "boid.wasm"))
          console.log("✓ Copied WASM file to public/")
        } else {
          console.warn("⚠ WASM file not found. Run 'pnpm wasm:build' first.")
        }

        // wasm_exec.jsをコピー
        if (existsSync(wasmExecSrc)) {
          copyFileSync(wasmExecSrc, join(publicDir, "wasm_exec.js"))
          console.log("✓ Copied wasm_exec.js to public/")
        } else {
          console.warn("⚠ wasm_exec.js not found.")
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
})
