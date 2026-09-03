import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPilotContractActions,
  resolvePilotContractPhase,
} from "@/lib/bookings/contract-actions";

describe("pilot contract actions", () => {
  it("hides deliver work when the booking is completed", () => {
    const phase = resolvePilotContractPhase("completed", "approved");
    assert.equal(phase, "completed");

    const actions = buildPilotContractActions({
      phase,
      detailHref: "/detail",
      messageHref: "/messages",
      deliverHref: "/detail#deliver",
      disputeHref: "/detail#dispute",
    });

    assert.equal(
      actions.some((action) => action.id === "deliver" || action.id === "resubmit"),
      false,
    );
    assert.equal(
      actions.some((action) => action.id === "view_contract"),
      true,
    );
  });

  it("offers resubmit when revisions were requested", () => {
    const phase = resolvePilotContractPhase("in_progress", "rejected");
    assert.equal(phase, "revisions_requested");

    const actions = buildPilotContractActions({
      phase,
      detailHref: "/detail",
      messageHref: "/messages",
      deliverHref: "/detail#deliver",
      disputeHref: "/detail#dispute",
    });

    assert.equal(actions[0]?.id, "resubmit");
    assert.equal(actions[0]?.label, "Resubmit Work");
  });

  it("shows view submission while awaiting client review", () => {
    const phase = resolvePilotContractPhase("in_progress", "submitted");
    assert.equal(phase, "awaiting_review");

    const actions = buildPilotContractActions({
      phase,
      detailHref: "/detail",
      messageHref: "/messages",
      deliverHref: "/detail#deliver",
      disputeHref: "/detail#dispute",
    });

    assert.equal(actions[0]?.id, "view_delivery");
    assert.equal(
      actions.some((action) => action.id === "deliver"),
      false,
    );
  });
});
