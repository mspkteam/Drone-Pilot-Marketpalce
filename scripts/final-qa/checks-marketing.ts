import type { Browser } from "playwright";
import {
  ACCOUNTS,
  BASE,
  DEMO_PASSWORD,
  fail,
  gotoOk,
  loginAs,
  logoutViaUi,
  pass,
  type QaCheckResult,
} from "./helpers";

/** Final QA: Client #14/#16, Pilot #9/#10 — hire CTA role gating + public profiles. */
export async function runMarketingChecks(
  browser: Browser,
): Promise<QaCheckResult[]> {
  const results: QaCheckResult[] = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    // Guest: Hire CTA visible on marketing dual-path pages
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    const guestHire = page.getByRole("link", { name: /Hire a Pilot/i });
    if ((await guestHire.count()) > 0) {
      results.push(
        pass("C14-guest", "Marketing", "Guest sees Hire a Pilot CTA", "Home dual-path"),
      );
    } else {
      // Home may use different CTA wording; check for-clients path
      await page.goto(`${BASE}/for-clients`, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      const hire2 = page.getByRole("link", { name: /Hire a (Pilot|Drone Pilot)|Hire a Captain/i });
      results.push(
        (await hire2.count()) > 0
          ? pass("C14-guest", "Marketing", "Guest sees Hire CTA", "/for-clients")
          : fail("C14-guest", "Marketing", "Guest sees Hire CTA", "No hire link found"),
      );
    }

    // Guest captains club hire → register
    await page.goto(`${BASE}/captains-club`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    const hireCaptain = page.getByRole("link", { name: /Hire a Captain/i }).first();
    if ((await hireCaptain.count()) > 0) {
      const href = await hireCaptain.getAttribute("href");
      results.push(
        href?.includes("register") || href?.includes("role=client")
          ? pass("C14", "Client", "Hire a Captain redirect (guest)", href ?? "")
          : fail("C14", "Client", "Hire a Captain redirect (guest)", `Unexpected href ${href}`),
      );
    } else {
      results.push(
        fail("C14", "Client", "Hire a Captain redirect (guest)", "Hire a Captain link missing"),
      );
    }

    // Public find pilots directory
    const pilotsNav = await gotoOk(page, "/pilots");
    if (!pilotsNav.ok) {
      results.push(fail("C20", "Client", "View profile / Find Pilots public", pilotsNav.detail));
    } else {
      const profileLink = page.locator('a[href^="/pilots/"]').first();
      if ((await profileLink.count()) === 0) {
        results.push(
          pass(
            "C20",
            "Client",
            "View profile / Find Pilots public",
            "Directory loaded (no public pilots to open)",
          ),
        );
      } else {
        const href = await profileLink.getAttribute("href");
        await Promise.all([
          page.waitForURL(/\/pilots\/[^/]+/, { timeout: 30_000 }),
          profileLink.click(),
        ]).catch(() => undefined);
        if (page.url().includes("/dashboard/client/")) {
          results.push(
            fail(
              "C20",
              "Client",
              "View profile / Find Pilots public",
              "Public directory linked to client dashboard route",
            ),
          );
        } else if (/\/pilots\/[^/]+/.test(page.url())) {
          const broken = await page.locator("body").innerText();
          results.push(
            /could not be found|404/i.test(broken)
              ? fail("C20", "Client", "View profile / Find Pilots public", "Profile 404")
              : pass("C20", "Client", "View profile / Find Pilots public", href ?? page.url()),
          );
        } else {
          results.push(
            fail("C20", "Client", "View profile / Find Pilots public", `Ended at ${page.url()}`),
          );
        }
      }
    }

    // Pilot logged in: Hire CTAs hidden
    await loginAs(page, ACCOUNTS.pilot, DEMO_PASSWORD);
    await page.goto(`${BASE}/about`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    const pilotHire = page.getByRole("link", {
      name: /Hire a (Pilot|Drone Pilot)|Hire a Captain/i,
    });
    results.push(
      (await pilotHire.count()) === 0
        ? pass("C16-pilot", "Client", "Hire CTAs hidden for signed-in pilots", "/about")
        : fail(
            "C16-pilot",
            "Client",
            "Hire CTAs hidden for signed-in pilots",
            `Found ${(await pilotHire.count())} hire link(s)`,
          ),
    );

    // Pilot cannot hire captain on captains club
    await page.goto(`${BASE}/captains-club`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    const pilotCaptainHire = page.getByRole("link", { name: /Hire a Captain/i });
    results.push(
      (await pilotCaptainHire.count()) === 0
        ? pass("P10", "Pilot", "Pilot cannot hire a captain", "Hire link hidden")
        : fail("P10", "Pilot", "Pilot cannot hire a captain", "Hire a Captain still visible"),
    );

    // Public pilot profile hire CTA for pilot viewer
    const pub = await gotoOk(page, "/pilots");
    if (pub.ok) {
      const link = page.locator('a[href^="/pilots/"]').first();
      if ((await link.count()) > 0) {
        await Promise.all([
          page.waitForURL(/\/pilots\/[^/]+/, { timeout: 30_000 }),
          link.click(),
        ]).catch(() => undefined);
        if (!/\/pilots\/[^/]+/.test(page.url())) {
          results.push(
            fail(
              "P9",
              "Pilot",
              "Hire via marketplace on public profile (pilot viewer)",
              `Could not open public profile (ended at ${page.url()})`,
            ),
          );
        } else {
          const hireOnProfile = page.getByRole("link", {
            name: /^Hire via marketplace$/i,
          });
          results.push(
            (await hireOnProfile.count()) === 0
              ? pass("P9", "Pilot", "Hire via marketplace on public profile (pilot viewer)", "Hidden")
              : fail(
                  "P9",
                  "Pilot",
                  "Hire via marketplace on public profile (pilot viewer)",
                  "Hire action still shown to pilot",
                ),
          );
        }
      } else {
        results.push(
          pass("P9", "Pilot", "Hire via marketplace on public profile (pilot viewer)", "No pilots"),
        );
      }
    }

    await logoutViaUi(page);
  } catch (err) {
    results.push(
      fail(
        "MKT",
        "Marketing",
        "Marketing / hire CTA suite",
        err instanceof Error ? err.message : String(err),
      ),
    );
  } finally {
    await page.close();
  }

  return results;
}
