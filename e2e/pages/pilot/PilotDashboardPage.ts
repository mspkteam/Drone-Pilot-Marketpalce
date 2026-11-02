import type { Page } from "@playwright/test";

export class PilotDashboardPage {
  constructor(readonly page: Page) {}

  async gotoHome() {
    await this.page.goto("/dashboard/pilot");
  }

  async gotoOnboarding() {
    await this.page.goto("/dashboard/pilot/onboarding");
  }

  async gotoJobs() {
    await this.page.goto("/dashboard/pilot/jobs");
  }

  async gotoVerifications() {
    await this.page.goto("/dashboard/pilot/verifications");
  }

  async gotoSubscription() {
    await this.page.goto("/dashboard/pilot/subscription");
  }
}
