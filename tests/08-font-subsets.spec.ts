import { expect, test } from "@playwright/test";

test("Geist fonts include Cyrillic and Latin-Extended subsets", async ({
  page,
}) => {
  await page.goto("/notes");
  await page.evaluate(() => document.fonts.ready);

  const ranges = await page.evaluate(() =>
    Array.from(document.fonts).map((f) => f.unicodeRange ?? ""),
  );

  // Cyrillic block declaration covers U+400-45F (no leading zeros in
  // Google Fonts' served CSS).
  const hasCyrillic = ranges.some((r) => /U\+400-45F/i.test(r));
  expect(hasCyrillic).toBe(true);

  // Latin-Extended block starts at U+100.
  const hasLatinExt = ranges.some((r) => /U\+100-2BA/i.test(r));
  expect(hasLatinExt).toBe(true);
});
