/**
 * Short headed Playwright demo for visual QA review.
 * Shows a deliberate login failure, then a successful client login + a few pages.
 *
 * Usage:
 *   HEADED=1 SMOKE_BASE_URL=https://drone-pilot-marketpalce.vercel.app \
 *     npx tsx scripts/smoke-headed-demo.ts
 */
import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "https://drone-pilot-marketpalce.vercel.app";
const HEADED =
  process.env.HEADED !== "0" && process.env.HEADED !== "false";
const SLOW_MO_MS = Number(process.env.SMOKE_SLOW_MO_MS ?? "400");

async function main() {
  const browser = await chromium.launch({
    headless: !HEADED,
    slowMo: Number.isFinite(SLOW_MO_MS) ? SLOW_MO_MS : 400,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const failures: string[] = [];

  console.log(`Mode: ${HEADED ? "headed" : "headless"} @ ${BASE}`);

  try {
    // --- Visible failure case ---
    console.log("\n== FAIL CASE: wrong password ==");
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
    await page.fill('input[name="email"]', "client@dronepilot.local");
    await page.fill('input[name="password"]', "WrongPassword!1");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    const afterBadLogin = page.url();
    const body = await page.locator("body").innerText();
    const failedAsExpected =
      afterBadLogin.includes("/login") ||
      /invalid|incorrect|failed|wrong|credentials|error/i.test(body);

    if (!failedAsExpected) {
      failures.push("Wrong-password login unexpectedly succeeded or showed no error");
      console.log("FAIL  wrong-password — unexpected success");
    } else {
      // Mark as a demonstrated assertion failure for the report/exit code.
      failures.push(
        `Assertion demo: login rejected (url=${afterBadLogin}). This is an intentional FAIL for headed review.`,
      );
      console.log(`FAIL  wrong-password — stayed on login / showed error (${afterBadLogin})`);
    }
    await page.waitForTimeout(1500);

    // --- Passing path ---
    console.log("\n== PASS CASE: valid client login + pages ==");
    await page.fill('input[name="email"]', "client@dronepilot.local");
    await page.fill('input[name="password"]', "Demo123!");
    await Promise.all([
      page.waitForURL(/\/dashboard\/client/, { timeout: 60000 }),
      page.click('button[type="submit"]'),
    ]);
    console.log(`OK    login → ${page.url()}`);

    for (const path of [
      "/dashboard/client",
      "/dashboard/client/jobs",
      "/dashboard/client/find-pilots",
      "/dashboard/client/bookings",
    ]) {
      const response = await page.goto(`${BASE}${path}`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForTimeout(800);
      const status = response?.status() ?? 0;
      if (status >= 500) {
        failures.push(`${path} HTTP ${status}`);
        console.log(`FAIL  ${path} — HTTP ${status}`);
      } else {
        console.log(`OK    ${path}`);
      }
    }
  } finally {
    await page.waitForTimeout(1000);
    await browser.close();
  }

  console.log("\n—— Summary ——");
  if (failures.length) {
    console.log(`Failures (${failures.length}):`);
    for (const f of failures) console.log(` - ${f}`);
    process.exitCode = 1;
  } else {
    console.log("All checks passed.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
