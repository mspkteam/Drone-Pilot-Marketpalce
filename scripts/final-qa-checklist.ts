/**
 * Final Testing QA checklist automation (Done rows + skip Blocked).
 *
 * Prerequisites:
 *   - App running (local `npm run dev` or FINAL_QA_BASE_URL pointing at deploy)
 *   - Seed demo accounts available (client@ / pilot@ / pilot-a1@ / admin@)
 *
 * Usage:
 *   npx tsx scripts/final-qa-checklist.ts
 *   FINAL_QA_BASE_URL=https://your-app.vercel.app npx tsx scripts/final-qa-checklist.ts
 *   FINAL_QA_SUITES=unit,marketing,client,pilot,admin npx tsx scripts/final-qa-checklist.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { runAdminChecks } from "./final-qa/checks-admin";
import { runClientChecks } from "./final-qa/checks-client";
import { runMarketingChecks } from "./final-qa/checks-marketing";
import { runPilotChecks } from "./final-qa/checks-pilot";
import { runUnitChecks } from "./final-qa/checks-unit";
import { BASE, type QaCheckResult } from "./final-qa/helpers";

type Suite = "unit" | "marketing" | "client" | "pilot" | "admin";

function selectedSuites(): Suite[] {
  const raw = process.env.FINAL_QA_SUITES?.trim();
  if (!raw) return ["unit", "marketing", "client", "pilot", "admin"];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as Suite[];
}

function printReport(results: QaCheckResult[]) {
  const passCount = results.filter((r) => r.status === "pass").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const skipCount = results.filter((r) => r.status === "skip").length;

  console.log("\n========== Final QA checklist automation ==========");
  console.log(`Base URL: ${BASE}`);
  console.log(`Results: ${passCount} pass · ${failCount} fail · ${skipCount} skip\n`);

  for (const section of ["Unit", "Marketing", "Client", "Pilot", "Admin"] as const) {
    const rows = results.filter((r) => r.section === section);
    if (!rows.length) continue;
    console.log(`—— ${section} ——`);
    for (const row of rows) {
      const mark =
        row.status === "pass" ? "PASS" : row.status === "fail" ? "FAIL" : "SKIP";
      console.log(
        `${mark.padEnd(4)} ${row.id.padEnd(12)} ${row.title}${row.detail ? ` — ${row.detail}` : ""}`,
      );
    }
    console.log("");
  }

  return { passCount, failCount, skipCount };
}

async function assertBaseReachable(): Promise<void> {
  try {
    const res = await fetch(BASE, { method: "GET", redirect: "follow" });
    void res;
  } catch {
    console.error(`\nCannot reach ${BASE}`);
    console.error("Start the app first, or point at Production:\n");
    console.error("  Terminal 1:  npm run dev");
    console.error("  Terminal 2:  npm run qa:final\n");
    console.error("Or (PowerShell) against Vercel:");
    console.error(
      '  $env:FINAL_QA_BASE_URL="https://YOUR-PRODUCTION-DOMAIN"; npm run qa:final\n',
    );
    process.exit(1);
  }
}

async function main() {
  const suites = selectedSuites();
  const results: QaCheckResult[] = [];

  if (suites.includes("unit")) {
    console.log("Running unit-backed checklist checks…");
    results.push(...runUnitChecks());
  }

  const needsBrowser = suites.some((s) =>
    ["marketing", "client", "pilot", "admin"].includes(s),
  );

  if (needsBrowser) {
    await assertBaseReachable();
    const browser = await chromium.launch({ headless: true });
    try {
      if (suites.includes("marketing")) {
        console.log("Running marketing / hire CTA checks…");
        results.push(...(await runMarketingChecks(browser)));
      }
      if (suites.includes("client")) {
        console.log("Running client dashboard checks…");
        results.push(...(await runClientChecks(browser)));
      }
      if (suites.includes("pilot")) {
        console.log("Running pilot dashboard checks…");
        results.push(...(await runPilotChecks(browser)));
      }
      if (suites.includes("admin")) {
        console.log("Running admin dashboard checks…");
        results.push(...(await runAdminChecks(browser)));
      }
    } finally {
      await browser.close();
    }
  }

  const summary = printReport(results);
  const outDir = join(process.cwd(), ".tmp-final-qa");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `report-${Date.now()}.json`);
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        baseUrl: BASE,
        generatedAt: new Date().toISOString(),
        summary,
        results,
      },
      null,
      2,
    ),
  );
  console.log(`Wrote ${outPath}`);

  if (summary.failCount > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
