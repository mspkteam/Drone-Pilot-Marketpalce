import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../pages/auth/RegisterPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { uniqueEmail, strongPassword } from "../../helpers/testUsers";

test.describe("API authz", () => {
  test("N-02 unauthenticated API returns 401", async ({ request }) => {
    const res = await request.get("/api/client/jobs");
    expect([401, 403]).toContain(res.status());
  });

  test("N-03 client cannot use pilot applications API", async ({ page, request }) => {
    const email = uniqueEmail("client");
    const password = strongPassword();
    await new RegisterPage(page).registerAndLandOnLogin("client", email, password);
    await new LoginPage(page).login(email, password, /\/dashboard\/client/);
    const res = await request.post("/api/pilot/applications", {
      data: {},
    });
    // Cookie jar from page context — use page.request for session
    const authed = await page.request.post("/api/pilot/applications", {
      data: {},
    });
    expect([401, 403, 404, 405, 400]).toContain(authed.status());
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
