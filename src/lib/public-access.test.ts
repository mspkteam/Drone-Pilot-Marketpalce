import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  DEFAULT_UNLOCKED_PUBLIC_PATHS,
  getUnlockedPublicPaths,
  isPublicMarketingPathAllowed,
  isPublicPilotProfileEnabled,
} from "./public-access";

const ENV_KEY = "NEXT_PUBLIC_UNLOCKED_PUBLIC_PATHS";

describe("public access", () => {
  let saved: string | undefined;

  beforeEach(() => {
    saved = process.env[ENV_KEY];
    delete process.env[ENV_KEY];
  });

  afterEach(() => {
    if (saved === undefined) {
      delete process.env[ENV_KEY];
    } else {
      process.env[ENV_KEY] = saved;
    }
  });

  it("defaults to full public marketing site", () => {
    assert.deepEqual(getUnlockedPublicPaths(), DEFAULT_UNLOCKED_PUBLIC_PATHS);
    assert.equal(isPublicMarketingPathAllowed("/"), true);
    assert.equal(isPublicMarketingPathAllowed("/for-clients"), true);
    assert.equal(isPublicMarketingPathAllowed("/for-pilots"), true);
    assert.equal(isPublicMarketingPathAllowed("/how-it-works"), true);
    assert.equal(isPublicMarketingPathAllowed("/pricing"), true);
    assert.equal(isPublicMarketingPathAllowed("/safety"), true);
    assert.equal(isPublicMarketingPathAllowed("/about"), true);
    assert.equal(isPublicMarketingPathAllowed("/contact"), true);
    assert.equal(isPublicMarketingPathAllowed("/terms"), true);
    assert.equal(isPublicMarketingPathAllowed("/privacy"), true);
    assert.equal(isPublicMarketingPathAllowed("/cookies"), true);
    assert.equal(isPublicMarketingPathAllowed("/resources"), true);
    assert.equal(isPublicMarketingPathAllowed("/resources/pilot-onboarding"), true);
    assert.equal(isPublicMarketingPathAllowed("/pilots"), true);
    assert.equal(isPublicMarketingPathAllowed("/pilots/demo-id"), false);
    assert.equal(isPublicMarketingPathAllowed("/captains-club"), true);
    assert.equal(isPublicMarketingPathAllowed("/reputation"), true);
    assert.equal(isPublicMarketingPathAllowed("/jobs"), true);
    assert.equal(isPublicMarketingPathAllowed("/jobs/demo-id"), true);
    assert.equal(isPublicMarketingPathAllowed("/dashboard/client"), false);
  });

  it("hides public pilot profiles during milestone 1", () => {
    assert.equal(isPublicPilotProfileEnabled(), false);
    assert.equal(isPublicMarketingPathAllowed("/pilots"), true);
    assert.equal(isPublicMarketingPathAllowed("/pilots/demo-id"), false);
  });

  it("always allows auth routes", () => {
    assert.equal(isPublicMarketingPathAllowed("/login"), true);
    assert.equal(isPublicMarketingPathAllowed("/register"), true);
    assert.equal(isPublicMarketingPathAllowed("/waitlist"), true);
    assert.equal(isPublicMarketingPathAllowed("/launch"), true);
  });

  it("respects NEXT_PUBLIC_UNLOCKED_PUBLIC_PATHS override", () => {
    process.env.NEXT_PUBLIC_UNLOCKED_PUBLIC_PATHS = "/,/pricing,/pilots";
    assert.equal(isPublicMarketingPathAllowed("/pricing"), true);
    assert.equal(isPublicMarketingPathAllowed("/pilots"), true);
    assert.equal(isPublicMarketingPathAllowed("/for-clients"), false);
    assert.equal(isPublicMarketingPathAllowed("/about"), false);
  });
});
