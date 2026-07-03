import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  DEFAULT_UNLOCKED_PUBLIC_PATHS,
  getUnlockedPublicPaths,
  isPublicMarketingPathAllowed,
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

  it("defaults to three marketing pages", () => {
    assert.deepEqual(getUnlockedPublicPaths(), DEFAULT_UNLOCKED_PUBLIC_PATHS);
    assert.equal(isPublicMarketingPathAllowed("/"), true);
    assert.equal(isPublicMarketingPathAllowed("/for-clients"), true);
    assert.equal(isPublicMarketingPathAllowed("/how-it-works"), true);
    assert.equal(isPublicMarketingPathAllowed("/pricing"), false);
    assert.equal(isPublicMarketingPathAllowed("/pilots"), false);
  });

  it("always allows auth routes", () => {
    assert.equal(isPublicMarketingPathAllowed("/login"), true);
    assert.equal(isPublicMarketingPathAllowed("/register"), true);
  });

  it("respects NEXT_PUBLIC_UNLOCKED_PUBLIC_PATHS override", () => {
    process.env.NEXT_PUBLIC_UNLOCKED_PUBLIC_PATHS = "/,/pricing,/pilots";
    assert.equal(isPublicMarketingPathAllowed("/pricing"), true);
    assert.equal(isPublicMarketingPathAllowed("/for-clients"), false);
  });
});
