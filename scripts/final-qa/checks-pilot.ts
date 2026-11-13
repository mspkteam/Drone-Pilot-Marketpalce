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

/** Final QA Pilot Done rows that are reliably automatable. */
export async function runPilotChecks(browser: Browser): Promise<QaCheckResult[]> {
  const results: QaCheckResult[] = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await loginAs(page, ACCOUNTS.pilot, DEMO_PASSWORD);

    // P4 — dashboard + deep links stay on dashboard (not forced login)
    {
      const home = await gotoOk(page, "/dashboard/pilot");
      results.push(
        home.ok
          ? pass("P4", "Pilot", "First login / dashboard visible", page.url())
          : fail("P4", "Pilot", "First login / dashboard visible", home.detail),
      );

      for (const path of [
        "/dashboard/pilot/jobs",
        "/dashboard/pilot/portfolio",
        "/dashboard/pilot/verifications",
        "/dashboard/pilot/profile",
      ] as const) {
        const nav = await gotoOk(page, path);
        if (!nav.ok) {
          results.push(
            fail("P4-deep", "Pilot", `Deep link stays usable: ${path}`, nav.detail),
          );
        }
      }
      if (!results.some((r) => r.id === "P4-deep" && r.status === "fail")) {
        results.push(
          pass("P4-deep", "Pilot", "Deep links stay on pilot dashboard", "jobs/portfolio/verifications/profile"),
        );
      }
    }

    // P11 — proposals / drafts area
    {
      const nav = await gotoOk(page, "/dashboard/pilot/proposals");
      results.push(
        nav.ok
          ? pass("P11", "Pilot", "Where drafts are saved (proposals reachable)", page.url())
          : fail("P11", "Pilot", "Where drafts are saved (proposals reachable)", nav.detail),
      );
    }

    // P13 — A-1 Fast Forward disabled (use A-1 account if available)
    {
      await logoutViaUi(page);
      try {
        await loginAs(page, ACCOUNTS.pilotA1, DEMO_PASSWORD);
        const nav = await gotoOk(page, "/dashboard/pilot/subscription");
        if (!nav.ok) {
          results.push(
            fail("P13", "Pilot", "A-1 Fast Forward button disabled", nav.detail),
          );
        } else {
          const ff = page.getByRole("button", { name: /Fast Forward/i });
          if ((await ff.count()) === 0) {
            results.push(
              pass("P13", "Pilot", "A-1 Fast Forward button disabled", "No FF control (or gated)"),
            );
          } else {
            const disabled = await ff.first().isDisabled();
            results.push(
              disabled
                ? pass("P13", "Pilot", "A-1 Fast Forward button disabled", "Disabled")
                : fail("P13", "Pilot", "A-1 Fast Forward button disabled", "Button enabled for A-1"),
            );
          }
        }
        await logoutViaUi(page);
        await loginAs(page, ACCOUNTS.pilot, DEMO_PASSWORD);
      } catch (err) {
        results.push(
          fail(
            "P13",
            "Pilot",
            "A-1 Fast Forward button disabled",
            err instanceof Error ? err.message : String(err),
          ),
        );
        await loginAs(page, ACCOUNTS.pilot, DEMO_PASSWORD).catch(() => undefined);
      }
    }

    // P21 — squadron voting (A-6 captain seed)
    {
      const nav = await gotoOk(page, "/dashboard/pilot/squadron-voting");
      if (!nav.ok) {
        results.push(
          fail("P21", "Pilot", "Dispute voting / squadron voting page", nav.detail),
        );
      } else {
        const body = await page.locator("body").innerText();
        results.push(
          /Squadron Voting|Peer Moderation|A-4|ballot|poll/i.test(body)
            ? pass("P21", "Pilot", "Dispute voting / squadron voting page", "Page loaded")
            : fail("P21", "Pilot", "Dispute voting / squadron voting page", "Unexpected body"),
        );
      }
    }

    // P32 — license on profile
    {
      const nav = await gotoOk(page, "/dashboard/pilot/profile");
      if (!nav.ok) {
        results.push(fail("P32", "Pilot", "License number on pilot dashboard profile", nav.detail));
      } else {
        const body = await page.locator("body").innerText();
        results.push(
          /LICENSE|License/i.test(body)
            ? pass("P32", "Pilot", "License number on pilot dashboard profile", "License field present")
            : fail("P32", "Pilot", "License number on pilot dashboard profile", "License label missing"),
        );
      }
    }

    // P33 — verifications
    {
      const nav = await gotoOk(page, "/dashboard/pilot/verifications");
      results.push(
        nav.ok
          ? pass("P33", "Pilot", "Verification cards / amendments UI reachable", page.url())
          : fail("P33", "Pilot", "Verification cards / amendments UI reachable", nav.detail),
      );
    }

    // P31 — rank vs profile progress pages distinct
    {
      const sub = await gotoOk(page, "/dashboard/pilot/subscription");
      const prof = await gotoOk(page, "/dashboard/pilot/profile");
      results.push(
        sub.ok && prof.ok
          ? pass("P31", "Pilot", "Rank progress ≠ profile progress (pages reachable)", "subscription + profile")
          : fail("P31", "Pilot", "Rank progress ≠ profile progress (pages reachable)", "Missing page"),
      );
    }

    results.push(
      skipBlocked("P25", "Payment method realtime"),
      skipBlocked("P28", "Product pictures vs name"),
      skipBlocked("P29", "Payment + SMTP realtime"),
    );

    await logoutViaUi(page);
  } catch (err) {
    results.push(
      fail(
        "PILOT",
        "Pilot",
        "Pilot suite",
        err instanceof Error ? err.message : String(err),
      ),
    );
  } finally {
    await page.close();
  }

  return results;
}

function skipBlocked(id: string, title: string): QaCheckResult {
  return {
    id,
    section: "Pilot",
    title,
    status: "skip",
    detail: "Blocked on client (Stripe / assets / timezone)",
  };
}
