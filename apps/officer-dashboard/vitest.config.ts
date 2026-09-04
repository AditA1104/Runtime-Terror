import path from "node:path"
import { defineConfig } from "vitest/config"

/**
 * Unit tests for the pure logic in src/lib. Scoped to `src/**` on purpose so
 * the Playwright specs in e2e/ — which share the .spec.ts suffix — are never
 * picked up by the wrong runner.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
})
