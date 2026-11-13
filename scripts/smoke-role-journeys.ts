/**
 * Smoke key role dashboards against a deployed or local base URL.
 *
 * By default registers NEW client + pilot accounts (no seeded demo users),
 * then logs in with those credentials. Staff roles cannot self-register;
 * include them only with USE_SEED_STAFF=1.
 *
 * Usage:
 *   SMOKE_BASE_URL=https://... npx tsx scripts/smoke-role-journeys.ts
 *   HEADED=1 SMOKE_BASE_URL=https://... npx tsx scripts/smoke-role-journeys.ts
 */
import { chromium, type Page } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const HEADED =
  process.env.HEADED === "1" ||
  process.env.HEADED === "true" ||
  process.env.PLAYWRIGHT_HEADED === "1";
const SLOW_MO_MS = Number(process.env.SMOKE_SLOW_MO_MS ?? (HEADED ? "250" : "0"));
const DEMO_FAILURE = process.env.SMOKE_DEMO_FAILURE === "1";
const USE_SEED_STAFF = process.env.USE_SEED_STAFF === "1";

type RegisterableRole = "client" | "pilot";

type RoleSmoke = {
  name: string;
  registerAs?: RegisterableRole;
  email?: string;
  password?: string;
  homePath: RegExp;
  pages: string[];
};

function uniqueEmail(role: string): string {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  return `qa.${role}.${stamp}@example.test`;
}

function uniquePassword(): string {
  return `QaTemp!${Date.now().toString().slice(-6)}A1`;
}

const SELF_SERVE_ROLES: RoleSmoke[] = [
  {
    name: "client",
    registerAs: "client",
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
    name: "pilot",
    registerAs: "pilot",
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
];

const STAFF_ROLES: RoleSmoke[] = [
  {
    name: "moderator",
    email: process.env.SMOKE_MODERATOR_EMAIL ?? "moderator@dronepilot.local",
    password: process.env.SMOKE_PASSWORD ?? "Demo123!",
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

async function registerNewUser(
  page: Page,
  email: string,
  password: string,
  role: RegisterableRole,
): Promise<void> {
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle", timeout: 60000 });
  await page
    .getByRole("button", { name: role === "pilot" ? /Pilot/i : /Client/i })
    .first()
    .click();
  await page.locator("#reg-email").fill(email);
  await page.locator("#reg-password").fill(password);
  await page.locator("#reg-confirm").fill(password);
  await Promise.all([
    page.waitForURL(/\/login/, { timeout: 60000 }),
    page.getByRole("button", { name: /Create account/i }).click(),
  ]);
}

async function login(
  page: Page,
  email: string,
  password: string,
  homePath: RegExp,
): Promise<void> {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await Promise.all([
    page.waitForURL(homePath, { timeout: 60000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function main() {
  const browser = await chromium.launch({
    headless: !HEADED,
    slowMo: Number.isFinite(SLOW_MO_MS) ? SLOW_MO_MS : 0,
  });
  const results: { name: string; ok: boolean; detail: string }[] = [];
  const created: { role: string; email: string; password: string }[] = [];
  console.log(`Mode: ${HEADED ? "headed" : "headless"} @ ${BASE}`);
  console.log(
    "Auth mode: register NEW client/pilot users (seeded marketplace users skipped)",
  );
  if (!USE_SEED_STAFF) {
    console.log("Staff roles skipped (set USE_SEED_STAFF=1 to include moderator).");
  }

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

    const roles: RoleSmoke[] = [
      ...SELF_SERVE_ROLES,
      ...(USE_SEED_STAFF ? STAFF_ROLES : []),
    ];

    for (const role of roles) {
      const page = await browser.newPage();
      try {
        let email = role.email;
        let password = role.password ?? uniquePassword();

        if (role.registerAs) {
          email = uniqueEmail(role.registerAs);
          password = uniquePassword();
          console.log(`\n== Role ${role.name}: register ${email} ==`);
          await registerNewUser(page, email, password, role.registerAs);
          console.log(`OK    registered → ${page.url()}`);
          results.push({
            name: `${role.name}:register`,
            ok: true,
            detail: email,
          });
          created.push({ role: role.name, email, password });

          if (DEMO_FAILURE) {
            await page.goto(`${BASE}/login`, {
              waitUntil: "networkidle",
              timeout: 60000,
            });
            await page.fill('input[name="email"]', email);
            await page.fill('input[name="password"]', "WrongPassword!1");
            await page.click('button[type="submit"]');
            await page.waitForTimeout(1500);
            const rejected = page.url().includes("/login");
            console.log(
              rejected
                ? `FAIL  ${role.name}:wrong-password — rejected (expected demo)`
                : `FAIL  ${role.name}:wrong-password — unexpected success`,
            );
            results.push({
              name: `${role.name}:wrong-password`,
              ok: false,
              detail: rejected
                ? "wrong password rejected (demo assertion)"
                : "unexpected success",
            });
          }
        } else {
          console.log(`\n== Role ${role.name} (${email}) [seed staff] ==`);
        }

        if (!email) throw new Error("Missing email for role");
        await login(page, email, password, role.homePath);
        console.log(`OK    login → ${page.url()}`);
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
        console.log(`FAIL  ${role.name} — ${detail}`);
        results.push({ name: `${role.name}:flow`, ok: false, detail });
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log("\n—— Created accounts ——");
  for (const c of created) {
    console.log(` - ${c.role}: ${c.email} / ${c.password}`);
  }
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
