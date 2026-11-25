import { test, expect } from "../../fixtures/base";
import { RegisterPage } from "../../pages/auth/RegisterPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { ClientDashboardPage } from "../../pages/client/ClientDashboardPage";
import { JobWizardPage } from "../../pages/client/JobWizardPage";
import { PilotDashboardPage } from "../../pages/pilot/PilotDashboardPage";
import { AdminDashboardPage } from "../../pages/admin/AdminDashboardPage";
import { MarketingPage, PUBLIC_NAV } from "../../pages/guest/MarketingPage";
import { uniqueEmail, strongPassword } from "../../helpers/testUsers";
import { adminCredentials } from "../../helpers/env";

/**
 * Interactive full-path E2E — one browser, sequential, with pauses.
 * Registers fresh client + pilot, exercises profiles/menus, posts a project,
 * and walks admin ops against local data.
 */
test.describe.configure({ mode: "serial" });

test.describe("Interactive full E2E (headed demo)", () => {
  let clientEmail = "";
  let clientPassword = "";
  let pilotEmail = "";
  let pilotPassword = "";

  test("1) Guest explores public marketing pages", async ({ page }) => {
    const m = new MarketingPage(page);
    await m.gotoHome();
    await expect(page.locator("body")).toBeVisible();
    for (const item of PUBLIC_NAV) {
      await page.goto(item.path);
      await expect(page.locator("body")).toBeVisible();
      await page.waitForTimeout(800);
    }
    await page.goto("/pilots");
    await page.goto("/jobs");
    await page.screenshot({
      path: "artifacts/exploration/interactive-guest.png",
      fullPage: true,
    });
  });

  test("2) Register + complete client profile, explore client dashboard", async ({
    page,
  }) => {
    clientEmail = uniqueEmail("client");
    clientPassword = strongPassword();
    await new RegisterPage(page).registerAndLandOnLogin(
      "client",
      clientEmail,
      clientPassword,
    );
    await new LoginPage(page).login(
      clientEmail,
      clientPassword,
      /\/dashboard\/client/,
    );

    const client = new ClientDashboardPage(page);
    await client.completeOnboarding("Interactive QA Client");

    // Interact with primary client modules
    for (const path of [
      "/dashboard/client",
      "/dashboard/client/profile",
      "/dashboard/client/jobs",
      "/dashboard/client/find-pilots",
      "/dashboard/client/bookings",
      "/dashboard/client/messages",
      "/dashboard/client/payments",
      "/dashboard/client/reviews",
      "/dashboard/client/disputes",
      "/dashboard/client/settings",
    ]) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      // Click a visible safe control if present (filters / edit / tabs)
      const safeBtn = page
        .getByRole("button", { name: /Edit|Filter|Search|Refresh|New|Add/i })
        .first();
      if (await safeBtn.count()) {
        await safeBtn.click().catch(() => undefined);
        await page.waitForTimeout(500);
      }
    }

    // Find pilots — try search
    await page.goto("/dashboard/client/find-pilots");
    const search = page
      .getByPlaceholder(/search/i)
      .or(page.locator('input[type="search"], input[type="text"]').first());
    if (await search.count()) {
      await search.first().fill("Captain");
      await page.waitForTimeout(1000);
      await search.first().fill("");
    }

    await page.screenshot({
      path: "artifacts/exploration/interactive-client.png",
      fullPage: true,
    });
  });

  test("3) Client posts a full project through the wizard", async ({ page }) => {
    test.skip(!clientEmail, "Client not registered");
    await new LoginPage(page).login(
      clientEmail,
      clientPassword,
      /\/dashboard\/client/,
    );

    const wizard = new JobWizardPage(page);
    try {
      await wizard.completeAndSubmit();
      await expect(page).toHaveURL(/\/dashboard\/client\/jobs/);
    } catch (error) {
      // Capture wizard state for debugging; do not hide app failures
      await page.screenshot({
        path: "artifacts/exploration/interactive-job-wizard-fail.png",
        fullPage: true,
      });
      throw error;
    }

    await page.screenshot({
      path: "artifacts/exploration/interactive-job-submitted.png",
      fullPage: true,
    });
  });

  test("4) Register + complete pilot profile and explore pilot modules", async ({
    page,
  }) => {
    pilotEmail = uniqueEmail("pilot");
    pilotPassword = strongPassword();
    await new RegisterPage(page).registerAndLandOnLogin(
      "pilot",
      pilotEmail,
      pilotPassword,
    );
    await new LoginPage(page).login(
      pilotEmail,
      pilotPassword,
      /\/dashboard\/pilot/,
    );

    const pilot = new PilotDashboardPage(page);
    await pilot.completeOnboarding("Interactive QA Pilot");
    await pilot.tryUploadVerification();
    await pilot.gotoSubscription();
    await expect(page.locator("body")).toContainText(
      /membership|subscription|Fast Forward|A-1|grade|plan|99\.99/i,
    );
    await pilot.gotoJobs();
    await pilot.gotoLockedJobs();
    await pilot.gotoApplications();

    // Settings interaction
    await pilot.gotoSettings();
    await expect(page.locator("body")).toBeVisible();

    await page.screenshot({
      path: "artifacts/exploration/interactive-pilot.png",
      fullPage: true,
    });
  });

  test("5) Admin reviews users, jobs, verifications, and key ops pages", async ({
    page,
  }) => {
    const admin = adminCredentials();
    await new LoginPage(page).login(
      admin.email,
      admin.password,
      /\/dashboard\/admin/,
    );

    const dash = new AdminDashboardPage(page);
    await dash.gotoHome();
    await dash.gotoUsers();
    await dash.gotoPilots();
    await page.goto("/dashboard/admin/clients");
    await dash.gotoJobs();

    // Interact: open first actionable approve if present (local test jobs only)
    const approve = page.getByRole("button", { name: /^Approve$/i }).first();
    if (await approve.count()) {
      await approve.click();
      await page.waitForTimeout(1500);
    }

    await dash.gotoVerifications();
    const reviewBtn = page
      .getByRole("button", { name: /Approve|Reject|View|Review|Amend/i })
      .first();
    if (await reviewBtn.count()) {
      await reviewBtn.click().catch(() => undefined);
      await page.waitForTimeout(1000);
      // Close modal if opened
      const close = page.getByRole("button", { name: /Close|Cancel|×/i }).first();
      if (await close.count()) await close.click().catch(() => undefined);
    }

    for (const path of [
      "/dashboard/admin/applications",
      "/dashboard/admin/bookings",
      "/dashboard/admin/messages",
      "/dashboard/admin/support",
      "/dashboard/admin/disputes",
      "/dashboard/admin/payments",
      "/dashboard/admin/subscriptions",
      "/dashboard/admin/shop",
      "/dashboard/admin/settings",
    ]) {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
      await page.waitForTimeout(700);
    }

    await page.screenshot({
      path: "artifacts/exploration/interactive-admin.png",
      fullPage: true,
    });
  });

  test("6) AuthZ: client cannot open pilot/admin after re-login", async ({ page }) => {
    test.skip(!clientEmail, "Client not registered");
    await new LoginPage(page).login(
      clientEmail,
      clientPassword,
      /\/dashboard\/client/,
    );
    await page.goto("/dashboard/pilot");
    await expect(page).toHaveURL(/\/dashboard\/client/);
    await page.goto("/dashboard/admin");
    await expect(page).toHaveURL(/\/dashboard\/client/);
  });
});
