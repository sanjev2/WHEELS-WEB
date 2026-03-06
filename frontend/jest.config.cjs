// jest.config.cjs

// ✅ Define globals BEFORE loading Next/Jest
const util = require("util")
globalThis.TextEncoder = globalThis.TextEncoder || util.TextEncoder
globalThis.TextDecoder = globalThis.TextDecoder || util.TextDecoder

const web = require("stream/web")
globalThis.TransformStream = globalThis.TransformStream || web.TransformStream
globalThis.ReadableStream = globalThis.ReadableStream || web.ReadableStream
globalThis.WritableStream = globalThis.WritableStream || web.WritableStream

const nextJest = require("next/jest.js")
const createJestConfig = nextJest({ dir: "./" })

const customJestConfig = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons", "default"],
  },

  setupFiles: [
  "<rootDir>/jest.globals.cjs",
  "<rootDir>/app/_tests_/polyfills.ts",
],
  setupFilesAfterEnv: ["<rootDir>/app/_tests_/setup.ts"],

  testMatch: [
    "<rootDir>/app/_tests_/unit/**/*.test.(ts|tsx)",
    "<rootDir>/app/_tests_/integration/**/*.test.(ts|tsx)",
  ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^.+\\.(css|scss|sass)$": "identity-obj-proxy",
  },

  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
    "^.+\\.mjs$": ["@swc/jest"],
  },

  transformIgnorePatterns: [
    "/node_modules/(?!(msw|@mswjs|@bundled-es-modules|until-async)/)",
  ],
}

module.exports = createJestConfig(customJestConfig)