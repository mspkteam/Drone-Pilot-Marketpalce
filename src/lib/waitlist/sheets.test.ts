import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isMakeWebhookUrl } from "@/lib/waitlist/sheets";

describe("waitlist sheet webhook", () => {
  it("detects Make.com hook URLs", () => {
    assert.equal(
      isMakeWebhookUrl("https://hook.us1.make.com/abc123"),
      true,
    );
    assert.equal(
      isMakeWebhookUrl("https://hook.eu2.make.com/xyz"),
      true,
    );
    assert.equal(
      isMakeWebhookUrl("https://script.google.com/macros/s/abc/exec"),
      false,
    );
  });
});
