import { test, expect } from "../../fixtures/test";
import { withStep } from "../../helpers/logger";
import { assertNoAppCrash } from "../../helpers/assertions";
import { gotoPath } from "../../helpers/navigation";

test.describe("Messaging & notifications @functional", () => {
  test("client messages inbox loads", async ({ page, asClient }) => {
    void asClient;
    await withStep("Client messages", async () => {
      await gotoPath(page, "/dashboard/client/messages");
      await expect(page.locator("body")).toContainText(/Message|Inbox|Conversation|Chat/i);
      await assertNoAppCrash(page);
    });
  });

  test("pilot messages inbox loads", async ({ page, asPilot }) => {
    void asPilot;
    await withStep("Pilot messages", async () => {
      await gotoPath(page, "/dashboard/pilot/messages");
      await expect(page.locator("body")).toContainText(/Message|Inbox|Conversation|Chat/i);
      await assertNoAppCrash(page);
    });
  });

  test("admin messages tracking loads (read-only staff view)", async ({
    page,
    asAdmin,
  }) => {
    void asAdmin;
    await withStep("Admin messages", async () => {
      await gotoPath(page, "/dashboard/admin/messages");
      await assertNoAppCrash(page);
    });
  });
});
