import "@testing-library/jest-dom"
import { vi } from "vitest"

// Canvas2D context の完全なモック
const mockCanvas2DContext = {
  // Transform methods
  save: vi.fn(),
  restore: vi.fn(),
  reset: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  
  // Drawing methods
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  
  // Path methods
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  arcTo: vi.fn(),
  ellipse: vi.fn(),
  rect: vi.fn(),
  bezierCurveTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  
  // Fill and stroke
  fill: vi.fn(),
  stroke: vi.fn(),
  clip: vi.fn(),
  
  // Text
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn(() => ({ width: 0, height: 0 })),
  
  // Image data
  createImageData: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  
  // Gradients and patterns
  createLinearGradient: vi.fn(),
  createRadialGradient: vi.fn(),
  createPattern: vi.fn(),
  
  // Properties
  fillStyle: "#000000",
  strokeStyle: "#000000",
  lineWidth: 1,
  lineCap: "butt",
  lineJoin: "miter",
  miterLimit: 10,
  lineDashOffset: 0,
  font: "10px sans-serif",
  textAlign: "start",
  textBaseline: "alphabetic",
  direction: "inherit",
  globalAlpha: 1,
  globalCompositeOperation: "source-over",
  imageSmoothingEnabled: true,
  imageSmoothingQuality: "low",
  shadowBlur: 0,
  shadowColor: "rgba(0, 0, 0, 0)",
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  
  // Additional methods
  isPointInPath: vi.fn(() => false),
  isPointInStroke: vi.fn(() => false),
  drawImage: vi.fn(),
  setLineDash: vi.fn(),
  getLineDash: vi.fn(() => []),
  
  // Canvas reference
  canvas: {
    width: 800,
    height: 600,
  }
}

// HTMLCanvasElement のモック
HTMLCanvasElement.prototype.getContext = vi.fn((contextId) => {
  if (contextId === "2d") {
    return mockCanvas2DContext
  }
  return null
})

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,")
HTMLCanvasElement.prototype.toBlob = vi.fn()

// Canvas constructor のモック
global.HTMLCanvasElement = HTMLCanvasElement

// OffscreenCanvas のモック（必要に応じて）
global.OffscreenCanvas = vi.fn().mockImplementation(() => ({
  getContext: vi.fn(() => mockCanvas2DContext),
  convertToBlob: vi.fn(),
  transferToImageBitmap: vi.fn(),
  width: 800,
  height: 600,
}))

// WebAssembly のモック
global.WebAssembly = {
  ...global.WebAssembly,
  instantiate: vi.fn(),
  instantiateStreaming: vi.fn(),
}