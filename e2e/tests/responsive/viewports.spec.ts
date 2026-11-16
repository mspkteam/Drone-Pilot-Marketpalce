import { test, expect } from "../../fixtures/test";
import { RESPONSIVE_VIEWPORTS } from "../../data/accounts";
import { withStep } from "../../helpers/logger";
import { assertNoAppCrash } from "../../helpers/assertions";

const PATHS = ["/", "/pilots", "/jobs", "/login", "/pricing"] as const;

test.describe("Responsive viewports @responsive @functional", () => {
  // Run on chromium project primarily; other projects also execute but viewport override applies.
  for (const vp of RESPONSIVE_VIEWPORTS) {
    test(`marketing pages usable at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const path of PATHS) {
        await withStep(`${vp.name} → ${path}`, async () => {
          const res = await page.goto(path, { waitUntil: "domcontentloaded" });
          expect(res!.status()).toBeLessThan(500);
          await assertNoAppCrash(page);
          // Horizontal overflow soft-check
          const overflow = await page.evaluate(() => {
            const doc = document.documentElement;
            return {
              scrollWidth: doc.scrollWidth,
              clientWidth: doc.clientWidth,
            };
          });
          // Allow small scrollbar / sub-pixel tolerance
          expect(
            overflow.scrollWidth - overflow.clientWidth,
            `horizontal overflow on ${path} @ ${vp.name}`,
          ).toBeLessThan(40);
        });
      }
    });
  }
});
