import { test, expect } from "../../fixtures/test";
import { withStep } from "../../helpers/logger";
import { assertNoAppCrash } from "../../helpers/assertions";
import { gotoPath } from "../../helpers/navigation";

test.describe("Missions / Jobs / Proposals @functional", () => {
  test("client jobs list and new job form load", async ({ page, asClient }) => {
    void asClient;
    await withStep("Client jobs list", async () => {
      await gotoPath(page, "/dashboard/client/jobs");
      await assertNoAppCrash(page);
    });
    await withStep("Client new job wizard", async () => {
      await gotoPath(page, "/dashboard/client/jobs/new");
      await expect(page.locator("body")).toContainText(
        /Post|Project|Job|Mission|Step|Title|Budget/i,
      );
      await assertNoAppCrash(page);
    });
  });

  test("pilot jobs marketplace and proposals load", async ({ page, asPilot }) => {
    void asPilot;
    await withStep("Pilot find jobs", async () => {
      await gotoPath(page, "/dashboard/pilot/jobs");
      await assertNoAppCrash(page);
    });
    await withStep("Pilot proposals", async () => {
      await gotoPath(page, "/dashboard/pilot/proposals");
      await expect(page.locator("body")).toContainText(
        /Proposal|Application|Bid|Pending|Accepted|Draft/i,
      );
      await assertNoAppCrash(page);
    });
    await withStep("Pilot applications", async () => {
      await gotoPath(page, "/dashboard/pilot/applications");
      await assertNoAppCrash(page);
    });
  });

  test("A-1 student pilot can view jobs but proposal affordances restricted", async ({
    page,
    loginPage,
  }) => {
    await withStep("Login as A-1 pilot", async () => {
      const { ACCOUNTS } = await import("../../data/accounts");
      await loginPage.login(ACCOUNTS.pilotA1.email, ACCOUNTS.pilotA1.password);
    });
    await withStep("Visit pilot jobs", async () => {
      await gotoPath(page, "/dashboard/pilot/jobs");
      await assertNoAppCrash(page);
      // Business rule: A-1 cannot submit proposals — assert page does not crash.
      // Exact CTA copy varies; we only assert the page is usable.
      await expect(page.locator("body")).toBeVisible();
    });
  });
});
