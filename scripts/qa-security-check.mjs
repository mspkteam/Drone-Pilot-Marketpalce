#!/usr/bin/env node
/**
 * Runs automated QA and security checks for local CI / pre-release validation.
 * Usage: npm run qa
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";
const npxCmd = isWindows ? "npx.cmd" : "npx";

const steps = [
  {
    name: "Unit & integration tests",
    command: npmCmd,
    args: ["run", "test:all"],
  },
  {
    name: "ESLint",
    command: npmCmd,
    args: ["run", "lint"],
  },
  {
    name: "Production build",
    command: npxCmd,
    args: ["next", "build"],
  },
  {
    name: "Dependency audit (moderate+)",
    command: npmCmd,
    args: ["audit", "--audit-level=moderate"],
  },
];

function runStep(step) {
  const started = Date.now();
  const result = spawnSync(step.command, step.args, {
    cwd: ROOT,
    encoding: "utf8",
    shell: isWindows,
    env: process.env,
  });

  const durationSec = ((Date.now() - started) / 1000).toFixed(1);
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();

  return {
    ...step,
    ok: result.status === 0,
    durationSec,
    output,
    status: result.status ?? 1,
  };
}

function main() {
  if (!existsSync(join(ROOT, "package.json"))) {
    console.error("Run this script from the project root.");
    process.exit(1);
  }

  console.log("Drone Marketplace — QA & Security Check\n");

  const results = [];
  for (const step of steps) {
    console.log(`→ ${step.name}...`);
    const result = runStep(step);
    results.push(result);

    if (result.ok) {
      console.log(`  ✓ passed (${result.durationSec}s)\n`);
    } else {
      console.log(`  ✗ failed (${result.durationSec}s)\n`);
      if (result.output) {
        console.log(result.output);
        console.log("");
      }
    }
  }

  const passed = results.filter((result) => result.ok).length;
  const failed = results.length - passed;

  console.log("Summary");
  console.log("-------");
  for (const result of results) {
    console.log(
      `${result.ok ? "PASS" : "FAIL"}  ${result.name} (${result.durationSec}s)`,
    );
  }
  console.log("");
  console.log(`${passed}/${results.length} checks passed.`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
