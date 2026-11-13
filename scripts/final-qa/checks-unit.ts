import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fail, pass, type QaCheckResult } from "./helpers";

const UNIT_MAP: Array<{
  id: string;
  section: QaCheckResult["section"];
  title: string;
  glob: string;
}> = [
  {
    id: "C9-unit",
    section: "Unit",
    title: "Post-project step-bleed / travel normalize",
    glob: "src/lib/jobs/post-project-metadata.test.ts",
  },
  {
    id: "C14-unit",
    section: "Unit",
    title: "Hire CTA role helpers",
    glob: "src/lib/pilot/hire-cta.test.ts",
  },
  {
    id: "P2-unit",
    section: "Unit",
    title: "Service chips do not auto-light Custom",
    glob: "src/lib/pilot/pilot-profile-service-chips.test.ts",
  },
  {
    id: "P21-unit",
    section: "Unit",
    title: "Squadron voting helpers",
    glob: "src/lib/admin/squadron-voting.test.ts",
  },
  {
    id: "C3-unit",
    section: "Unit",
    title: "Date format helpers",
    glob: "src/lib/format/date.test.ts",
  },
];

/** Resolve tsx CLI entry so Windows paths with spaces never need shell:true. */
function resolveTsxCli(): string | null {
  const candidates = [
    join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs"),
    join(process.cwd(), "node_modules", "tsx", "dist", "cli.js"),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

/** Run focused unit tests that back Final QA Done rows. */
export function runUnitChecks(): QaCheckResult[] {
  const results: QaCheckResult[] = [];
  const tsxCli = resolveTsxCli();
  if (!tsxCli) {
    return UNIT_MAP.map((item) =>
      fail(item.id, item.section, item.title, "tsx CLI not found under node_modules/tsx"),
    );
  }

  for (const item of UNIT_MAP) {
    const run = spawnSync(process.execPath, [tsxCli, "--test", item.glob], {
      encoding: "utf8",
      timeout: 120_000,
      shell: false,
      env: process.env,
    });
    if (run.error) {
      results.push(
        fail(
          item.id,
          item.section,
          item.title,
          run.error.message.slice(0, 500),
        ),
      );
      continue;
    }
    if (run.status === 0) {
      results.push(pass(item.id, item.section, item.title, "tsx --test passed"));
    } else {
      const detail = (run.stderr || run.stdout || `exit ${run.status}`).slice(
        0,
        500,
      );
      results.push(fail(item.id, item.section, item.title, detail));
    }
  }
  return results;
}
