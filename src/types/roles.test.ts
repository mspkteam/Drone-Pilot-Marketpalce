import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isAdminRole,
  isFullAdminRole,
  isManagementUserRole,
} from "@/types/roles";

describe("management roles", () => {
  it("treats admin and super_admin as full ops roles", () => {
    assert.equal(isFullAdminRole("admin"), true);
    assert.equal(isFullAdminRole("super_admin"), true);
    assert.equal(isFullAdminRole("moderator"), false);
    assert.equal(isFullAdminRole("pilot"), false);
  });

  it("includes admin in dashboard admin roles", () => {
    assert.equal(isAdminRole("admin"), true);
    assert.equal(isAdminRole("moderator"), true);
    assert.equal(isAdminRole("super_admin"), true);
    assert.equal(isAdminRole("client"), false);
  });

  it("limits creatable/deletable management roles to admin and moderator", () => {
    assert.equal(isManagementUserRole("admin"), true);
    assert.equal(isManagementUserRole("moderator"), true);
    assert.equal(isManagementUserRole("super_admin"), false);
    assert.equal(isManagementUserRole("pilot"), false);
  });
});
