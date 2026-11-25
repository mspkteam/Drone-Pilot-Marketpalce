import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PLATFORM_DEFAULT_TIMEZONE,
  isValidTimeZone,
  normalizeTimeZone,
  pickTimezoneFromRegionCodes,
  regionCodeFromCountry,
  timezoneForRegionCode,
  timezoneFromAreaLabel,
  timezoneFromCountry,
} from "./timezone";

describe("timezone helpers", () => {
  it("validates IANA timezones", () => {
    assert.equal(isValidTimeZone("America/Chicago"), true);
    assert.equal(isValidTimeZone("Not/AZone"), false);
    assert.equal(isValidTimeZone(""), false);
  });

  it("maps region codes and countries", () => {
    assert.equal(timezoneForRegionCode("middle-east"), "Asia/Dubai");
    assert.equal(regionCodeFromCountry("AE"), "middle-east");
    assert.equal(timezoneFromCountry("AU"), "Pacific/Auckland");
    assert.equal(timezoneFromAreaLabel("Middle East"), "Asia/Dubai");
    assert.equal(timezoneFromAreaLabel("asia-pacific"), "Asia/Singapore");
  });

  it("picks earliest sorted operating region", () => {
    const tz = pickTimezoneFromRegionCodes(
      ["oceania", "middle-east"],
      [
        { code: "middle-east", timezone: "Asia/Dubai", sortOrder: 5 },
        { code: "oceania", timezone: "Pacific/Auckland", sortOrder: 8 },
      ],
    );
    assert.equal(tz, "Asia/Dubai");
  });

  it("normalizes invalid zones to platform default", () => {
    assert.equal(normalizeTimeZone("bogus"), PLATFORM_DEFAULT_TIMEZONE);
    assert.equal(normalizeTimeZone("Europe/London"), "Europe/London");
  });
});
