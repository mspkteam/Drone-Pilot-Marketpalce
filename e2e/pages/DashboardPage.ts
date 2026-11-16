import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoRole(role: "client" | "pilot" | "admin"): Promise<void> {
    await this.open(`/dashboard/${role}`);
  }

  mainNav() {
    return this.page.locator("nav, aside, [role='navigation']").first();
  }

  async openNav(name: string | RegExp): Promise<void> {
    const link = this.page.getByRole("link", { name }).first();
    await link.click();
    await this.page.waitForLoadState("domcontentloaded");
  }
}
