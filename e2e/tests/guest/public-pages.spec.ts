import { test, expect } from "@playwright/test";
import { MarketingPage, PUBLIC_NAV } from "../../pages/guest/MarketingPage";
import {
  attachMonitors,
  meaningfulConsoleErrors,
} from "../../helpers/consoleMonitor";

test.describe("Guest — public marketing", () => {
  test("G-01 homepage loads without fatal console/network errors", async ({
    page,
  }) => {
    const mon = attachMonitors(page);
    const m = new MarketingPage(page);
    await m.gotoHome();
    await expect(page).toHaveTitle(/Remote Air|Drone|Pilot/i);
    await page.screenshot({
      path: "artifacts/exploration/guest-home.png",
      fullPage: true,
    });
    expect(meaningfulConsoleErrors(mon.consoleErrors)).toEqual([]);
    expect(mon.failedRequests).toEqual([]);
  });

  for (const item of PUBLIC_NAV) {
    test(`G-02 navigate ${item.path}`, async ({ page }) => {
      const mon = attachMonitors(page);
      await page.goto(item.path);
      await expect(page).not.toHaveURL(/\/login$/);
      expect(page.url()).toContain(item.path);
      await page.screenshot({
        path: `artifacts/exploration/guest${item.path.replace(/\//g, "-") || "-home"}.png`,
      });
      expect(mon.failedRequests.filter((r) => r.startsWith("5"))).toEqual([]);
    });
  }

  test("G-03 public pilots directory", async ({ page }) => {
    await page.goto("/pilots");
    await expect(page.locator("body")).toBeVisible();
    await page.screenshot({ path: "artifacts/exploration/guest-pilots.png" });
  });

  test("G-04 public jobs directory", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.locator("body")).toBeVisible();
  });

  test("G-06 login and register reachable", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await page.goto("/register");
    await expect(page.locator("#reg-email")).toBeVisible();
  });

  test("G-07 legal pages", async ({ page }) => {
    for (const path of ["/privacy", "/terms", "/cookies"]) {
      const res = await page.goto(path);
      expect(res?.status() ?? 0).toBeLessThan(500);
    }
  });
});
