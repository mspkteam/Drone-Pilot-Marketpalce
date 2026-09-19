import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";
import { isRegistrationEnabled } from "@/lib/auth/registration-gate";

describe("isRegistrationEnabled", () => {
  const originalServer = process.env.REGISTRATION_ENABLED;
  const originalPublic = process.env.NEXT_PUBLIC_REGISTRATION_ENABLED;

  afterEach(() => {
    if (originalServer === undefined) delete process.env.REGISTRATION_ENABLED;
    else process.env.REGISTRATION_ENABLED = originalServer;
    if (originalPublic === undefined) {
      delete process.env.NEXT_PUBLIC_REGISTRATION_ENABLED;
    } else {
      process.env.NEXT_PUBLIC_REGISTRATION_ENABLED = originalPublic;
    }
  });

  it("defaults to open when env is unset", () => {
    delete process.env.REGISTRATION_ENABLED;
    delete process.env.NEXT_PUBLIC_REGISTRATION_ENABLED;
    assert.equal(isRegistrationEnabled(), true);
  });

  it("can be closed explicitly", () => {
    delete process.env.NEXT_PUBLIC_REGISTRATION_ENABLED;
    process.env.REGISTRATION_ENABLED = "false";
    assert.equal(isRegistrationEnabled(), false);
  });

  it("stays open when set true", () => {
    delete process.env.NEXT_PUBLIC_REGISTRATION_ENABLED;
    process.env.REGISTRATION_ENABLED = "true";
    assert.equal(isRegistrationEnabled(), true);
  });
});
