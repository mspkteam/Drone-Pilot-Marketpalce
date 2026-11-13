/**
 * Phase 2 interactive exploration crawler.
 * Usage (from repo root):
 *   HEADED=1 npx tsx e2e/exploration/explore.ts
 */
import { chromium, type Page } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.join(__dirname, "../.env") });

const BASE = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";
const HEADED = process.env.HEADED === "1" || process.env.HEADED === "true";
const OUT = path.join(__dirname, "../artifacts/exploration");

const GUEST_PATHS = [
  "/",
  "/for-clients",
  "/for-pilots",
  "/pricing",
  "/how-it-works",
  "/about",
  "/contact",
  "/pilots",
  "/jobs",
  "/login",
  "/register",
  "/privacy",
  "/terms",
  "/resources",
];

type Finding = {
  path: string;
  status: number;
  buttons: number;
  links: number;
  inputs: number;
  consoleErrors: string[];
  failedRequests: string[];
};

async function inventory(page: Page) {
  const buttons = await page.locator("button:visible").count();
  const links = await page.locator("a:visible").count();
  const inputs = await page.locator("input:visible, textarea:visible, select:visible").count();
  return { buttons, links, inputs };
}

async function explorePath(page: Page, route: string): Promise<Finding> {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  const onConsole = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  };
  const onPageError = (err: Error) => consoleErrors.push(err.message);
  const onResponse = (res: { status: () => number; url: () => string; request: () => { method: () => string } }) => {
    if (res.status() >= 500) {
      failedRequests.push(`${res.status()} ${res.request().method()} ${res.url()}`);
    }
  };
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("response", onResponse);

  const response = await page.goto(`${BASE}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(400);
  const inv = await inventory(page);
  const safeName = route.replace(/\W+/g, "_") || "home";
  await page.screenshot({ path: path.join(OUT, `explore${safeName}.png`), fullPage: true });

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("response", onResponse);

  return {
    path: route,
    status: response?.status() ?? 0,
    ...inv,
    consoleErrors,
    failedRequests,
  };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: !HEADED, slowMo: HEADED ? 150 : 0 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const findings: Finding[] = [];

  console.log(`Exploring guest paths @ ${BASE}`);
  for (const route of GUEST_PATHS) {
    const f = await explorePath(page, route);
    findings.push(f);
    console.log(
      `${f.status} ${route} buttons=${f.buttons} links=${f.links} inputs=${f.inputs} err=${f.consoleErrors.length} failNet=${f.failedRequests.length}`,
    );
  }

  // Register a throwaway client and explore client nav
  const stamp = Date.now();
  const email = `qa.explore.${stamp}@example.test`;
  const password = `QaTemp!${String(stamp).slice(-6)}A1`;
  await page.goto(`${BASE}/register`);
  await page.getByRole("button", { name: /^Client/i }).first().click();
  await page.locator("#reg-email").fill(email);
  await page.locator("#reg-password").fill(password);
  await page.locator("#reg-confirm").fill(password);
  await Promise.all([
    page.waitForURL(/\/login/),
    page.getByRole("button", { name: /Create account/i }).click(),
  ]);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await Promise.all([
    page.waitForURL(/\/dashboard\/client/),
    page.click('button[type="submit"]'),
  ]);

  const clientPaths = [
    "/dashboard/client",
    "/dashboard/client/jobs",
    "/dashboard/client/jobs/new",
    "/dashboard/client/find-pilots",
    "/dashboard/client/bookings",
    "/dashboard/client/messages",
    "/dashboard/client/settings",
  ];
  for (const route of clientPaths) {
    const f = await explorePath(page, route);
    findings.push(f);
    console.log(
      `${f.status} ${route} buttons=${f.buttons} links=${f.links} inputs=${f.inputs}`,
    );
  }

  const reportPath = path.join(OUT, "exploration-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ base: BASE, email, findings }, null, 2));
  console.log(`Wrote ${reportPath}`);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
