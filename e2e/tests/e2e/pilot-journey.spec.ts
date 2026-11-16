import { test, expect } from "../../fixtures/test";
import { withStep } from "../../helpers/logger";
import { assertNoAppCrash, assertOnDashboard } from "../../helpers/assertions";
import { gotoPath } from "../../helpers/navigation";

test.describe("Pilot E2E journey @e2e", () => {
  test("pilot can login, browse jobs, review proposals, messages, and membership", async ({
    page,
    asPilot,
  }) => {
    void asPilot;

    await withStep("Land on pilot dashboard", async () => {
      await assertOnDashboard(page, "pilot");
      await assertNoAppCrash(page);
    });

    await withStep("Browse available jobs", async () => {
      await gotoPath(page, "/dashboard/pilot/jobs");
      await assertNoAppCrash(page);
    });

    await withStep("Review proposals list", async () => {
      await gotoPath(page, "/dashboard/pilot/proposals");
      await assertNoAppCrash(page);
    });

    await withStep("Open locked jobs (grade visibility)", async () => {
      await gotoPath(page, "/dashboard/pilot/locked-jobs");
      await assertNoAppCrash(page);
    });

    await withStep("Open messages", async () => {
      await gotoPath(page, "/dashboard/pilot/messages");
      await assertNoAppCrash(page);
    });

    await withStep("Open bookings/contracts", async () => {
      await gotoPath(page, "/dashboard/pilot/bookings");
      await assertNoAppCrash(page);
    });

    await withStep("Open membership/subscription (no real payment)", async () => {
      await gotoPath(page, "/dashboard/pilot/subscription");
      await assertNoAppCrash(page);
      await expect(page.locator("body")).toContainText(
        /Membership|Subscription|Grade|Captain|Fast Forward|A-/i,
      );
    });

    await withStep("Open profile + verifications", async () => {
      await gotoPath(page, "/dashboard/pilot/profile");
      await assertNoAppCrash(page);
      await gotoPath(page, "/dashboard/pilot/verifications");
      await assertNoAppCrash(page);
    });
  });
});
