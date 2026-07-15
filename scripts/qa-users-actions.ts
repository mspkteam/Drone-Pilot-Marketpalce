import { chromium } from "playwright";
import path from "node:path";

async function main() {
  const BASE = "http://localhost:3000";
  const out = path.join(process.cwd(), "scripts", "qa-users-actions.png");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"]', "admin@dronepilot.local");
  await page.fill('input[name="password"]', "Demo123!");
  await Promise.all([
    page.waitForURL(/\/dashboard\//, { timeout: 60000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.goto(`${BASE}/dashboard/admin/users`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForSelector(".admin-personnel-table", { timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.locator(".admin-personnel-table-wrap").screenshot({ path: out });
  console.log("saved", out);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
