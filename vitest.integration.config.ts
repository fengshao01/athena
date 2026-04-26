import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["src/**/*.integration.test.ts"],
    setupFiles: ["./src/test/integration-setup.ts"],
    // Migrations + Neon network round-trips can be slow on a cold branch.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
