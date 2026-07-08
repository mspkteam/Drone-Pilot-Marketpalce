import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateWaitlistInput } from "@/lib/waitlist/waitlist";

describe("waitlist validation", () => {
  it("defaults roleInterest to both for email-only landing forms", () => {
    const result = validateWaitlistInput({
      email: "pilot@example.com",
      source: "launch-landing",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.roleInterest, "both");
      assert.equal(result.source, "launch-landing");
    }
  });

  it("rejects invalid emails", () => {
    const result = validateWaitlistInput({ email: "not-an-email" });
    assert.equal(result.ok, false);
  });
});
