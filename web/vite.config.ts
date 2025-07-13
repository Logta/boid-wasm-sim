import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
    headers: {
      '*.wasm': 'application/wasm',
    },
  },
  assetsInclude: ['**/*.wasm'],
  build: {
    rollupOptions: {
      external: [],
    },
  },
})