import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateCommission,
  DEFAULT_COMMISSION_RATE,
  SERVICE_FEE_RATE,
  calculatePaymentBreakdown,
  maxAllowedJobAmount,
  validateChangeOrderAmount,
} from "@/lib/commission/constants";

describe("service fee and change orders", () => {
  it("uses 6% service fee", () => {
    assert.equal(SERVICE_FEE_RATE, 0.06);
  });

  it("builds a breakdown", () => {
    const b = calculatePaymentBreakdown(1000);
    assert.equal(b.serviceFee, 60);
    assert.equal(b.totalClientPays, 1060);
    assert.equal(b.pilotNet, 850);
    assert.equal(b.rasCommission, 150);
  });

  it("honors commission override in breakdown", () => {
    const b = calculatePaymentBreakdown(1000, 0.1);
    assert.equal(b.pilotNet, 900);
    assert.equal(b.rasCommission, 100);
  });

  it("caps increases at +20% of original", () => {
    assert.equal(maxAllowedJobAmount(1000), 1200);
    const ok = validateChangeOrderAmount(1000, 1000, 1200);
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.delta, 200);
      assert.equal(ok.serviceFee, 12);
      assert.equal(ok.clientChargeDelta, 212);
    }
    assert.equal(validateChangeOrderAmount(1000, 1000, 1200.01).ok, false);
  });

  it("measures cap against original after prior accepted increases", () => {
    assert.equal(validateChangeOrderAmount(1000, 1100, 1200).ok, true);
    assert.equal(validateChangeOrderAmount(1000, 1100, 1250).ok, false);
  });

  it("rejects non-increases", () => {
    assert.equal(validateChangeOrderAmount(1000, 1000, 1000).ok, false);
    assert.equal(validateChangeOrderAmount(1000, 1000, -5).ok, false);
  });
});

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
