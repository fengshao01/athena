import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Scope Vitest to colocated unit tests under src/. Playwright specs live
    // under tests/*.spec.ts and would otherwise be globbed by the defaults.
    include: ["src/**/*.test.ts"],
    // Integration tests share the .test.ts extension but need a real DB and
    // the integration setupFile — they run via vitest.integration.config.ts.
    exclude: ["**/node_modules/**", "src/**/*.integration.test.ts"],
  },
});
