import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/auth/LoginPage";
import { AdminDashboardPage } from "../../pages/admin/AdminDashboardPage";
import { adminCredentials, moderatorCredentials } from "../../helpers/env";

test.describe("Admin journey (local seed staff)", () => {
  test("AD-01 login super admin", async ({ page }) => {
    const { email, password } = adminCredentials();
    await new LoginPage(page).login(email, password, /\/dashboard\/admin/);
    await page.screenshot({ path: "artifacts/exploration/admin-home.png" });
  });

  test("AD-02..AD-07 admin sections load", async ({ page }) => {
    const { email, password } = adminCredentials();
    await new LoginPage(page).login(email, password, /\/dashboard\/admin/);
    const admin = new AdminDashboardPage(page);
    for (const pathName of [
      "/dashboard/admin",
      "/dashboard/admin/users",
      "/dashboard/admin/pilots",
      "/dashboard/admin/clients",
      "/dashboard/admin/jobs",
      "/dashboard/admin/applications",
      "/dashboard/admin/bookings",
      "/dashboard/admin/verifications",
      "/dashboard/admin/messages",
      "/dashboard/admin/support",
      "/dashboard/admin/disputes",
      "/dashboard/admin/payments",
      "/dashboard/admin/subscriptions",
      "/dashboard/admin/certificates",
      "/dashboard/admin/shop",
      "/dashboard/admin/cms",
      "/dashboard/admin/settings",
    ]) {
      const res = await page.goto(pathName);
      expect(res?.status() ?? 0).toBeLessThan(500);
      await expect(page).toHaveURL(/\/dashboard\/admin/);
    }
    await admin.gotoJobs();
    await expect(page.locator("body")).toBeVisible();
  });

  test("AD-08 permissions reachable for super admin", async ({ page }) => {
    const { email, password } = adminCredentials();
    await new LoginPage(page).login(email, password, /\/dashboard\/admin/);
    await page.goto("/dashboard/admin/permissions");
    await expect(page).toHaveURL(/\/permissions/);
  });

  test("AD-09 moderator redirected away from permissions", async ({ page }) => {
    const { email, password } = moderatorCredentials();
    await new LoginPage(page).login(email, password, /\/dashboard\/admin/);
    await page.goto("/dashboard/admin/permissions");
    await expect(page).not.toHaveURL(/\/permissions$/);
  });
});
