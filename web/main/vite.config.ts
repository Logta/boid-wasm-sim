import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { copyFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    react(),
    {
      name: "copy-wasm",
      buildStart() {
        // WASMファイルをpublicディレクトリにコピー
        const wasmSrc = join(__dirname, "../../wasm/build/boid.wasm")
        const wasmDest = join(__dirname, "public/build")
        
        if (!existsSync(wasmDest)) {
          mkdirSync(wasmDest, { recursive: true })
        }
        
        if (existsSync(wasmSrc)) {
          copyFileSync(wasmSrc, join(wasmDest, "boid.wasm"))
          console.log("✓ Copied WASM file to public/build/")
        } else {
          console.warn("⚠ WASM file not found. Run 'pnpm wasm:build' first.")
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
})