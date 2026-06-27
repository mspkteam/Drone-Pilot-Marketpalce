import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAccessAdminPath,
  canAccessDashboard,
  getDashboardTypeFromPath,
  resolvePostLoginRedirect,
  roleMeetsRequirement,
} from "@/lib/auth/permissions";

describe("auth permissions", () => {
  it("maps dashboard path prefixes to roles", () => {
    assert.equal(getDashboardTypeFromPath("/dashboard/client/jobs"), "client");
    assert.equal(getDashboardTypeFromPath("/dashboard/pilot"), "pilot");
    assert.equal(getDashboardTypeFromPath("/dashboard/admin/users"), "admin");
    assert.equal(getDashboardTypeFromPath("/about"), null);
  });

  it("restricts dashboard access by role", () => {
    assert.equal(canAccessDashboard("client", "client"), true);
    assert.equal(canAccessDashboard("client", "pilot"), false);
    assert.equal(canAccessDashboard("pilot", "pilot"), true);
    assert.equal(canAccessDashboard("moderator", "admin"), true);
    assert.equal(canAccessDashboard("super_admin", "admin"), true);
    assert.equal(canAccessDashboard("pilot", "admin"), false);
  });

  it("limits super-admin-only admin routes", () => {
    assert.equal(
      canAccessAdminPath("moderator", "/dashboard/admin/permissions"),
      false,
    );
    assert.equal(
      canAccessAdminPath("super_admin", "/dashboard/admin/permissions"),
      true,
    );
    assert.equal(canAccessAdminPath("moderator", "/dashboard/admin/jobs"), true);
  });

  it("evaluates role hierarchy for admin requirements", () => {
    assert.equal(roleMeetsRequirement("super_admin", "super_admin"), true);
    assert.equal(roleMeetsRequirement("moderator", "super_admin"), false);
    assert.equal(roleMeetsRequirement("moderator", "moderator"), true);
    assert.equal(roleMeetsRequirement("super_admin", "moderator"), true);
  });

  it("redirects post-login to role home for cross-role callback URLs", () => {
    assert.equal(
      resolvePostLoginRedirect("client", "/dashboard/pilot/jobs"),
      "/dashboard/client",
    );
    assert.equal(
      resolvePostLoginRedirect("pilot", "/dashboard/client/jobs"),
      "/dashboard/pilot",
    );
  });

  it("allows same-role callback URLs", () => {
    assert.equal(
      resolvePostLoginRedirect("client", "/dashboard/client/jobs/job-1"),
      "/dashboard/client/jobs/job-1",
    );
  });

  it("blocks moderator from super-admin callback URLs", () => {
    assert.equal(
      resolvePostLoginRedirect(
        "moderator",
        "/dashboard/admin/permissions",
      ),
      "/dashboard/admin",
    );
  });
});
