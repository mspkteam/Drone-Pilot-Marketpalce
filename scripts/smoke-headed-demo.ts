/**
 * Headed Playwright demo: register a brand-new user, then log in as that user.
 * Does NOT use seeded demo accounts.
 *
 * Usage:
 *   DISPLAY=:1 HEADED=1 SMOKE_BASE_URL=https://drone-pilot-marketpalce.vercel.app \
 *     npx tsx scripts/smoke-headed-demo.ts
 *
 * Optional:
 *   SMOKE_ROLE=client|pilot   (default client)
 *   SMOKE_SLOW_MO_MS=400
 */
import { chromium, type Page } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "https://drone-pilot-marketpalce.vercel.app";
const HEADED = process.env.HEADED !== "0" && process.env.HEADED !== "false";
const SLOW_MO_MS = Number(process.env.SMOKE_SLOW_MO_MS ?? "400");
const ROLE = process.env.SMOKE_ROLE === "pilot" ? "pilot" : "client";
const PASSWORD = `QaTemp!${Date.now().toString().slice(-6)}A1`;

function uniqueEmail(role: string): string {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  // `.test` hosts auto-verify (no SMTP) per app auth rules.
  return `qa.${role}.${stamp}@example.test`;
}

async function registerNewUser(
  page: Page,
  email: string,
  password: string,
  role: "client" | "pilot",
): Promise<void> {
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle", timeout: 60000 });

  // Role toggle buttons are type=button with role title text.
  const roleButton = page.getByRole("button", {
    name: role === "pilot" ? /Pilot/i : /Client/i,
  });
  await roleButton.first().click();

  await page.locator("#reg-email").fill(email);
  await page.locator("#reg-password").fill(password);
  await page.locator("#reg-confirm").fill(password);

  await Promise.all([
    page.waitForURL(/\/login/, { timeout: 60000 }),
    page.getByRole("button", { name: /Create account/i }).click(),
  ]);
}

async function loginAs(
  page: Page,
  email: string,
  password: string,
  expectHome: RegExp,
): Promise<void> {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await Promise.all([
    page.waitForURL(expectHome, { timeout: 60000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function main() {
  const email = uniqueEmail(ROLE);
  const homePath =
    ROLE === "pilot" ? /\/dashboard\/pilot/ : /\/dashboard\/client/;
  const pages =
    ROLE === "pilot"
      ? [
          "/dashboard/pilot",
          "/dashboard/pilot/jobs",
          "/dashboard/pilot/profile",
          "/dashboard/pilot/subscription",
        ]
      : [
          "/dashboard/client",
          "/dashboard/client/jobs",
          "/dashboard/client/find-pilots",
          "/dashboard/client/bookings",
        ];

  const browser = await chromium.launch({
    headless: !HEADED,
    slowMo: Number.isFinite(SLOW_MO_MS) ? SLOW_MO_MS : 400,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const failures: string[] = [];

  console.log(`Mode: ${HEADED ? "headed" : "headless"} @ ${BASE}`);
  console.log(`New user: ${email} (${ROLE})`);
  console.log(`Password: ${PASSWORD}`);

  try {
    // 1) Register fresh account (UI)
    console.log("\n== STEP 1: Register new user ==");
    try {
      await registerNewUser(page, email, PASSWORD, ROLE);
      console.log(`OK    registered → ${page.url()}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      // If verification UI blocked redirect, capture body for diagnosis.
      const body = await page.locator("body").innerText().catch(() => "");
      failures.push(`Register failed: ${detail}`);
      console.log(`FAIL  register — ${detail}`);
      console.log(body.slice(0, 500));
      throw error;
    }
    await page.waitForTimeout(1200);

    // 2) Negative: wrong password with the NEW email (visible failure)
    console.log("\n== STEP 2: FAIL CASE — wrong password for new user ==");
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "WrongPassword!1");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    const afterBad = page.url();
    const badBody = await page.locator("body").innerText();
    const rejected =
      afterBad.includes("/login") ||
      /invalid|incorrect|failed|wrong|credentials|error/i.test(badBody);
    if (!rejected) {
      failures.push("Wrong-password login unexpectedly reached a dashboard");
      console.log(`FAIL  wrong-password — landed on ${afterBad}`);
    } else {
      failures.push(
        `Assertion demo: wrong password rejected for ${email} (url=${afterBad})`,
      );
      console.log(`FAIL  wrong-password — rejected (${afterBad})`);
    }
    await page.waitForTimeout(1500);

    // 3) Login with the newly registered credentials
    console.log("\n== STEP 3: Login with newly registered user ==");
    await loginAs(page, email, PASSWORD, homePath);
    console.log(`OK    login → ${page.url()}`);

    // 4) Smoke a few role pages
    console.log("\n== STEP 4: Dashboard pages ==");
    for (const path of pages) {
      const response = await page.goto(`${BASE}${path}`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForTimeout(900);
      const status = response?.status() ?? 0;
      if (status >= 500) {
        failures.push(`${path} HTTP ${status}`);
        console.log(`FAIL  ${path} — HTTP ${status}`);
      } else {
        console.log(`OK    ${path}`);
      }
    }
  } catch (error) {
    if (!failures.length) {
      const detail = error instanceof Error ? error.message : String(error);
      failures.push(detail);
    }
  } finally {
    await page.waitForTimeout(1200);
    await browser.close();
  }

  console.log("\n—— Summary ——");
  console.log(`Registered user: ${email}`);
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
