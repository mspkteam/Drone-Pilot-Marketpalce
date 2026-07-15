/**
 * Click-through Admin sidebar + probe key APIs with the logged-in session.
 * Usage: npx tsx scripts/smoke-admin-clickthrough.ts
 */
import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.SMOKE_ADMIN_EMAIL ?? "admin@dronepilot.local";
const PASSWORD = process.env.SMOKE_ADMIN_PASSWORD ?? "Demo123!";

const API_PROBES = [
  "/api/admin/stats",
  "/api/admin/users",
  "/api/admin/jobs",
  "/api/admin/verifications",
  "/api/admin/subscriptions",
  "/api/admin/payments",
  "/api/admin/disputes",
  "/api/admin/squadron-voting",
  "/api/admin/certificate-engine",
  "/api/admin/badge-engine",
  "/api/admin/shop-engine",
  "/api/admin/regions",
  "/api/admin/cms-engine",
  "/api/admin/permissions",
  "/api/admin/configuration",
  "/api/admin/conversations",
  "/api/admin/support/chats",
] as const;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const failures: string[] = [];

  try {
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await Promise.all([
      page.waitForURL(/\/dashboard\//, { timeout: 60000 }),
      page.click('button[type="submit"]'),
    ]);
    console.log(`Logged in → ${page.url()}`);

    await page.goto(`${BASE}/dashboard/admin`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(500);

    const navLinks = page.locator(
      'aside a[href^="/dashboard/admin"], nav a[href^="/dashboard/admin"], .dashboard-sidebar a[href^="/dashboard/admin"]',
    );
    const count = await navLinks.count();
    console.log(`Sidebar admin links found: ${count}`);

    const hrefs = new Set<string>();
    for (let i = 0; i < count; i += 1) {
      const href = await navLinks.nth(i).getAttribute("href");
      if (href) hrefs.add(href.split("?")[0]!);
    }

    for (const href of [...hrefs].sort()) {
      try {
        const link = page.locator(`a[href="${href}"]`).first();
        await link.click({ timeout: 15000 });
        await page.waitForTimeout(700);
        const url = page.url();
        const body = (await page.locator("body").innerText()).slice(0, 2500);
        if (/Application error|Internal Server Error|Unhandled Runtime Error/i.test(body)) {
          failures.push(`CLICK ${href} showed error on ${url}`);
          console.log(`FAIL  click ${href}`);
        } else if (url.includes("/login")) {
          failures.push(`CLICK ${href} redirected to login`);
          console.log(`FAIL  click ${href} → login`);
        } else {
          console.log(`OK    click ${href} → ${url.replace(BASE, "")}`);
        }
      } catch (err) {
        failures.push(
          `CLICK ${href}: ${err instanceof Error ? err.message : String(err)}`,
        );
        console.log(`FAIL  click ${href}`);
      }
    }

    console.log("\n—— API probes ——");
    for (const api of API_PROBES) {
      const res = await page.request.get(`${BASE}${api}`);
      const status = res.status();
      if (status >= 400) {
        const text = (await res.text()).slice(0, 200);
        failures.push(`API ${api} → ${status} ${text}`);
        console.log(`FAIL  ${api} → ${status}`);
      } else {
        console.log(`OK    ${api} → ${status}`);
      }
    }
  } finally {
    await browser.close();
  }

  console.log("\n—— Summary ——");
  if (failures.length) {
    for (const f of failures) console.log(`- ${f}`);
    process.exit(1);
  }
  console.log("All click-throughs and API probes passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
