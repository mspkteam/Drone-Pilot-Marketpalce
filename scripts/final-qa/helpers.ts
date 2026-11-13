import type { Page } from "playwright";

export type QaRole = "client" | "pilot" | "admin" | "guest";

export type QaCheckResult = {
  id: string;
  section: "Client" | "Pilot" | "Admin" | "Marketing" | "Unit";
  title: string;
  status: "pass" | "fail" | "skip";
  detail?: string;
};

export const BASE =
  process.env.FINAL_QA_BASE_URL?.replace(/\/$/, "") ??
  process.env.SMOKE_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export const DEMO_PASSWORD =
  process.env.FINAL_QA_PASSWORD ??
  process.env.SMOKE_ADMIN_PASSWORD ??
  "Demo123!";

export const ACCOUNTS = {
  client: process.env.FINAL_QA_CLIENT_EMAIL ?? "client@dronepilot.local",
  pilot: process.env.FINAL_QA_PILOT_EMAIL ?? "pilot@dronepilot.local",
  pilotA1: process.env.FINAL_QA_PILOT_A1_EMAIL ?? "pilot-a1@dronepilot.local",
  admin: process.env.FINAL_QA_ADMIN_EMAIL ?? "admin@dronepilot.local",
} as const;

export function pass(
  id: string,
  section: QaCheckResult["section"],
  title: string,
  detail?: string,
): QaCheckResult {
  return { id, section, title, status: "pass", detail };
}

export function fail(
  id: string,
  section: QaCheckResult["section"],
  title: string,
  detail: string,
): QaCheckResult {
  return { id, section, title, status: "fail", detail };
}

export function skip(
  id: string,
  section: QaCheckResult["section"],
  title: string,
  detail: string,
): QaCheckResult {
  return { id, section, title, status: "skip", detail };
}

export async function loginAs(
  page: Page,
  email: string,
  password = DEMO_PASSWORD,
): Promise<void> {
  await page.goto(`${BASE}/login`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  // Wait for client LoginForm hydration so submit is handled by React, not a native GET.
  const emailInput = page.locator('input[name="email"]');
  await emailInput.waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await emailInput.fill(email);
  await page.locator('input[name="password"]').fill(password);
  await Promise.all([
    page.waitForURL(/\/dashboard\//, { timeout: 60_000 }),
    page.getByRole("button", { name: /^Log in$/i }).click(),
  ]).catch(async (err) => {
    const alert = (
      await page.locator('[role="alert"]').innerText().catch(() => "")
    ).trim();
    const url = page.url();
    throw new Error(
      `Login failed for ${email}. URL=${url}${alert ? ` alert=${alert}` : ""}. ${String(err)}`,
    );
  });
}

export async function logoutViaUi(page: Page): Promise<void> {
  // Prefer clearing session by visiting login after sign-out if available.
  await page.goto(`${BASE}/api/auth/signout`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  }).catch(() => undefined);
  const confirm = page.locator('button[type="submit"]');
  if (await confirm.count()) {
    await confirm.first().click().catch(() => undefined);
  }
  await page.goto(`${BASE}/login`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
}

export async function pageLooksBroken(page: Page): Promise<string | null> {
  const url = page.url();
  if (url.includes("/login") && !url.includes("callback")) {
    // Caller decides if login redirect is expected.
  }
  const body = (await page.locator("body").innerText().catch(() => "")).slice(
    0,
    4000,
  );
  if (/Application error|Internal Server Error|Unhandled Runtime Error/i.test(body)) {
    return "Page showed an application/runtime error";
  }
  if (/This page could not be found|404/i.test(body) && /not found/i.test(body)) {
    return "Page looks like a 404";
  }
  return null;
}

export async function gotoOk(
  page: Page,
  path: string,
): Promise<{ ok: true } | { ok: false; detail: string }> {
  const res = await page.goto(`${BASE}${path}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  if (res && res.status() >= 500) {
    return { ok: false, detail: `HTTP ${res.status()} for ${path}` };
  }
  if (page.url().includes("/login") && path.startsWith("/dashboard")) {
    return { ok: false, detail: `Redirected to login for ${path}` };
  }
  const broken = await pageLooksBroken(page);
  if (broken) return { ok: false, detail: `${broken} on ${path}` };
  return { ok: true };
}
