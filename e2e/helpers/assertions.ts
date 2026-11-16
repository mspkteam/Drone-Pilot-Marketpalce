import { expect, type Page, type Response } from "@playwright/test";

const BROKEN_PATTERNS =
  /Application error|Internal Server Error|Unhandled Runtime Error|MIDDLEWARE_INVOCATION_FAILED/i;

export async function assertNoAppCrash(page: Page): Promise<void> {
  const body = (await page.locator("body").innerText().catch(() => "")).slice(
    0,
    6000,
  );
  expect(body, "page should not show a fatal app error").not.toMatch(
    BROKEN_PATTERNS,
  );
}

export async function assertNotFoundNotShown(
  page: Page,
  pathHint?: string,
): Promise<void> {
  const body = (await page.locator("body").innerText().catch(() => "")).slice(
    0,
    4000,
  );
  if (/This page could not be found/i.test(body) && /404/i.test(body)) {
    throw new Error(`Unexpected 404${pathHint ? ` on ${pathHint}` : ""}`);
  }
}

export async function assertHttpOk(
  response: Response | null,
  path: string,
): Promise<void> {
  expect(response, `navigation response for ${path}`).not.toBeNull();
  const status = response!.status();
  expect(
    status,
    `HTTP status for ${path}`,
  ).toBeLessThan(500);
}

export async function assertOnDashboard(
  page: Page,
  role: "client" | "pilot" | "admin",
): Promise<void> {
  await expect(page).toHaveURL(new RegExp(`/dashboard/${role}`), {
    timeout: 60_000,
  });
  await assertNoAppCrash(page);
}

export function classifyNetworkFailure(url: string, status: number): string {
  if (/vercel\.app|neon\.tech|blob\.vercel-storage/i.test(url) && status >= 500) {
    return "third-party-or-hosting";
  }
  if (status >= 500) return "app-server";
  if (status === 401 || status === 403) return "auth";
  if (status === 404) return "not-found";
  return "client-or-other";
}
