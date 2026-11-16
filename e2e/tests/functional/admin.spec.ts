import { test, expect } from "../../fixtures/test";
import {
  ADMIN_DASHBOARD_PATHS,
  adminCredentialsAvailable,
} from "../../data/accounts";
import { withStep, skipStep } from "../../helpers/logger";
import { softGoto } from "../../helpers/navigation";
import { assertNoAppCrash } from "../../helpers/assertions";

test.describe("Admin module @functional", () => {
  test.beforeEach(() => {
    if (!adminCredentialsAvailable()) {
      skipStep(
        "Admin suite",
        "Admin credentials not available in env/docs — skipping admin journey",
      );
      test.skip(true, "Admin credentials not available");
    }
  });

  test("admin dashboard loads", async ({ page, asAdmin }) => {
    void asAdmin;
    await withStep("Admin home", async () => {
      await page.goto("/dashboard/admin", { waitUntil: "domcontentloaded" });
      expect(page.url()).toMatch(/\/dashboard\/admin/);
      await assertNoAppCrash(page);
    });
  });

  test("admin key modules respond without 5xx", async ({ page, asAdmin }) => {
    void asAdmin;
    const failures: string[] = [];
    for (const path of ADMIN_DASHBOARD_PATHS) {
      await withStep(`Admin route ${path}`, async () => {
        const result = await softGoto(page, path);
        if (!result.ok) {
          failures.push(`${path}: ${result.detail}`);
          return;
        }
        if (result.url.includes("/login")) {
          failures.push(`${path}: redirected to login`);
        }
      });
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});
