import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["lib/storage.ts", "lib/useCombos.ts"],
      thresholds: { lines: 95, functions: 95, statements: 95, branches: 90 }
    }
  },
  resolve: {
    alias: { "~": path.resolve(__dirname, ".") }
  }
})
