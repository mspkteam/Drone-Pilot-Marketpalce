import assert from "node:assert/strict";
import test from "node:test";
import {
  computeEscrowAmountsCents,
  fromCents,
  resolveConnectStatus,
  toCents,
} from "./money";

test("toCents avoids float drift", () => {
  assert.equal(toCents(99.99), 9999);
  assert.equal(toCents(19.99), 1999);
  assert.equal(toCents(1.005 * 100), 10050);
  assert.equal(fromCents(9999), 99.99);
});

test("escrow amounts: 6% service fee, 15% commission", () => {
  const a = computeEscrowAmountsCents(1000, 0.15);
  assert.equal(a.jobCents, 100000);
  assert.equal(a.serviceFeeCents, 6000);
  assert.equal(a.totalCents, 106000);
  assert.equal(a.commissionCents, 15000);
  assert.equal(a.pilotNetCents, 85000);
});

test("connect status mapping", () => {
  assert.equal(
    resolveConnectStatus({ charges_enabled: true, payouts_enabled: true, details_submitted: true }),
    "complete",
  );
  assert.equal(resolveConnectStatus({ details_submitted: false }), "needs_info");
  assert.equal(
    resolveConnectStatus({ details_submitted: true, requirements: { currently_due: ["x"] } }),
    "needs_info",
  );
  assert.equal(
    resolveConnectStatus({ details_submitted: true, requirements: { disabled_reason: "rejected.fraud" } }),
    "restricted",
  );
  assert.equal(resolveConnectStatus({ details_submitted: true }), "pending");
});
