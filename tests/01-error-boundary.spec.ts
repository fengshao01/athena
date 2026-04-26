import { expect, test } from "@playwright/test";

test("error.tsx catches uncaught Server Component throws", async ({ page }) => {
  await page.goto("/test-error");
  await expect(page.locator("body")).toContainText(/something went wrong/i);
  await expect(page.getByRole("button", { name: /try again/i })).toBeAttached();
});
