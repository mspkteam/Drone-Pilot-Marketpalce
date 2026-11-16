import { test, expect } from "../../fixtures/test";
import { withStep } from "../../helpers/logger";
import { assertNoAppCrash, assertOnDashboard } from "../../helpers/assertions";
import { gotoPath } from "../../helpers/navigation";
import { generateJobTitle } from "../../helpers/generators";

/**
 * Client E2E journey against live demo data.
 * Does not create irreversible production mutations beyond draft UI exploration.
 * Real Stripe payments are never executed.
 */
test.describe("Client E2E journey @e2e", () => {
  test("client can login, browse pilots, open jobs, and reach booking/payment surfaces", async ({
    page,
    asClient,
  }) => {
    void asClient;

    await withStep("Land on client dashboard", async () => {
      await assertOnDashboard(page, "client");
      await assertNoAppCrash(page);
    });

    await withStep("Find pilots in dashboard", async () => {
      await gotoPath(page, "/dashboard/client/find-pilots");
      await assertNoAppCrash(page);
    });

    await withStep("Review my projects/jobs", async () => {
      await gotoPath(page, "/dashboard/client/jobs");
      await assertNoAppCrash(page);
    });

    await withStep("Open new project wizard (no submit of incomplete form)", async () => {
      await gotoPath(page, "/dashboard/client/jobs/new");
      const title = generateJobTitle();
      // Fill only if a title field is present — do not submit incomplete multi-step form.
      const titleInput = page.locator(
        'input[name="title"], input[placeholder*="title" i], input[name="projectTitle"]',
      ).first();
      if (await titleInput.count()) {
        await titleInput.fill(title);
      }
      await assertNoAppCrash(page);
    });

    await withStep("Open messages inbox", async () => {
      await gotoPath(page, "/dashboard/client/messages");
      await assertNoAppCrash(page);
    });

    await withStep("Open bookings", async () => {
      await gotoPath(page, "/dashboard/client/bookings");
      await assertNoAppCrash(page);
    });

    await withStep("Open payments (demo only — no charge)", async () => {
      await gotoPath(page, "/dashboard/client/payments");
      await assertNoAppCrash(page);
      // Guardrail: never click pay/checkout that hits real Stripe.
      const stripeFrames = page.frameLocator('iframe[src*="stripe"]');
      expect(await stripeFrames.locator("body").count().catch(() => 0)).toBe(0);
    });

    await withStep("Open settings", async () => {
      await gotoPath(page, "/dashboard/client/settings");
      await assertNoAppCrash(page);
    });
  });
});
