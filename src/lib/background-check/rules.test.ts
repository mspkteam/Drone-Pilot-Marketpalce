import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BACKGROUND_CHECK_LAUNCH_DATE,
  computeBackgroundCheckDeadline,
  daysUntilDeadline,
  getBackgroundCheckPayBlockReason,
  isAdminSettableStatus,
  isMarketplacePausedByBackgroundCheck,
} from "./rules";

const start = new Date("2027-01-01T00:00:00.000Z");
const day = 24 * 60 * 60 * 1000;

describe("background check deadline", () => {
  it("is 30 days after admin acceptance", () => {
    assert.equal(
      computeBackgroundCheckDeadline(start).toISOString(),
      "2027-01-31T00:00:00.000Z",
    );
  });

  it("uses the launch constant for legacy pilots", () => {
    assert.equal(
      computeBackgroundCheckDeadline(null).getTime(),
      BACKGROUND_CHECK_LAUNCH_DATE.getTime() + 30 * day,
    );
  });

  it("counts days remaining and floors at 0", () => {
    const deadline = computeBackgroundCheckDeadline(start);
    assert.equal(daysUntilDeadline(deadline, start), 30);
    assert.equal(daysUntilDeadline(deadline, new Date(start.getTime() + 29.5 * day)), 1);
    assert.equal(daysUntilDeadline(deadline, new Date(start.getTime() + 40 * day)), 0);
  });
});

describe("marketplace gate", () => {
  it("allows within 30 days when not cleared", () => {
    assert.equal(
      isMarketplacePausedByBackgroundCheck({
        status: "paid",
        deadlineStartedAt: start,
        now: new Date(start.getTime() + 30 * day),
      }),
      false,
    );
  });

  it("pauses after day 30 without cleared", () => {
    for (const status of ["not_started", "paid", "in_review"]) {
      assert.equal(
        isMarketplacePausedByBackgroundCheck({
          status,
          deadlineStartedAt: start,
          now: new Date(start.getTime() + 30 * day + 1),
        }),
        true,
      );
    }
  });

  it("never pauses cleared pilots", () => {
    assert.equal(
      isMarketplacePausedByBackgroundCheck({
        status: "cleared",
        deadlineStartedAt: start,
        now: new Date(start.getTime() + 90 * day),
      }),
      false,
    );
  });

  it("pauses not_cleared immediately", () => {
    assert.equal(
      isMarketplacePausedByBackgroundCheck({
        status: "not_cleared",
        deadlineStartedAt: start,
        now: start,
      }),
      true,
    );
  });

  it("legacy pilots are counted from launch date", () => {
    assert.equal(
      isMarketplacePausedByBackgroundCheck({
        status: null,
        now: new Date(BACKGROUND_CHECK_LAUNCH_DATE.getTime() + 10 * day),
      }),
      false,
    );
    assert.equal(
      isMarketplacePausedByBackgroundCheck({
        status: null,
        now: new Date(BACKGROUND_CHECK_LAUNCH_DATE.getTime() + 31 * day),
      }),
      true,
    );
  });
});

describe("pay eligibility", () => {
  const ok = {
    profileApproved: true,
    hasActiveMembership: true,
    status: "not_started",
    consentAccepted: true,
  };

  it("allows when all prerequisites met", () => {
    assert.equal(getBackgroundCheckPayBlockReason(ok), null);
  });

  it("blocks each missing prerequisite", () => {
    assert.ok(getBackgroundCheckPayBlockReason({ ...ok, profileApproved: false }));
    assert.ok(getBackgroundCheckPayBlockReason({ ...ok, hasActiveMembership: false }));
    assert.ok(getBackgroundCheckPayBlockReason({ ...ok, status: "paid" }));
    assert.ok(getBackgroundCheckPayBlockReason({ ...ok, consentAccepted: false }));
  });

  it("does not let admins set not_started", () => {
    assert.equal(isAdminSettableStatus("not_started"), false);
    assert.equal(isAdminSettableStatus("cleared"), true);
  });
});
