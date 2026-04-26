import { config } from "dotenv";
import { vi } from "vitest";

config({ path: ".env.local" });

if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    "TEST_DATABASE_URL must be set for integration tests. " +
      "Create a Neon branch off your main DB and put its connection string " +
      "in .env.local as TEST_DATABASE_URL.",
  );
}

if (process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
  throw new Error(
    "TEST_DATABASE_URL must point to a different database than DATABASE_URL. " +
      "Refusing to run integration tests against the production DB.",
  );
}

// Redirect the db module to the test branch. This must happen before any
// import of @/db elsewhere in the test process, which is why it lives in
// a setupFile rather than in each spec.
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

// Server actions call revalidatePath(), which requires a Next.js request
// context. Outside Next (i.e. under Vitest) it throws — stub it out so the
// action under test can be exercised in isolation.
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
