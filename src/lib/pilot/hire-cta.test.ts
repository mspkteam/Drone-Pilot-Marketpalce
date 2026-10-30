import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  browsePilotsHref,
  canHirePilot,
  hireCaptainHref,
  hireMarketplaceHref,
  normalizeHireViewerRole,
} from "@/lib/pilot/hire-cta";

describe("hire CTA hierarchy", () => {
  it("maps unknown roles to guest and staff to admin", () => {
    assert.equal(normalizeHireViewerRole(undefined), "guest");
    assert.equal(normalizeHireViewerRole("moderator"), "admin");
    assert.equal(canHirePilot("admin"), false);
  });

  it("sends guests to client register", () => {
    assert.equal(hireMarketplaceHref("guest", "p1", "Alex"), "/register?role=client");
    assert.equal(hireCaptainHref("guest"), "/register?role=client");
    assert.equal(canHirePilot("guest"), true);
  });

  it("lets clients hire via post-project with preferred pilot", () => {
    const href = hireMarketplaceHref("client", "p1", "Alex Pilot");
    assert.ok(href?.startsWith("/dashboard/client/jobs/new?"));
    assert.ok(href?.includes("preferredPilot=p1"));
    assert.equal(hireCaptainHref("client"), "/dashboard/client/find-pilots");
    assert.equal(browsePilotsHref("client"), "/dashboard/client/find-pilots");
  });

  it("does not let pilots hire pilots", () => {
    assert.equal(hireMarketplaceHref("pilot", "p1", "Alex"), null);
    assert.equal(hireCaptainHref("pilot"), null);
    assert.equal(canHirePilot("pilot"), false);
    assert.equal(browsePilotsHref("pilot"), "/pilots");
  });
});
