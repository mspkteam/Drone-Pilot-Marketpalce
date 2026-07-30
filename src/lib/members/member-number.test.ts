import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MEMBER_NUMBER_START,
  formatMemberNumber,
  looksLikeMemberNumber,
  parseMemberNumber,
} from "@/lib/members/member-number";

describe("member number", () => {
  it("formats from 001000", () => {
    assert.equal(formatMemberNumber(MEMBER_NUMBER_START), "001000");
    assert.equal(formatMemberNumber(1001), "001001");
    assert.equal(formatMemberNumber("42"), "000042");
  });

  it("parses digit strings", () => {
    assert.equal(parseMemberNumber("001000"), 1000);
    assert.equal(parseMemberNumber("# 001234"), 1234);
    assert.equal(parseMemberNumber("Jane Doe"), null);
  });

  it("detects numeric member ids vs names", () => {
    assert.equal(looksLikeMemberNumber("001000"), true);
    assert.equal(looksLikeMemberNumber("DEMO-PILOT-001"), false);
    assert.equal(looksLikeMemberNumber("Jane Doe"), false);
  });
});
