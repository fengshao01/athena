import { expect, test } from "@playwright/test";

test('"New note" affordance is rendered as a shadcn Button', async ({
  page,
}) => {
  await page.goto("/notes");
  const newNote = page.getByRole("link", { name: /new note/i });
  await expect(newNote).toBeVisible();
  await expect(newNote).toHaveAttribute("data-slot", "button");
});

test("/notes uses semantic color tokens, not raw zinc-* classes", async ({
  page,
}) => {
  await page.goto("/notes");
  // The page HTML should not contain raw zinc-* classes; everything should
  // route through the semantic tokens (muted, border, primary, etc.).
  const html = await page.content();
  expect(html).not.toMatch(/\btext-zinc-\d+/);
  expect(html).not.toMatch(/\bdivide-zinc-\d+/);
  expect(html).not.toMatch(/\bhover:bg-zinc-\d+/);
});

test("/notes/new uses semantic color tokens, not raw zinc-* classes", async ({
  page,
}) => {
  await page.goto("/notes/new");
  const html = await page.content();
  expect(html).not.toMatch(/\btext-zinc-\d+/);
});
