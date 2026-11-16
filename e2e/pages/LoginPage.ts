import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.open("/login");
    await this.page.locator('input[name="email"]').waitFor({ state: "visible" });
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.page.locator('input[name="email"]').fill(email);
    await this.page.locator('input[name="password"]').fill(password);
  }

  async submit(): Promise<void> {
    await this.page.getByRole("button", { name: /^Log in$/i }).click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.goto();
    await this.page.waitForLoadState("networkidle").catch(() => undefined);
    await this.fillCredentials(email, password);
    await Promise.all([
      this.page.waitForURL(/\/dashboard\//, { timeout: 60_000 }),
      this.submit(),
    ]);
  }

  alert(): ReturnType<Page["locator"]> {
    return this.page.locator('[role="alert"]');
  }
}
