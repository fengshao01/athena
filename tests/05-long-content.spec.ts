import { expect, test } from "@playwright/test";

test("long title doesn't push the page wider than the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto("/test-long-note");
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  // Allow a 1px tolerance for browser rendering quirks.
  expect(scrollWidth).toBeLessThanOrEqual(801);
});

test("long body shows a Show more toggle that expands the body", async ({
  page,
}) => {
  await page.goto("/test-long-note");
  const showMore = page.getByRole("button", { name: /show more/i });
  await expect(showMore).toBeVisible();
  await showMore.click();
  await expect(
    page.getByRole("button", { name: /show less/i }),
  ).toBeVisible();
});
