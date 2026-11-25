import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validatePasswordStrength } from "@/lib/auth/validation";

describe("password reset validation", () => {
  it("reuses the shared password strength rules", () => {
    assert.equal(validatePasswordStrength("short").ok, false);
    assert.equal(validatePasswordStrength("Password1!").ok, true);
  });
});
