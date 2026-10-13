import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapPersonnelClientRoleLabel,
  mapPersonnelPilotRoleLabel,
  PERSONNEL_DISPLAY_ROLE_LABELS,
} from "@/lib/admin/personnel-role-labels";

describe("personnel display role labels", () => {
  it("uses Squadron Lead only when instructor add-on is active", () => {
    const a4Eligible = mapPersonnelPilotRoleLabel({
      tierCode: "A4_SENIOR_FLIGHT_OFFICER",
      planName: "A-4 Senior Flight Officer",
      instructorAddonActive: false,
    });
    assert.equal(a4Eligible.label, "A-4 Senior Flight Officer");
    assert.equal(a4Eligible.filter, PERSONNEL_DISPLAY_ROLE_LABELS.pilot);

    const instructor = mapPersonnelPilotRoleLabel({
      tierCode: "A4_SENIOR_FLIGHT_OFFICER",
      planName: "A-4 Senior Flight Officer",
      instructorAddonActive: true,
    });
    assert.equal(instructor.label, PERSONNEL_DISPLAY_ROLE_LABELS.squadronLead);
  });

  it("maps elite grades and enterprise clients", () => {
    const elite = mapPersonnelPilotRoleLabel({
      tierCode: "A6_CAPTAIN",
      planName: "A-6 Captain",
      instructorAddonActive: false,
    });
    assert.equal(elite.label, PERSONNEL_DISPLAY_ROLE_LABELS.elitePilot);

    assert.equal(
      mapPersonnelClientRoleLabel(true).label,
      PERSONNEL_DISPLAY_ROLE_LABELS.enterpriseClient,
    );
    assert.equal(
      mapPersonnelClientRoleLabel(false).label,
      PERSONNEL_DISPLAY_ROLE_LABELS.client,
    );
  });
});
