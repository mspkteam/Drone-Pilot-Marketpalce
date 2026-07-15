/**
 * Smoke-walk Admin dashboard nav tabs (requires local `npm run dev`).
 * Usage: npx tsx scripts/smoke-admin-tabs.ts
 */
import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.SMOKE_ADMIN_EMAIL ?? "admin@dronepilot.local";
const PASSWORD = process.env.SMOKE_ADMIN_PASSWORD ?? "Demo123!";

const ADMIN_TABS = [
  "/dashboard/admin",
  "/dashboard/admin/users",
  "/dashboard/admin/verifications",
  "/dashboard/admin/jobs",
  "/dashboard/admin/subscriptions",
  "/dashboard/admin/payments",
  "/dashboard/admin/disputes",
  "/dashboard/admin/squadron-voting",
  "/dashboard/admin/certificates",
  "/dashboard/admin/achievements",
  "/dashboard/admin/shop",
  "/dashboard/admin/regions",
  "/dashboard/admin/reports",
  "/dashboard/admin/cms",
  "/dashboard/admin/permissions",
  "/dashboard/admin/settings",
  "/dashboard/admin/messages",
  "/dashboard/admin/support",
] as const;

const FAILURE_PATTERNS = [
  /Application error/i,
  /Internal Server Error/i,
  /This page could not be found/i,
  /Unhandled Runtime Error/i,
  /Server Error/i,
  /something went wrong/i,
];

type Result = {
  path: string;
  status: "ok" | "fail";
  finalUrl: string;
  detail?: string;
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleErrors: string[] = [];
  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
  });

  const results: Result[] = [];

  try {
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await Promise.all([
      page.waitForURL(/\/dashboard\//, { timeout: 60000 }),
      page.click('button[type="submit"]'),
    ]);

    const afterLogin = page.url();
    if (!afterLogin.includes("/dashboard")) {
      throw new Error(`Login did not reach dashboard. Landed on ${afterLogin}`);
    }
    console.log(`Logged in as ${EMAIL} → ${afterLogin}`);

    for (const path of ADMIN_TABS) {
      consoleErrors.length = 0;
      try {
        const response = await page.goto(`${BASE}${path}`, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        await page.waitForTimeout(800);
        const body = (await page.locator("body").innerText()).slice(0, 4000);
        const hit = FAILURE_PATTERNS.find((re) => re.test(body));
        const statusCode = response?.status() ?? 0;
        const finalUrl = page.url();

        if (statusCode >= 500 || hit || consoleErrors.length > 0) {
          results.push({
            path,
            status: "fail",
            finalUrl,
            detail:
              hit?.source ??
              (statusCode >= 500
                ? `HTTP ${statusCode}`
                : consoleErrors[0] ?? "unknown"),
          });
          console.log(`FAIL  ${path} — ${results[results.length - 1]?.detail}`);
        } else if (finalUrl.includes("/login")) {
          results.push({
            path,
            status: "fail",
            finalUrl,
            detail: "Redirected to login",
          });
          console.log(`FAIL  ${path} — redirected to login`);
        } else {
          results.push({ path, status: "ok", finalUrl });
          console.log(`OK    ${path}`);
        }
      } catch (err) {
        results.push({
          path,
          status: "fail",
          finalUrl: page.url(),
          detail: err instanceof Error ? err.message : String(err),
        });
        console.log(`FAIL  ${path} — ${results[results.length - 1]?.detail}`);
      }
    }
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => r.status === "fail");
  console.log("\n—— Summary ——");
  console.log(`Passed: ${results.length - failed.length}/${results.length}`);
  if (failed.length) {
    for (const f of failed) {
      console.log(`- ${f.path}: ${f.detail}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
