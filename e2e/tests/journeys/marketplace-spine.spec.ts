import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../pages/auth/RegisterPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { ClientDashboardPage } from "../../pages/client/ClientDashboardPage";
import { JobWizardPage } from "../../pages/client/JobWizardPage";
import { adminCredentials } from "../../helpers/env";
import { uniqueEmail, strongPassword } from "../../helpers/testUsers";

/**
 * Best-effort marketplace spine against local app.
 * Steps that depend on multi-step wizards soft-assert and continue when UI differs.
 */
test.describe("Marketplace spine (local)", () => {
  test("client registers, onboards, opens job wizard; admin can open jobs queue", async ({
    page,
    browser,
  }) => {
    const email = uniqueEmail("client");
    const password = strongPassword();
    await new RegisterPage(page).registerAndLandOnLogin("client", email, password);
    await new LoginPage(page).login(email, password, /\/dashboard\/client/);
    await new ClientDashboardPage(page).completeOnboarding("Spine Client");
    const job = new JobWizardPage(page);
    await job.gotoNew();
    await expect(page).toHaveURL(/\/jobs\/new/);
    await job.fillBasics({
      title: "QA Aerial Survey Mission",
      description: "Automated E2E mission description with enough length.",
      location: "Karachi, Pakistan",
    });
    await page.screenshot({ path: "artifacts/exploration/spine-job-wizard.png" });

    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    const admin = adminCredentials();
    await new LoginPage(adminPage).login(
      admin.email,
      admin.password,
      /\/dashboard\/admin/,
    );
    await adminPage.goto("/dashboard/admin/jobs");
    await expect(adminPage.locator("body")).toBeVisible();
    await adminPage.screenshot({ path: "artifacts/exploration/spine-admin-jobs.png" });
    await adminCtx.close();
  });
});
