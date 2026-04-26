import { expect, test } from "@playwright/test";

test("notes list page loads", async ({ page }) => {
  await page.goto("/notes");
  await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
  await expect(page.getByRole("link", { name: /new note/i })).toBeVisible();
});

test("/ redirects to /notes", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/notes$/);
});
