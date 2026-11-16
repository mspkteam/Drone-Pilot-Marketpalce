import type { Locator, Page } from "@playwright/test";
import { assertNoAppCrash } from "../helpers/assertions";
import { attachMonitors, type PageMonitor } from "../helpers/monitors";

export class BasePage {
  readonly page: Page;
  protected monitor: PageMonitor;

  constructor(page: Page) {
    this.page = page;
    this.monitor = attachMonitors(page);
  }

  get body(): Locator {
    return this.page.locator("body");
  }

  async open(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
    await assertNoAppCrash(this.page);
  }

  async waitForHeading(name: string | RegExp): Promise<void> {
    await this.page.getByRole("heading", { name }).first().waitFor({
      state: "visible",
      timeout: 30_000,
    });
  }

  dispose(): void {
    this.monitor.dispose();
  }

  getMonitor(): PageMonitor {
    return this.monitor;
  }
}
