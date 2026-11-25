import type { Page } from "@playwright/test";

export class AdminDashboardPage {
  constructor(readonly page: Page) {}

  async gotoHome() {
    await this.page.goto("/dashboard/admin");
  }

  async gotoJobs() {
    await this.page.goto("/dashboard/admin/jobs");
  }

  async gotoUsers() {
    await this.page.goto("/dashboard/admin/users");
  }

  async gotoPilots() {
    await this.page.goto("/dashboard/admin/pilots");
  }

  async gotoVerifications() {
    await this.page.goto("/dashboard/admin/verifications");
  }

  async gotoPermissions() {
    await this.page.goto("/dashboard/admin/permissions");
  }

  async approveFirstPendingJobIfPresent() {
    await this.gotoJobs();
    const approve = this.page.getByRole("button", { name: /approve/i }).first();
    if (await approve.count()) {
      await approve.click();
      return true;
    }
    return false;
  }
}
