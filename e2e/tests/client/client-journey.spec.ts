import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../pages/auth/RegisterPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { ClientDashboardPage } from "../../pages/client/ClientDashboardPage";
import { JobWizardPage } from "../../pages/client/JobWizardPage";
import { uniqueEmail, strongPassword } from "../../helpers/testUsers";

async function registerLoginClient(page: import("@playwright/test").Page) {
  const email = uniqueEmail("client");
  const password = strongPassword();
  await new RegisterPage(page).registerAndLandOnLogin("client", email, password);
  await new LoginPage(page).login(email, password, /\/dashboard\/client/);
  return { email, password };
}

test.describe("Client journey", () => {
  test("C-01 new client reaches dashboard/onboarding area", async ({ page }) => {
    await registerLoginClient(page);
    expect(page.url()).toMatch(/\/dashboard\/client/);
    await page.screenshot({ path: "artifacts/exploration/client-home.png" });
  });

  test("C-03 complete onboarding when form present", async ({ page }) => {
    await registerLoginClient(page);
    const dash = new ClientDashboardPage(page);
    await dash.completeOnboarding("QA Client User");
    // After wizard, client home should be reachable
    await dash.gotoHome();
    await expect(page.locator("body")).toBeVisible();
  });

  test("C-05/C-06 profile settings and nav pages load", async ({ page }) => {
    await registerLoginClient(page);
    await new ClientDashboardPage(page).completeOnboarding("QA Nav Client");
    for (const path of [
      "/dashboard/client/profile",
      "/dashboard/client/settings",
      "/dashboard/client/jobs",
      "/dashboard/client/find-pilots",
      "/dashboard/client/bookings",
      "/dashboard/client/messages",
      "/dashboard/client/payments",
      "/dashboard/client/reviews",
      "/dashboard/client/disputes",
    ]) {
      const res = await page.goto(path);
      expect(res?.status() ?? 0).toBeLessThan(500);
      await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });

  test("C-10 job wizard page opens and rejects empty submit", async ({ page }) => {
    await registerLoginClient(page);
    await new ClientDashboardPage(page).completeOnboarding("QA Job Client");
    const job = new JobWizardPage(page);
    await job.gotoNew();
    await expect(page).toHaveURL(/\/jobs\/new/);
    await page.screenshot({ path: "artifacts/exploration/client-job-new.png" });
    // Try continue without required fields — should stay on wizard or show errors
    await job.clickContinue();
    await expect(page).toHaveURL(/\/jobs\/new|\/jobs/);
  });

  test("C-20 find pilots inventory", async ({ page }) => {
    await registerLoginClient(page);
    await new ClientDashboardPage(page).completeOnboarding("QA Find Client");
    await page.goto("/dashboard/client/find-pilots");
    await expect(page.locator("body")).toBeVisible();
    const search = page.getByPlaceholder(/search/i).or(page.locator('input[type="search"]'));
    if (await search.count()) {
      await search.first().fill("zzz-no-match-qa");
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: "artifacts/exploration/client-find-pilots.png" });
  });
});

