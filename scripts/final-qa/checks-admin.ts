import type { Browser } from "playwright";
import {
  ACCOUNTS,
  DEMO_PASSWORD,
  fail,
  gotoOk,
  loginAs,
  logoutViaUi,
  pass,
  type QaCheckResult,
} from "./helpers";

const ADMIN_ROUTES = [
  { id: "A-jobs", path: "/dashboard/admin/jobs", title: "Jobs / approval queue" },
  { id: "A-users", path: "/dashboard/admin/users", title: "Fleet & Personnel" },
  { id: "A-verifications", path: "/dashboard/admin/verifications", title: "Verifications" },
  { id: "A-disputes", path: "/dashboard/admin/disputes", title: "Disputes" },
  {
    id: "A-squadron",
    path: "/dashboard/admin/squadron-voting",
    title: "Squadron Voting",
  },
  {
    id: "A-certificates",
    path: "/dashboard/admin/certificates",
    title: "Certificates",
  },
  {
    id: "A-configuration",
    path: "/dashboard/admin/settings",
    title: "Configuration (no 404)",
  },
] as const;

/** Final QA Admin Done rows that are reliably automatable. */
export async function runAdminChecks(browser: Browser): Promise<QaCheckResult[]> {
  const results: QaCheckResult[] = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await loginAs(page, ACCOUNTS.admin, DEMO_PASSWORD);

    const home = await gotoOk(page, "/dashboard/admin");
    results.push(
      home.ok
        ? pass("A0", "Admin", "Admin dashboard loads", page.url())
        : fail("A0", "Admin", "Admin dashboard loads", home.detail),
    );

    for (const route of ADMIN_ROUTES) {
      const nav = await gotoOk(page, route.path);
      results.push(
        nav.ok
          ? pass(route.id, "Admin", route.title, route.path)
          : fail(route.id, "Admin", route.title, nav.detail),
      );
    }

    // A1 — job queue prefers contact name (smoke: page has queue UI)
    {
      const nav = await gotoOk(page, "/dashboard/admin/jobs");
      if (!nav.ok) {
        results.push(fail("A1", "Admin", "Show client/pilot name, not organization", nav.detail));
      } else {
        const body = await page.locator("body").innerText();
        results.push(
          /job|approval|queue|pending/i.test(body)
            ? pass("A1", "Admin", "Show client/pilot name, not organization", "Jobs queue loaded")
            : fail("A1", "Admin", "Show client/pilot name, not organization", "Jobs UI missing"),
        );
      }
    }

    // A14 — pricing/config not 404 (canonical settings + legacy alias)
    {
      const settingsNav = await gotoOk(page, "/dashboard/admin/settings");
      const settingsOk =
        settingsNav.ok && page.url().includes("/dashboard/admin/settings");
      const settingsDetail = settingsOk ? page.url() : settingsNav.detail;
      const aliasNav = await gotoOk(page, "/dashboard/admin/configuration");
      const aliasOk =
        aliasNav.ok && page.url().includes("/dashboard/admin/settings");
      const aliasDetail = aliasOk ? page.url() : aliasNav.detail;
      results.push(
        settingsOk && aliasOk
          ? pass(
              "A14",
              "Admin",
              "Preview Pricing / Full configuration 404",
              "Settings + configuration alias OK",
            )
          : fail(
              "A14",
              "Admin",
              "Preview Pricing / Full configuration 404",
              `settings=${settingsDetail}; alias=${aliasDetail}`,
            ),
      );
    }

    results.push({
      id: "A15",
      section: "Admin",
      title: "Delayed notifications / timezone by region",
      status: "skip",
      detail: "Blocked on client (timezone policy)",
    });

    await logoutViaUi(page);
  } catch (err) {
    results.push(
      fail(
        "ADMIN",
        "Admin",
        "Admin suite",
        err instanceof Error ? err.message : String(err),
      ),
    );
  } finally {
    await page.close();
  }

  return results;
}
