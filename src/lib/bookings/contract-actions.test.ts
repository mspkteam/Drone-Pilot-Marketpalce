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
    assert.equal(actions[0]?.label, "Submit Revisions");
  });

  it("hides Message Client when canMessage is false", () => {
    const actions = buildPilotContractActions({
      phase: "in_progress",
      detailHref: "/detail",
      messageHref: "/messages",
      deliverHref: "/detail#deliver",
      disputeHref: "/detail#dispute",
      canMessage: false,
    });
    assert.equal(
      actions.some((action) => action.id === "message"),
      false,
    );
  });

  it("routes Request Revision to messaging with revision intent", () => {
    const actions = buildPilotContractActions({
      phase: "in_progress",
      detailHref: "/detail",
      messageHref: "/messages?c=1",
      deliverHref: "/detail#deliver",
      disputeHref: "/detail#dispute",
      canMessage: true,
    });
    const revision = actions.find((action) => action.id === "request_revision");
    assert.equal(revision?.href, "/messages?c=1&intent=revision");
  });

  it("hides Request Revision when there is no conversation yet", () => {
    const actions = buildPilotContractActions({
      phase: "in_progress",
      detailHref: "/detail",
      messageHref: "/messages",
      deliverHref: "/detail#deliver",
      disputeHref: "/detail#dispute",
      canMessage: false,
    });
    assert.equal(
      actions.some((action) => action.id === "request_revision"),
      false,
    );
  });
});
