import { expect, test } from "@playwright/test";

test("Regenerate confirm dialog uses the destructive button variant", async ({
  page,
}) => {
  await page.goto("/test-with-cards");
  await page.getByRole("button", { name: /regenerate flashcards/i }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const regenerateBtn = dialog.getByRole("button", { name: /^regenerate$/i });
  await expect(regenerateBtn).toBeVisible();
  // shadcn's destructive variant applies a text-destructive class.
  await expect(regenerateBtn).toHaveClass(/text-destructive/);
});
