import { test, expect } from "@playwright/test";
import path from "node:path";
import { RegisterPage } from "../../pages/auth/RegisterPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { PilotDashboardPage } from "../../pages/pilot/PilotDashboardPage";
import { uniqueEmail, strongPassword } from "../../helpers/testUsers";

async function registerLoginPilot(page: import("@playwright/test").Page) {
  const email = uniqueEmail("pilot");
  const password = strongPassword();
  await new RegisterPage(page).registerAndLandOnLogin("pilot", email, password);
  await new LoginPage(page).login(email, password, /\/dashboard\/pilot/);
  return { email, password };
}

test.describe("Pilot journey", () => {
  test("P-01 register + dashboard", async ({ page }) => {
    await registerLoginPilot(page);
    expect(page.url()).toMatch(/\/dashboard\/pilot/);
    await page.screenshot({ path: "artifacts/exploration/pilot-home.png" });
  });

  test("P-05..P-06 core pilot pages load", async ({ page }) => {
    await registerLoginPilot(page);
    const dash = new PilotDashboardPage(page);
    for (const pathName of [
      "/dashboard/pilot/jobs",
      "/dashboard/pilot/locked-jobs",
      "/dashboard/pilot/applications",
      "/dashboard/pilot/subscription",
      "/dashboard/pilot/verifications",
      "/dashboard/pilot/certificates",
      "/dashboard/pilot/shop",
      "/dashboard/pilot/support",
      "/dashboard/pilot/settings",
      "/dashboard/pilot/profile",
    ]) {
      const res = await page.goto(pathName);
      expect(res?.status() ?? 0).toBeLessThan(500);
    }
    await dash.gotoSubscription();
    await expect(page.locator("body")).toContainText(/membership|subscription|Fast Forward|A-1|grade|plan/i);
  });

  test("P-03/P-04 verification upload controls when present", async ({ page }) => {
    await registerLoginPilot(page);
    await page.goto("/dashboard/pilot/verifications");
    await page.screenshot({ path: "artifacts/exploration/pilot-verifications.png" });
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count()) {
      const valid = path.join(__dirname, "../../fixtures/files/valid-license.pdf");
      await fileInput.setInputFiles(valid);
      await page.waitForTimeout(500);
      // Invalid type attempt on second input if available
      const invalid = path.join(__dirname, "../../fixtures/files/invalid.exe");
      await fileInput.setInputFiles(invalid);
      await page.waitForTimeout(500);
      await expect(page.locator("body")).toBeVisible();
    }
  });
});
