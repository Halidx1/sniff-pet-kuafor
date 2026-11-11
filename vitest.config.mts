import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Local Supabase keys for integration tests (CI sets them as real env vars).
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    // Integration tests talk to the local Supabase stack (`npm run db:start`).
    include: ["src/**/*.test.{ts,tsx}", "tests/integration/**/*.test.ts"],
    // Definition of Done: pure rules in shared/lib and modules/*/domain stay ≥ 90 % covered.
    coverage: {
      provider: "v8",
      include: ["src/shared/lib/**/*.ts", "src/modules/*/domain/**/*.ts"],
      exclude: ["**/*.test.ts"],
      thresholds: { lines: 90 },
      reporter: ["text-summary", "text"],
    },
  },
});
