import { test, expect } from "../../fixtures/test";
import { ACCOUNTS } from "../../data/accounts";
import { withStep, skipStep } from "../../helpers/logger";
import { expectProtectedRedirect, logout } from "../../helpers/auth";
import { assertOnDashboard } from "../../helpers/assertions";

test.describe("Auth @smoke @functional", () => {
  test("login page renders email/password form", async ({ loginPage, page }) => {
    await withStep("Open login", async () => {
      await loginPage.goto();
    });
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /^Log in$/i })).toBeVisible();
  });

  test("invalid credentials show alert", async ({ loginPage, page }) => {
    await withStep("Submit bad credentials", async () => {
      await loginPage.goto();
      await page.waitForLoadState("networkidle").catch(() => undefined);
      await loginPage.fillCredentials("nobody@example.com", "WrongPass1!");
      await loginPage.submit();
      await expect(loginPage.alert()).toBeVisible({ timeout: 20_000 });
    });
  });

  test("client demo login reaches client dashboard", async ({ page, loginPage }) => {
    await withStep("Login as client", async () => {
      await loginPage.login(ACCOUNTS.client.email, ACCOUNTS.client.password);
      await assertOnDashboard(page, "client");
    });
    await logout(page);
  });

  test("pilot demo login reaches pilot dashboard", async ({ page, loginPage }) => {
    await withStep("Login as pilot", async () => {
      await loginPage.login(ACCOUNTS.pilot.email, ACCOUNTS.pilot.password);
      await assertOnDashboard(page, "pilot");
    });
    await logout(page);
  });

  test("admin demo login reaches admin dashboard", async ({ page, loginPage }) => {
    if (!ACCOUNTS.admin.email) {
      skipStep("admin login", "No admin credentials configured");
      test.skip(true, "No admin credentials");
      return;
    }
    await withStep("Login as admin", async () => {
      await loginPage.login(ACCOUNTS.admin.email, ACCOUNTS.admin.password);
      await assertOnDashboard(page, "admin");
    });
    await logout(page);
  });

  test("guest cannot open client dashboard", async ({ page }) => {
    await withStep("Protected redirect", async () => {
      await expectProtectedRedirect(page, "/dashboard/client");
    });
  });

  test("register page is reachable (may be closed)", async ({ page }) => {
    await withStep("Open register", async () => {
      const res = await page.goto("/register", { waitUntil: "domcontentloaded" });
      expect(res!.status()).toBeLessThan(500);
      const body = await page.locator("body").innerText();
      // Registration may be closed → waitlist / ops dashboard copy is acceptable.
      expect(body.length).toBeGreaterThan(20);
    });
  });
});
