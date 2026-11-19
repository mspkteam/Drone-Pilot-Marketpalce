import type { Page } from "@playwright/test";

export class ClientDashboardPage {
  constructor(readonly page: Page) {}

  async gotoHome() {
    await this.page.goto("/dashboard/client");
  }

  async gotoOnboarding() {
    // Legacy /onboarding redirects to profile completion UI
    await this.page.goto("/dashboard/client/profile");
  }

  /**
   * Completes client profile onboarding via ClientProfileCompletionView.
   * Required: DISPLAY NAME (#contactName) ≥ 2 chars, then Save Profile.
   */
  async completeOnboarding(contactName: string) {
    await this.gotoOnboarding();
    await this.page.locator("#contactName").waitFor({ state: "visible" });
    await this.page.locator("#contactName").fill(contactName);

    const company = this.page.locator("#companyName");
    if (await company.isVisible()) {
      await company.fill("QA Automation LLC");
    }
    const location = this.page.locator("#clientLocation");
    if (await location.isVisible()) {
      await location.fill("Karachi, PK");
    }

    await this.page.getByRole("button", { name: /Save Profile/i }).click();
    await this.page
      .getByRole("status")
      .or(this.page.locator("text=/profile saved|setup is complete/i"))
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
  }

  async openNav(path: string) {
    await this.page.goto(path);
  }
}
