import type { Page } from "@playwright/test";
import { ACCOUNTS, type AccountKey } from "../data/accounts";
import { logStep } from "./logger";

export async function loginAs(
  page: Page,
  accountKey: AccountKey,
): Promise<void> {
  const account = ACCOUNTS[accountKey];
  logStep("START", `loginAs(${accountKey})`, account.email);

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  const emailInput = page.locator('input[name="email"]');
  await emailInput.waitFor({ state: "visible", timeout: 30_000 });
  // Allow LoginForm hydration so submit is handled by React.
  await page.waitForLoadState("networkidle").catch(() => undefined);

  await emailInput.fill(account.email);
  await page.locator('input[name="password"]').fill(account.password);

  await Promise.all([
    page.waitForURL(/\/dashboard\//, { timeout: 60_000 }),
    page.getByRole("button", { name: /^Log in$/i }).click(),
  ]).catch(async (err) => {
    const alert = (
      await page.locator('[role="alert"]').innerText().catch(() => "")
    ).trim();
    logStep(
      "FAIL",
      `loginAs(${accountKey})`,
      `URL=${page.url()}${alert ? ` alert=${alert}` : ""}`,
    );
    throw new Error(
      `Login failed for ${account.email}. URL=${page.url()}${
        alert ? ` alert=${alert}` : ""
      }. ${String(err)}`,
    );
  });

  logStep("PASS", `loginAs(${accountKey})`, page.url());
}

export async function logout(page: Page): Promise<void> {
  logStep("START", "logout");
  await page.goto("/api/auth/signout", { waitUntil: "domcontentloaded" }).catch(
    () => undefined,
  );
  const confirm = page.locator('button[type="submit"]');
  if (await confirm.count()) {
    await confirm.first().click().catch(() => undefined);
  }
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  logStep("PASS", "logout");
}

export async function expectProtectedRedirect(
  page: Page,
  path: string,
): Promise<void> {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/login/, { timeout: 30_000 });
}
