import { test, expect } from "../../fixtures/test";
import { adminCredentialsAvailable } from "../../data/accounts";
import { withStep, skipStep } from "../../helpers/logger";
import { assertNoAppCrash, assertOnDashboard } from "../../helpers/assertions";
import { gotoPath } from "../../helpers/navigation";

test.describe("Admin E2E journey @e2e", () => {
  test.beforeEach(() => {
    if (!adminCredentialsAvailable()) {
      skipStep(
        "Admin E2E",
        "Admin credentials not available in env/docs — skipping",
      );
      test.skip(true, "Admin credentials not available");
    }
  });

  test("admin can login and traverse operational queues", async ({
    page,
    asAdmin,
  }) => {
    void asAdmin;

    await withStep("Land on admin dashboard", async () => {
      await assertOnDashboard(page, "admin");
      await assertNoAppCrash(page);
    });

    await withStep("Users queue", async () => {
      await gotoPath(page, "/dashboard/admin/users");
      await assertNoAppCrash(page);
    });

    await withStep("Jobs moderation", async () => {
      await gotoPath(page, "/dashboard/admin/jobs");
      await assertNoAppCrash(page);
    });

    await withStep("Verifications", async () => {
      await gotoPath(page, "/dashboard/admin/verifications");
      await assertNoAppCrash(page);
    });

    await withStep("Disputes", async () => {
      await gotoPath(page, "/dashboard/admin/disputes");
      await assertNoAppCrash(page);
    });

    await withStep("Messages tracking (read-only)", async () => {
      await gotoPath(page, "/dashboard/admin/messages");
      await assertNoAppCrash(page);
    });

    await withStep("Reports + configuration", async () => {
      await gotoPath(page, "/dashboard/admin/reports");
      await assertNoAppCrash(page);
      await gotoPath(page, "/dashboard/admin/configuration");
      await assertNoAppCrash(page);
    });
  });
});
