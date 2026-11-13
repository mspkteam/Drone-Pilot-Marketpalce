import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateCommission,
  DEFAULT_COMMISSION_RATE,
} from "@/lib/commission/constants";

describe("commission calculation", () => {
  it("uses 15% default platform rate", () => {
    assert.equal(DEFAULT_COMMISSION_RATE, 0.15);
  });

  it("splits gross into commission and pilot net", () => {
    const { amount, amountNet } = calculateCommission(1000);
    assert.equal(amount, 150);
    assert.equal(amountNet, 850);
  });

  it("honors an override rate", () => {
    const { amount, amountNet } = calculateCommission(1000, 0.1);
    assert.equal(amount, 100);
    assert.equal(amountNet, 900);
  });

  it("rounds to cents", () => {
    const { amount, amountNet } = calculateCommission(99.99, 0.15);
    assert.equal(amount, 15);
    assert.equal(amountNet, 84.99);
  });
});
