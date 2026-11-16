import { test, expect } from "../../fixtures/test";
import { withStep, skipStep } from "../../helpers/logger";
import { assertNoAppCrash } from "../../helpers/assertions";
import { gotoPath } from "../../helpers/navigation";

test.describe("Booking & payments (demo / no real charges) @functional", () => {
  test("client bookings and payments pages load", async ({ page, asClient }) => {
    void asClient;
    await withStep("Client bookings", async () => {
      await gotoPath(page, "/dashboard/client/bookings");
      await assertNoAppCrash(page);
    });
    await withStep("Client payments (demo only)", async () => {
      await gotoPath(page, "/dashboard/client/payments");
      await assertNoAppCrash(page);
      // Never attempt real Stripe checkout in audit.
      skipStep(
        "Real Stripe payment",
        "Out of scope — demo/mock payments only; no real financial transactions",
      );
    });
  });

  test("pilot bookings and payments pages load", async ({ page, asPilot }) => {
    void asPilot;
    await withStep("Pilot bookings/contracts area", async () => {
      await gotoPath(page, "/dashboard/pilot/bookings");
      await assertNoAppCrash(page);
    });
    await withStep("Pilot payments/payouts", async () => {
      await gotoPath(page, "/dashboard/pilot/payments");
      await assertNoAppCrash(page);
    });
  });

  test("client disputes list loads", async ({ page, asClient }) => {
    void asClient;
    await withStep("Client disputes", async () => {
      await gotoPath(page, "/dashboard/client/disputes");
      await assertNoAppCrash(page);
    });
  });

  test("pilot reviews page loads", async ({ page, asPilot }) => {
    void asPilot;
    await withStep("Pilot reviews", async () => {
      await gotoPath(page, "/dashboard/pilot/reviews");
      await expect(page.locator("body")).toContainText(/Review|Rating|Feedback/i);
      await assertNoAppCrash(page);
    });
  });
});
