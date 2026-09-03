import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isChipSelected,
  PILOT_PROFILE_SERVICE_CHIPS,
  publicPilotServiceLabels,
  toggleServiceChip,
} from "./pilot-profile-service-chips";

describe("publicPilotServiceLabels", () => {
  it("includes extra chips that are not stored on servicesOffered", () => {
    const labels = publicPilotServiceLabels(["inspection"], ["thermal"]);
    assert.ok(labels.includes("Inspections"));
    assert.ok(labels.includes("Thermal"));
  });
});

describe("service category chip selection", () => {
  it("toggles Aerial Video and Photography independently", () => {
    const aerial = PILOT_PROFILE_SERVICE_CHIPS.find((c) => c.id === "aerial_video")!;
    const photo = PILOT_PROFILE_SERVICE_CHIPS.find((c) => c.id === "photography")!;

    const afterAerial = toggleServiceChip(aerial, [], []);
    assert.equal(isChipSelected(aerial, afterAerial.servicesOffered, afterAerial.localChipIds), true);
    assert.equal(isChipSelected(photo, afterAerial.servicesOffered, afterAerial.localChipIds), false);

    const afterPhoto = toggleServiceChip(
      photo,
      afterAerial.servicesOffered,
      afterAerial.localChipIds,
    );
    assert.equal(isChipSelected(aerial, afterPhoto.servicesOffered, afterPhoto.localChipIds), true);
    assert.equal(isChipSelected(photo, afterPhoto.servicesOffered, afterPhoto.localChipIds), true);
  });
});
