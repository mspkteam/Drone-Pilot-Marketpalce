import { test, expect } from "../../fixtures/test";
import { withStep } from "../../helpers/logger";
import { assertNoAppCrash } from "../../helpers/assertions";
import { gotoPath } from "../../helpers/navigation";

test.describe("Profiles & onboarding @functional", () => {
  test("client profile page loads", async ({ page, asClient }) => {
    void asClient;
    await withStep("Client profile", async () => {
      await gotoPath(page, "/dashboard/client/profile");
      await expect(page.locator("body")).toContainText(/Profile|Company|Contact|Edit/i);
      await assertNoAppCrash(page);
    });
  });

  test("client onboarding page loads", async ({ page, asClient }) => {
    void asClient;
    await withStep("Client onboarding", async () => {
      await gotoPath(page, "/dashboard/client/onboarding");
      await assertNoAppCrash(page);
    });
  });

  test("pilot profile page loads", async ({ page, asPilot }) => {
    void asPilot;
    await withStep("Pilot profile", async () => {
      await gotoPath(page, "/dashboard/pilot/profile");
      await expect(page.locator("body")).toContainText(/Profile|Display|Bio|Location|Edit/i);
      await assertNoAppCrash(page);
    });
  });

  test("pilot onboarding page loads", async ({ page, asPilot }) => {
    void asPilot;
    await withStep("Pilot onboarding", async () => {
      await gotoPath(page, "/dashboard/pilot/onboarding");
      await assertNoAppCrash(page);
    });
  });

  test("public pilot profile detail from directory", async ({ page, pilotsPage }) => {
    await withStep("Browse pilots → open first profile", async () => {
      await pilotsPage.goto();
      const link = page.locator("a[href^='/pilots/']").first();
      if (!(await link.count())) {
        test.info().annotations.push({
          type: "note",
          description: "No public pilot profile links found — directory may be empty",
        });
        return;
      }
      await expect(link).toBeVisible();
      await Promise.all([
        page.waitForURL(/\/pilots\/[^/?#]+/, { timeout: 30_000 }),
        link.click(),
      ]);
      expect(page.url()).toMatch(/\/pilots\/[^/?#]+/);
      await assertNoAppCrash(page);
    });
  });
});
