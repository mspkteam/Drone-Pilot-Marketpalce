import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import {
  getClientIp,
  isTurnstileRequired,
  verifyTurnstileToken,
} from "@/lib/security/turnstile";

describe("turnstile", () => {
  const originalSecret = process.env.TURNSTILE_SECRET_KEY;
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.TURNSTILE_SECRET_KEY;
    } else {
      process.env.TURNSTILE_SECRET_KEY = originalSecret;
    }
    globalThis.fetch = originalFetch;
  });

  it("is not required when secret is unset", () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    assert.equal(isTurnstileRequired(), false);
  });

  it("skips verification when secret is unset", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const result = await verifyTurnstileToken(null);
    assert.equal(result.ok, true);
  });

  it("rejects missing token when secret is set", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    const result = await verifyTurnstileToken("");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /security check/i);
    }
  });

  it("verifies token with Cloudflare when secret is set", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    globalThis.fetch = mock.fn(async () =>
      Response.json({ success: true }),
    ) as typeof fetch;

    const result = await verifyTurnstileToken("token-123", "203.0.113.1");
    assert.equal(result.ok, true);
    assert.equal((globalThis.fetch as ReturnType<typeof mock.fn>).mock.calls.length, 1);
  });

  it("extracts client IP from forwarded headers", () => {
    const request = new Request("https://example.com/api/waitlist", {
      headers: {
        "x-forwarded-for": "203.0.113.1, 70.41.3.18",
      },
    });
    assert.equal(getClientIp(request), "203.0.113.1");
  });
});
