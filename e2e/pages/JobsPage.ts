import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class JobsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.open("/jobs");
  }

  async expectListing(): Promise<void> {
    await this.waitForHeading(/Open jobs|Jobs|Missions/i);
  }

  jobLinks() {
    return this.page.locator("a[href^='/jobs/']");
  }
}
