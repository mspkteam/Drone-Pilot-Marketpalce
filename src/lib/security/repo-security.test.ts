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

  it("does not use broad modal attribute selectors in dashboard theme", () => {
    const theme = readFileSync(
      join(ROOT, "src", "styles", "dashboard-theme.css"),
      "utf8",
    );
    // Strip block comments so advisory text cannot false-positive.
    const code = theme.replace(/\/\*[\s\S]*?\*\//g, "");

    // Broad substring match paints chrome onto every …-modal-* child and
    // breaks dialog layout (title/body/actions become nested cards).
    assert.doesNotMatch(
      code,
      /\[class\*=["']modal["']\]/,
      'Forbidden: [class*="modal"] in dashboard-theme.css',
    );
    assert.doesNotMatch(
      code,
      /\[class\*=["']-modal["']\]/,
      'Forbidden: [class*="-modal"] in dashboard-theme.css — use [class$="-modal"]',
    );
    assert.doesNotMatch(
      code,
      /\[class\*=["']-modal /,
      'Forbidden: [class*="-modal …"] — use [class$="-modal"] for shells only',
    );

    assert.match(
      code,
      /\[class\$=["']-modal["']\]/,
      'Expected shell-only modal selector [class$="-modal"]',
    );
  });

  it("scopes subscriptions hero button flex away from modal foot buttons", () => {
    const css = readFileSync(
      join(ROOT, "src", "styles", "admin-subscriptions.css"),
      "utf8",
    );

    assert.match(
      css,
      /\.admin-subscriptions-hero-actions\s+\.admin-subscriptions-btn\s*\{[^}]*flex:\s*1\s+1\s+auto/s,
      "Hero button flex must be scoped under .admin-subscriptions-hero-actions",
    );

    const unscopedFlex = [
      ...css.matchAll(
        /(?:^|\n)\.admin-subscriptions-btn\s*\{[^}]*flex:\s*1\s+1\s+auto/g,
      ),
    ];
    assert.equal(
      unscopedFlex.length,
      0,
      "Do not set flex: 1 1 auto on bare .admin-subscriptions-btn (breaks modal foot)",
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
