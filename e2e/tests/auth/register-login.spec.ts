import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../pages/auth/RegisterPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { uniqueEmail, strongPassword } from "../../helpers/testUsers";

test.describe("Auth — register & login", () => {
  test("A-01 register new client and land on login", async ({ page }) => {
    const email = uniqueEmail("client");
    const password = strongPassword();
    const reg = new RegisterPage(page);
    await reg.registerAndLandOnLogin("client", email, password);
    expect(page.url()).toContain("/login");
  });

  test("A-02 register new pilot and land on login", async ({ page }) => {
    const email = uniqueEmail("pilot");
    const password = strongPassword();
    const reg = new RegisterPage(page);
    await reg.registerAndLandOnLogin("pilot", email, password);
    expect(page.url()).toContain("/login");
  });

  test("A-03 empty register shows validation", async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.goto();
    await reg.submitForm();
    await expect(page).toHaveURL(/\/register/);
  });

  test("A-04 invalid email rejected", async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.goto();
    await reg.selectRole("client");
    await reg.fill("not-an-email", strongPassword());
    await reg.submitForm();
    await expect(page).toHaveURL(/\/register/);
  });

  test("A-05 weak password rejected", async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.goto();
    await reg.selectRole("client");
    await reg.fill(uniqueEmail("client"), "password");
    await reg.submitForm();
    await expect(page.locator("body")).toContainText(/password|character|uppercase|lowercase|number|special/i);
  });

  test("A-06 password mismatch", async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.goto();
    await reg.selectRole("client");
    await reg.fill(uniqueEmail("client"), strongPassword(), "Different!Pass1");
    await reg.submitForm();
    await expect(page.locator("body")).toContainText(/match/i);
  });

  test("A-07 duplicate email rejected", async ({ page }) => {
    const email = uniqueEmail("client");
    const password = strongPassword();
    const reg = new RegisterPage(page);
    await reg.registerAndLandOnLogin("client", email, password);
    await reg.goto();
    await reg.selectRole("client");
    await reg.fill(email, password);
    await reg.submitForm();
    await expect(page.locator("body")).toContainText(/already|exists|registered|in use/i);
  });

  test("A-08 login after register reaches client dashboard", async ({ page }) => {
    const email = uniqueEmail("client");
    const password = strongPassword();
    const reg = new RegisterPage(page);
    await reg.registerAndLandOnLogin("client", email, password);
    const login = new LoginPage(page);
    await login.login(email, password, /\/dashboard\/client/);
    expect(page.url()).toMatch(/\/dashboard\/client/);
  });

  test("A-09 invalid credentials stay on login", async ({ page }) => {
    const login = new LoginPage(page);
    await login.attemptLogin("nobody@example.test", "WrongPassword!1");
    await expect(page).toHaveURL(/\/login/);
  });

  test("A-10 guest dashboard redirect", async ({ page }) => {
    await page.goto("/dashboard/client");
    await expect(page).toHaveURL(/\/login/);
  });
});
