import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { expect, test } from "@playwright/test";
import { notes } from "../src/db/schema";

// This spec writes a real row to the database. Load .env.local and use the
// same DATABASE_URL the dev server uses, then clean up the row in afterEach.
config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema: { notes } });

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

let createdId: string | null = null;

test.afterEach(async () => {
  if (createdId) {
    await db.delete(notes).where(eq(notes.id, createdId));
    createdId = null;
  }
});

test("create a new note end-to-end: form → save → detail → list", async ({
  page,
}) => {
  // Unique title so the list assertion can locate this exact row.
  const title = `E2E test ${crypto.randomUUID()}`;
  const body = "Body content for the create-note e2e test.";

  // 1. Land on /notes and click into the New note form.
  await page.goto("/notes");
  await page.getByRole("link", { name: /new note/i }).click();
  await expect(page).toHaveURL(/\/notes\/new$/);

  // 2. Fill the form and submit.
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Body").fill(body);
  await page.getByRole("button", { name: /^save$/i }).click();

  // 3. Redirect to /notes/[id]. Capture the id for cleanup.
  await page.waitForURL(new RegExp(`/notes/${UUID_RE.source}$`, "i"));
  const match = page.url().match(/\/notes\/([0-9a-f-]+)$/i);
  expect(match).not.toBeNull();
  createdId = match![1];

  // 4. The detail page shows the title and body we just typed.
  await expect(
    page.getByRole("heading", { level: 1, name: title }),
  ).toBeVisible();
  await expect(page.locator("body")).toContainText(body);

  // 5. Navigate back to /notes.
  await page.getByRole("link", { name: /notes/i }).first().click();
  await expect(page).toHaveURL(/\/notes$/);

  // 6. The new note appears in the list under its title.
  await expect(page.getByRole("link", { name: new RegExp(title) })).toBeVisible();
});
