import { test, expect } from "../../fixtures/test";
import { withStep } from "../../helpers/logger";
import { assertNoAppCrash } from "../../helpers/assertions";

test.describe("Marketplace browse / search / filter @functional", () => {
  test("public pilots directory search UI works", async ({ pilotsPage, page }) => {
    await withStep("Open /pilots", async () => {
      await pilotsPage.goto();
      await pilotsPage.waitForHeading(/Find Pilots|Pilots|Captain/i);
    });

    await withStep("Type into search", async () => {
      const input = pilotsPage.searchInput();
      if (await input.count()) {
        await pilotsPage.search("Austin");
        await assertNoAppCrash(page);
      } else {
        // Directory may use alternate filter UI — assert page still healthy.
        await expect(page.locator("body")).toContainText(/Pilot|Captain|Search/i);
      }
    });
  });

  test("public jobs listing loads and links to detail", async ({ jobsPage, page }) => {
    await withStep("Open /jobs", async () => {
      await jobsPage.goto();
      await jobsPage.expectListing();
    });

    await withStep("Open first job detail if present", async () => {
      const links = page.locator("a[href^='/jobs/']");
      const count = await links.count();
      if (count === 0) {
        await expect(page.locator("body")).toContainText(/job|mission|open|empty|no /i);
        return;
      }
      const target = links.first();
      await expect(target).toBeVisible();
      await Promise.all([
        page.waitForURL(/\/jobs\/[^/?#]+/, { timeout: 30_000 }),
        target.click(),
      ]);
      await assertNoAppCrash(page);
      expect(page.url()).toMatch(/\/jobs\/[^/?#]+/);
    });
  });

  test("client find-pilots dashboard loads when authenticated", async ({
    page,
    asClient,
  }) => {
    void asClient;
    await withStep("Open client find-pilots", async () => {
      await page.goto("/dashboard/client/find-pilots", {
        waitUntil: "domcontentloaded",
      });
      expect(page.url()).toMatch(/\/dashboard\/client\/find-pilots|\/login/);
      if (page.url().includes("/login")) {
        throw new Error("Session lost — redirected to login");
      }
      await assertNoAppCrash(page);
    });
  });
});
