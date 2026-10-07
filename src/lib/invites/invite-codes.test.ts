import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  INVITEE_DISCOUNT_PERCENT,
  INVITER_REWARD_CAP_PERCENT,
  INVITER_REWARD_PER_INVITE_PERCENT,
  INVITES_FOR_PROMOTION,
} from "@/lib/invites/invite-codes";

describe("invite code policy", () => {
  it("uses 10% invitee discount and 10% stacked inviter reward capped at 50%", () => {
    assert.equal(INVITEE_DISCOUNT_PERCENT, 10);
    assert.equal(INVITER_REWARD_PER_INVITE_PERCENT, 10);
    assert.equal(INVITER_REWARD_CAP_PERCENT, 50);
    assert.equal(INVITES_FOR_PROMOTION, 10);
  });
});
