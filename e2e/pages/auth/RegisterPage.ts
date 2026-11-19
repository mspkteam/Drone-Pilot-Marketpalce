import type { Page, Locator } from "@playwright/test";
import type { RegisterableRole } from "../../helpers/testUsers";

export class RegisterPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly confirm: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.locator("#reg-email");
    this.password = page.locator("#reg-password");
    this.confirm = page.locator("#reg-confirm");
    this.submit = page.getByRole("button", { name: /Create account/i });
    this.error = page.locator("text=/failed|error|must|valid|match|already/i").first();
  }

  async goto() {
    await this.page.goto("/register");
  }

  async selectRole(role: RegisterableRole) {
    await this.page
      .getByRole("button", { name: role === "pilot" ? /^Pilot/i : /^Client/i })
      .first()
      .click();
  }

  async fill(email: string, password: string, confirm = password) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.confirm.fill(confirm);
  }

  async submitForm() {
    await this.submit.click();
  }

  async registerAndLandOnLogin(
    role: RegisterableRole,
    email: string,
    password: string,
  ) {
    await this.goto();
    await this.selectRole(role);
    await this.fill(email, password);
    await Promise.all([
      this.page.waitForURL(/\/login/),
      this.submitForm(),
    ]);
  }
}
