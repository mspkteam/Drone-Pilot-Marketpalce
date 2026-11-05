import { test as base, expect } from "@playwright/test";

/**
 * Shared fixtures:
 * - Pause after every test so headed viewers can see the final state
 * - Optional slowMo is configured in playwright.config when HEADED=1
 */
const pauseMs = Number(
  process.env.E2E_PAUSE_AFTER_TEST_MS ??
    (process.env.HEADED === "1" || process.env.HEADED === "true" ? "2500" : "0"),
);

export const test = base.extend({
  // eslint-disable-next-line no-empty-pattern
  page: async ({ page }, use, testInfo) => {
    await use(page);
    if (Number.isFinite(pauseMs) && pauseMs > 0) {
      testInfo.annotations.push({
        type: "pauseAfterTest",
        description: `${pauseMs}ms`,
      });
      await page.waitForTimeout(pauseMs);
    }
  },
});

export { expect };
