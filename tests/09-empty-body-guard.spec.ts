import { expect, test } from "@playwright/test";

test("Generate on an empty-body note shows an error toast and does not call the API", async ({
  page,
}) => {
  let routeWasCalled = false;
  await page.route("**/api/flashcards/generate", async (route) => {
    routeWasCalled = true;
    await route.fulfill({ status: 200, body: '{"cards":[]}' });
  });

  await page.goto("/test-empty-body");
  await page.getByRole("button", { name: /^generate flashcards$/i }).click();

  // The toast should appear with the expected message.
  await expect(page.getByText(/add some content/i)).toBeVisible();

  // The button should NOT have entered streaming state (no Stop visible).
  await expect(page.getByRole("button", { name: /stop/i })).toHaveCount(0);

  // And the API was never called — short-circuited on the client.
  expect(routeWasCalled).toBe(false);
});
