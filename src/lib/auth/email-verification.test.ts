import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHash, randomBytes } from "crypto";

describe("verification token hashing", () => {
  it("hashes trim-stable hex tokens the same way verify expects", () => {
    const token = randomBytes(32).toString("hex");
    const a = createHash("sha256").update(token).digest("hex");
    const b = createHash("sha256").update(` ${token} `.trim()).digest("hex");
    assert.equal(a, b);
    assert.equal(token.length, 64);
  });
});
