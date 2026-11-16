import type { Page } from "@playwright/test";
import { assertHttpOk, assertNoAppCrash } from "./assertions";
import { logStep } from "./logger";

export async function gotoPath(
  page: Page,
  path: string,
  opts?: { allowLoginRedirect?: boolean },
): Promise<void> {
  logStep("START", `goto ${path}`);
  const res = await page.goto(path, { waitUntil: "domcontentloaded" });
  await assertHttpOk(res, path);

  if (
    !opts?.allowLoginRedirect &&
    page.url().includes("/login") &&
    path.startsWith("/dashboard")
  ) {
    logStep("FAIL", `goto ${path}`, "redirected to login");
    throw new Error(`Redirected to login for protected path ${path}`);
  }

  await assertNoAppCrash(page);
  logStep("PASS", `goto ${path}`, page.url());
}

export async function softGoto(
  page: Page,
  path: string,
): Promise<{ ok: boolean; detail?: string; url: string }> {
  try {
    const res = await page.goto(path, { waitUntil: "domcontentloaded" });
    if (res && res.status() >= 500) {
      return {
        ok: false,
        detail: `HTTP ${res.status()}`,
        url: page.url(),
      };
    }
    const body = (await page.locator("body").innerText().catch(() => "")).slice(
      0,
      4000,
    );
    if (/Application error|Internal Server Error|Unhandled Runtime Error/i.test(body)) {
      return { ok: false, detail: "application/runtime error", url: page.url() };
    }
    return { ok: true, url: page.url() };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
      url: page.url(),
    };
  }
}
