import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.open("/");
  }

  async expectHeroVisible(): Promise<void> {
    await this.waitForHeading(/Find Local Drone Pilots|Remote Air|Hire/i);
  }

  navLink(name: string | RegExp) {
    return this.page.getByRole("link", { name }).first();
  }
}
