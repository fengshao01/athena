import { expect, test } from "@playwright/test";

test("notes/[id] loading.tsx renders skeleton scaffold", async ({ page }) => {
  await page.goto("/test-loading");
  const skeletons = page.locator('[data-slot="skeleton"]');
  await expect(skeletons.first()).toBeVisible();
  // Title + body lines + action buttons + chat header + chat bubbles → ≥ 8.
  expect(await skeletons.count()).toBeGreaterThanOrEqual(8);
});
