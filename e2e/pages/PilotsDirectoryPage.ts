import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class PilotsDirectoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.open("/pilots");
  }

  searchInput() {
    return this.page.getByPlaceholder(/Search by name, city, or specialty/i);
  }

  async search(query: string): Promise<void> {
    const input = this.searchInput();
    await input.waitFor({ state: "visible", timeout: 20_000 });
    await input.fill(query);
    // Directory filters as you type / on change — wait for network settle.
    await this.page.waitForLoadState("networkidle").catch(() => undefined);
  }

  results() {
    return this.page.locator("a[href*='/pilots/'], article, [data-pilot]");
  }
}
