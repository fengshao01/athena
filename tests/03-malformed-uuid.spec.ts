import { expect, test } from "@playwright/test";

test("malformed note UUID renders not-found, not error boundary", async ({
  page,
}) => {
  await page.goto("/notes/abc");
  await expect(page.locator("body")).toContainText(/note not found/i);
  await expect(page.locator("body")).not.toContainText(/something went wrong/i);
});

test("syntactically valid but unknown UUID also renders not-found", async ({
  page,
}) => {
  await page.goto("/notes/00000000-0000-0000-0000-000000000000");
  await expect(page.locator("body")).toContainText(/note not found/i);
});
