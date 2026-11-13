import type { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.locator('input[name="email"]');
    this.password = page.locator('input[name="password"]');
    this.submit = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string, expectPath: RegExp) {
    await this.goto();
    await this.email.fill(email);
    await this.password.fill(password);
    await Promise.all([
      this.page.waitForURL(expectPath),
      this.submit.click(),
    ]);
  }

  async attemptLogin(email: string, password: string) {
    await this.goto();
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
    await this.page.waitForTimeout(800);
  }
}
