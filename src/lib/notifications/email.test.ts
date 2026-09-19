import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isDeliverableEmailAddress } from "@/lib/notifications/smtp-config";

describe("isDeliverableEmailAddress", () => {
  it("accepts real public addresses", () => {
    assert.equal(isDeliverableEmailAddress("client@remoteairservice.com"), true);
    assert.equal(isDeliverableEmailAddress("qa@gmail.com"), true);
  });

  it("rejects seed/QA .local and reserved hosts", () => {
    assert.equal(
      isDeliverableEmailAddress("qa.client.202608201207@dronepilot.local"),
      false,
    );
    assert.equal(isDeliverableEmailAddress("pilot@dronepilot.local"), false);
    assert.equal(isDeliverableEmailAddress("user@localhost"), false);
    assert.equal(isDeliverableEmailAddress("user@example.test"), false);
  });

  it("rejects empty or malformed", () => {
    assert.equal(isDeliverableEmailAddress(""), false);
    assert.equal(isDeliverableEmailAddress("not-an-email"), false);
  });
});
