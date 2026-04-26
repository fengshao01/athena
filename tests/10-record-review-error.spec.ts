import { expect, test } from "@playwright/test";

test("recordReview failure shows an error toast", async ({ page }) => {
  // Intercept the Server Action POST (which goes to the page URL itself
  // in App Router) and return a 500 so the .catch() branch fires.
  await page.route("**/test-practice*", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 500,
        headers: { "content-type": "text/plain" },
        body: "Server error",
      });
    } else {
      await route.continue();
    }
  });

  await page.goto("/test-practice");
  await page.getByRole("button", { name: /^got it$/i }).click();

  await expect(page.getByText(/couldn't save rating/i)).toBeVisible();
});
