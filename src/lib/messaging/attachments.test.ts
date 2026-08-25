import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseMessageAttachments, sanitizeMessageAttachments } from "./attachments";

describe("message attachments", () => {
  it("parses persisted JSON", () => {
    const items = parseMessageAttachments(
      JSON.stringify([{ url: "/uploads/a.pdf", name: "plan.pdf", contentType: "application/pdf" }]),
    );
    assert.equal(items.length, 1);
    assert.equal(items[0]?.name, "plan.pdf");
  });

  it("drops invalid URLs", () => {
    const items = sanitizeMessageAttachments([
      { url: "javascript:alert(1)", name: "x", contentType: "text/plain" },
    ]);
    assert.equal(items.length, 0);
  });
});
