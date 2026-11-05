import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../pages/auth/RegisterPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { uniqueEmail, strongPassword } from "../../helpers/testUsers";

test.describe("AuthZ — cross-role dashboards", () => {
  test("A-11 client cannot open pilot dashboard", async ({ page }) => {
    const email = uniqueEmail("client");
    const password = strongPassword();
    await new RegisterPage(page).registerAndLandOnLogin("client", email, password);
    await new LoginPage(page).login(email, password, /\/dashboard\/client/);
    await page.goto("/dashboard/pilot");
    await expect(page).toHaveURL(/\/dashboard\/client/);
  });

  test("A-12 client cannot open admin dashboard", async ({ page }) => {
    const email = uniqueEmail("client");
    const password = strongPassword();
    await new RegisterPage(page).registerAndLandOnLogin("client", email, password);
    await new LoginPage(page).login(email, password, /\/dashboard\/client/);
    await page.goto("/dashboard/admin");
    await expect(page).toHaveURL(/\/dashboard\/client/);
  });
});
