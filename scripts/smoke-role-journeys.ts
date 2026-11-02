/**
 * Smoke key role dashboards against a deployed or local base URL.
 * Usage: SMOKE_BASE_URL=https://... npx tsx scripts/smoke-role-journeys.ts
 */
import { chromium, type Page } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const PASSWORD = process.env.SMOKE_PASSWORD ?? "Demo123!";

type RoleSmoke = {
  name: string;
  email: string;
  homePath: RegExp;
  pages: string[];
};

const ROLES: RoleSmoke[] = [
  {
    name: "client",
    email: process.env.SMOKE_CLIENT_EMAIL ?? "client@dronepilot.local",
    homePath: /\/dashboard\/client/,
    pages: [
      "/dashboard/client",
      "/dashboard/client/jobs",
      "/dashboard/client/jobs/new",
      "/dashboard/client/find-pilots",
      "/dashboard/client/bookings",
      "/dashboard/client/messages",
      "/dashboard/client/payments",
      "/dashboard/client/reviews",
      "/dashboard/client/disputes",
      "/dashboard/client/profile",
      "/dashboard/client/settings",
    ],
  },
  {
    name: "pilot-a6",
    email: process.env.SMOKE_PILOT_EMAIL ?? "pilot@dronepilot.local",
    homePath: /\/dashboard\/pilot/,
    pages: [
      "/dashboard/pilot",
      "/dashboard/pilot/jobs",
      "/dashboard/pilot/applications",
      "/dashboard/pilot/bookings",
      "/dashboard/pilot/messages",
      "/dashboard/pilot/subscription",
      "/dashboard/pilot/verifications",
      "/dashboard/pilot/certificates",
      "/dashboard/pilot/shop",
      "/dashboard/pilot/profile",
      "/dashboard/pilot/support",
    ],
  },
  {
    name: "pilot-a1",
    email: process.env.SMOKE_PILOT_A1_EMAIL ?? "pilot-a1@dronepilot.local",
    homePath: /\/dashboard\/pilot/,
    pages: [
      "/dashboard/pilot",
      "/dashboard/pilot/jobs",
      "/dashboard/pilot/locked-jobs",
      "/dashboard/pilot/subscription",
    ],
  },
  {
    name: "moderator",
    email: process.env.SMOKE_MODERATOR_EMAIL ?? "moderator@dronepilot.local",
    homePath: /\/dashboard\/admin/,
    pages: [
      "/dashboard/admin",
      "/dashboard/admin/jobs",
      "/dashboard/admin/verifications",
      "/dashboard/admin/disputes",
      "/dashboard/admin/support",
    ],
  },
];

const PUBLIC_PAGES = [
  "/",
  "/login",
  "/register",
  "/for-clients",
  "/for-pilots",
  "/pricing",
  "/how-it-works",
  "/pilots",
  "/jobs",
  "/contact",
  "/waitlist",
];

const FAILURE_PATTERNS = [
  /Application error/i,
  /Internal Server Error/i,
  /This page could not be found/i,
  /Unhandled Runtime Error/i,
  /Server Error/i,
];

async function assertHealthy(page: Page, path: string): Promise<string | null> {
  const response = await page.goto(`${BASE}${path}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  const status = response?.status() ?? 0;
  if (status >= 500) return `${path} HTTP ${status}`;
  const body = await page.locator("body").innerText().catch(() => "");
  for (const pattern of FAILURE_PATTERNS) {
    if (pattern.test(body)) return `${path} matched ${pattern}`;
  }
  if (status === 404) return `${path} HTTP 404`;
  return null;
}

async function login(page: Page, email: string, homePath: RegExp): Promise<void> {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await Promise.all([
    page.waitForURL(homePath, { timeout: 60000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results: { name: string; ok: boolean; detail: string }[] = [];

  try {
    const guest = await browser.newPage();
    console.log(`\n== Public pages @ ${BASE} ==`);
    for (const path of PUBLIC_PAGES) {
      const err = await assertHealthy(guest, path);
      if (err) {
        console.log(`FAIL  ${path} — ${err}`);
        results.push({ name: `public:${path}`, ok: false, detail: err });
      } else {
        console.log(`OK    ${path}`);
        results.push({ name: `public:${path}`, ok: true, detail: "ok" });
      }
    }
    await guest.close();

    for (const role of ROLES) {
      console.log(`\n== Role ${role.name} (${role.email}) ==`);
      const page = await browser.newPage();
      try {
        await login(page, role.email, role.homePath);
        console.log(`Logged in → ${page.url()}`);
        results.push({
          name: `${role.name}:login`,
          ok: true,
          detail: page.url(),
        });
        for (const path of role.pages) {
          const err = await assertHealthy(page, path);
          if (err) {
            console.log(`FAIL  ${path} — ${err}`);
            results.push({ name: `${role.name}:${path}`, ok: false, detail: err });
          } else {
            console.log(`OK    ${path}`);
            results.push({ name: `${role.name}:${path}`, ok: true, detail: "ok" });
          }
        }
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        console.log(`FAIL  login/session — ${detail}`);
        results.push({ name: `${role.name}:login`, ok: false, detail });
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log("\n—— Summary ——");
  console.log(`Passed: ${passed}/${results.length}`);
  if (failed.length) {
    console.log("Failures:");
    for (const f of failed) console.log(` - ${f.name}: ${f.detail}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
