import { expect, test } from "@playwright/test";

test("Generate posts to /api/flashcards/generate and shows a Stop button while streaming", async ({
  page,
}) => {
  let received: { url: string; method: string } | null = null;

  await page.route("**/api/flashcards/generate", async (route) => {
    received = {
      url: route.request().url(),
      method: route.request().method(),
    };
    // Hold the response open for a few seconds so we can observe the
    // "streaming" UI state (Stop button visible). Then resolve with a
    // valid (non-streaming, but useObject tolerates a single chunk)
    // response so the client can finish cleanly.
    await new Promise((r) => setTimeout(r, 2500));
    await route.fulfill({
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
      body: '{"cards":[{"front":"Q","back":"A"}]}',
    });
  });

  await page.goto("/test-long-note");
  await page.getByRole("button", { name: /^generate flashcards$/i }).click();

  // While the route is held open, the Stop button should appear.
  await expect(page.getByRole("button", { name: /stop/i })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /generating/i }),
  ).toBeVisible();

  // And the request was actually a POST to the streaming route.
  await expect.poll(() => received).not.toBeNull();
  expect(received!.method).toBe("POST");
});
