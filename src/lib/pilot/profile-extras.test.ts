import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyPilotProfileExtras,
  parseProfileExtrasJson,
  sanitizeProfileExtrasInput,
  serializeProfileExtrasJson,
} from "./profile-extras";

describe("profile extras", () => {
  it("returns empty extras for invalid JSON", () => {
    assert.deepEqual(parseProfileExtrasJson("{"), emptyPilotProfileExtras());
  });

  it("round-trips extras JSON", () => {
    const extras = {
      callSign: "HAWK-1",
      languages: "English, German",
      mainDrones: ["DJI Matrice 350 RTK"],
      payloads: ["LiDAR Scanner"],
      localChipIds: ["thermal"],
      operatingRegionCodes: ["north-america", "middle-east"],
      avatarUrl: null,
      notifications: {
        jobAlerts: true,
        messages: true,
        contracts: true,
        membership: true,
      },
    };
    const parsed = parseProfileExtrasJson(serializeProfileExtrasJson(extras));
    assert.deepEqual(parsed, extras);
  });

  it("defaults missing operatingRegionCodes on legacy extras", () => {
    const legacy = {
      callSign: "LEGACY",
      languages: "",
      mainDrones: [],
      payloads: [],
      localChipIds: [],
      avatarUrl: null,
      notifications: {
        jobAlerts: true,
        messages: true,
        contracts: true,
        membership: true,
      },
    };
    const parsed = parseProfileExtrasJson(
      serializeProfileExtrasJson(legacy as typeof legacy & { operatingRegionCodes: string[] }),
    );
    assert.deepEqual(parsed.operatingRegionCodes, []);
  });

  it("sanitizes unknown input", () => {
    const parsed = sanitizeProfileExtrasInput({
      callSign: "TOOLONGCALLSIGNHERE",
      mainDrones: ["A", 2, "B"],
      payloads: ["Thermal Imaging Camera Extra Text"],
    });
    assert.equal(parsed.callSign, "TOOLONGCALLS");
    assert.deepEqual(parsed.mainDrones, ["A", "B"]);
    assert.equal(parsed.payloads[0]?.length, 22);
  });
});
