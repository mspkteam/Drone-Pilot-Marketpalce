import { test, expect } from "../../fixtures/test";
import { PUBLIC_MARKETING_PATHS } from "../../data/accounts";
import { withStep } from "../../helpers/logger";
import { assertNoAppCrash } from "../../helpers/assertions";

test.describe("Marketing & public routes @smoke", () => {
  for (const path of PUBLIC_MARKETING_PATHS) {
    test(`public path ${path} loads`, async ({ page }) => {
      await withStep(`Navigate ${path}`, async () => {
        const res = await page.goto(path, { waitUntil: "domcontentloaded" });
        expect(res, `response for ${path}`).toBeTruthy();
        expect(res!.status(), `status for ${path}`).toBeLessThan(500);
      });

      await withStep(`Assert body content on ${path}`, async () => {
        await assertNoAppCrash(page);
        const text = (await page.locator("body").innerText()).trim();
        expect(text.length, `empty body on ${path}`).toBeGreaterThan(20);
      });
    });
  }
});
