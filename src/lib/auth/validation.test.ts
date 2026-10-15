import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validatePasswordStrength,
  validateRegisterInput,
} from "./validation";

describe("validatePasswordStrength", () => {
  it("rejects short passwords", () => {
    const result = validatePasswordStrength("Ab1!xxxx");
    assert.equal(result.ok, false);
  });

  it("requires upper, lower, number, and special", () => {
    assert.equal(validatePasswordStrength("abcdefghij1!").ok, false);
    assert.equal(validatePasswordStrength("ABCDEFGHIJ1!").ok, false);
    assert.equal(validatePasswordStrength("Abcdefghij!").ok, false);
    assert.equal(validatePasswordStrength("Abcdefghij1").ok, false);
    assert.equal(validatePasswordStrength("Abcdefgh1!").ok, true);
  });
});

describe("validateRegisterInput", () => {
  it("accepts a strong password with client role", () => {
    const result = validateRegisterInput({
      email: "pilot@example.com",
      password: "SecurePass1!",
      role: "pilot",
    });
    assert.equal(result.ok, true);
  });

  it("rejects weak password", () => {
    const result = validateRegisterInput({
      email: "client@example.com",
      password: "password",
      role: "client",
    });
    assert.equal(result.ok, false);
  });
});
