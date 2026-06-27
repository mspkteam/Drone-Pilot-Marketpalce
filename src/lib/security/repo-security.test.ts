import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { PUBLIC_PATHS } from "@/lib/auth/config";
import { ROUTE_MILESTONE_RULES } from "@/lib/milestones";

const ROOT = process.cwd();

describe("repository security hygiene", () => {
  it("ignores env files in git", () => {
    const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf8");
    assert.match(gitignore, /^\.env$/m);
    assert.match(gitignore, /^\.env\*\.local$/m);
  });

  it("does not expose milestone preview bypass by default", () => {
    assert.notEqual(process.env.ALLOW_MILESTONE_PREVIEW, "true");
    assert.notEqual(process.env.NEXT_PUBLIC_ALLOW_MILESTONE_PREVIEW, "true");
  });

  it("keeps auth pages public while dashboard routes are gated", () => {
    assert.ok(PUBLIC_PATHS.includes("/login"));
    assert.ok(PUBLIC_PATHS.includes("/register"));
    assert.ok(!PUBLIC_PATHS.includes("/dashboard/client"));
  });

  it("assigns allowedRoles to dashboard milestone rules", () => {
    const dashboardRules = ROUTE_MILESTONE_RULES.filter((rule) =>
      rule.pathPrefix.startsWith("/dashboard/"),
    );

    const missingRoles = dashboardRules.filter(
      (rule) => !rule.allowedRoles || rule.allowedRoles.length === 0,
    );

    assert.deepEqual(
      missingRoles.map((rule) => rule.pathPrefix),
      [],
      "Dashboard milestone rules should declare allowedRoles.",
    );
  });
});

describe("secret handling", () => {
  it("reads auth secret from env helpers only", () => {
    const secretModule = readFileSync(
      join(ROOT, "src", "lib", "auth", "secret.ts"),
      "utf8",
    );
    assert.match(secretModule, /process\.env\.AUTH_SECRET/);
    assert.doesNotMatch(secretModule, /AUTH_SECRET\s*=\s*["'][^"']+["']/);
  });

  it("hashes passwords with bcrypt helper", () => {
    const passwordModule = readFileSync(
      join(ROOT, "src", "lib", "auth", "password.ts"),
      "utf8",
    );
    assert.match(passwordModule, /bcrypt/);
  });
});
