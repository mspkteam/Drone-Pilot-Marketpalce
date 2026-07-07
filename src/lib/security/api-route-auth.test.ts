import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it } from "node:test";

const API_ROOT = join(process.cwd(), "src", "app", "api");

/** Intentionally public API routes (no session required). */
const PUBLIC_API_SUFFIXES = [
  "auth/register/route.ts",
  "auth/[...nextauth]/route.ts",
  "waitlist/route.ts",
  "contact/route.ts",
] as const;

const AUTH_GUARD_PATTERNS = [
  /requireClientSession/,
  /requirePilotSession/,
  /requireAdminSession/,
  /requireAdminPermission/,
  /requireAdminModuleView/,
  /requireModeratorSession/,
  /requireSuperAdminSession/,
  /from ["']@\/auth["']/,
] as const;

function collectRouteFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectRouteFiles(fullPath));
      continue;
    }
    if (entry.name === "route.ts") {
      files.push(fullPath);
    }
  }

  return files;
}

function isPublicRoute(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/");
  return PUBLIC_API_SUFFIXES.includes(
    normalized as (typeof PUBLIC_API_SUFFIXES)[number],
  );
}

function hasAuthGuard(source: string): boolean {
  return AUTH_GUARD_PATTERNS.some((pattern) => pattern.test(source));
}

describe("API route auth guards", () => {
  it("requires auth on protected API routes", () => {
    const routeFiles = collectRouteFiles(API_ROOT);
    const unprotected: string[] = [];

    for (const file of routeFiles) {
      const rel = relative(API_ROOT, file).replace(/\\/g, "/");
      if (isPublicRoute(rel)) continue;

      const source = readFileSync(file, "utf8");
      if (!hasAuthGuard(source)) {
        unprotected.push(`src/app/api/${rel}`);
      }
    }

    assert.deepEqual(
      unprotected,
      [],
      `Protected API routes missing auth guard:\n${unprotected.join("\n")}`,
    );
  });

  it("keeps the public route allowlist small and explicit", () => {
    const routeFiles = collectRouteFiles(API_ROOT).map((file) =>
      relative(API_ROOT, file).replace(/\\/g, "/"),
    );

    const publicRoutes = routeFiles.filter((rel) => isPublicRoute(rel));
    assert.deepEqual(
      publicRoutes.sort(),
      [...PUBLIC_API_SUFFIXES].sort(),
      "Update PUBLIC_API_SUFFIXES if a new intentionally public route was added.",
    );
  });
});

describe("role-scoped API route prefixes", () => {
  it("keeps client routes under /api/client", () => {
    const clientRoutes = collectRouteFiles(join(API_ROOT, "client")).map((file) =>
      relative(API_ROOT, file).replace(/\\/g, "/"),
    );

    for (const route of clientRoutes) {
      assert.ok(route.startsWith("client/"), route);
      const source = readFileSync(join(API_ROOT, route), "utf8");
      assert.match(
        source,
        /requireClientSession/,
        `${route} should use requireClientSession`,
      );
    }
  });

  it("keeps admin routes under /api/admin", () => {
    const adminRoutes = collectRouteFiles(join(API_ROOT, "admin")).map((file) =>
      relative(API_ROOT, file).replace(/\\/g, "/"),
    );

    for (const route of adminRoutes) {
      assert.ok(route.startsWith("admin/"), route);
      const source = readFileSync(join(API_ROOT, route), "utf8");
      assert.match(
        source,
        /requireAdminSession|requireAdminPermission|requireAdminModuleView|requireModeratorSession|requireSuperAdminSession/,
        `${route} should use an admin auth guard`,
      );
    }
  });

  it("keeps pilot routes under /api/pilot", () => {
    const pilotRoutes = collectRouteFiles(join(API_ROOT, "pilot")).map((file) =>
      relative(API_ROOT, file).replace(/\\/g, "/"),
    );

    for (const route of pilotRoutes) {
      assert.ok(route.startsWith("pilot/"), route);
      const source = readFileSync(join(API_ROOT, route), "utf8");
      assert.match(
        source,
        /requirePilotSession/,
        `${route} should use requirePilotSession`,
      );
    }
  });
});
