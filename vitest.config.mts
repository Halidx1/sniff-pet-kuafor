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
  },
});
