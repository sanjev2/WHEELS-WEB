// jest.globals.cjs
const { TextEncoder, TextDecoder } = require("util")
const web = require("stream/web")

// Make sure ALL global targets have it
global.TextEncoder = global.TextEncoder || TextEncoder
global.TextDecoder = global.TextDecoder || TextDecoder

globalThis.TextEncoder = globalThis.TextEncoder || TextEncoder
globalThis.TextDecoder = globalThis.TextDecoder || TextDecoder

// jsdom provides window; set it too
if (typeof window !== "undefined") {
  window.TextEncoder = window.TextEncoder || TextEncoder
  window.TextDecoder = window.TextDecoder || TextDecoder
}

// Streams (MSW sometimes expects these too)
globalThis.TransformStream = globalThis.TransformStream || web.TransformStream
globalThis.ReadableStream = globalThis.ReadableStream || web.ReadableStream
globalThis.WritableStream = globalThis.WritableStream || web.WritableStream