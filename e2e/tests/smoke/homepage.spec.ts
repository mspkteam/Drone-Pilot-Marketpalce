import { test, expect } from "../../fixtures/test";
import { withStep } from "../../helpers/logger";
import { assertNoAppCrash } from "../../helpers/assertions";
import { meaningfulConsoleErrors } from "../../helpers/monitors";

test.describe("Homepage @smoke", () => {
  test("loads hero and key CTAs without crashing", async ({
    homePage,
    page,
    monitor,
  }) => {
    await withStep("Open homepage", async () => {
      await homePage.goto();
    });

    await withStep("Assert hero heading", async () => {
      await homePage.expectHeroVisible();
    });

    await withStep("Assert primary navigation links exist", async () => {
      const loginLink = page.getByRole("link", { name: /Log in|Login/i });
      // Mobile marketing chrome hides auth links behind the hamburger.
      if (!(await loginLink.first().isVisible().catch(() => false))) {
        const menu = page.getByRole("button", { name: /Open menu/i });
        await expect(menu).toBeVisible();
        await menu.click();
      }
      await expect(loginLink.first()).toBeVisible();
      await expect(page.locator("body")).toContainText(/Remote Air|Drone|Pilot/i);
    });

    await withStep("Assert no fatal crash + soft-check console", async () => {
      await assertNoAppCrash(page);
      const bad = meaningfulConsoleErrors(monitor.consoleErrors);
      // Soft: log but only fail on pageerrors / 5xx from same origin
      if (monitor.pageErrors.length) {
        throw new Error(`Page errors: ${monitor.pageErrors.join(" | ")}`);
      }
      const serverFails = monitor.failedRequests.filter(
        (r) => (r.status ?? 0) >= 500 && /drone-pilot-marketpalce\.vercel\.app/i.test(r.url),
      );
      expect(serverFails, `same-origin 5xx: ${JSON.stringify(serverFails)}`).toHaveLength(0);
      if (bad.length) {
        // eslint-disable-next-line no-console
        console.log(`[INFO] Console errors (non-fatal): ${bad.slice(0, 5).join(" | ")}`);
      }
    });
  });
});
