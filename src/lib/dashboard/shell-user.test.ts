import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildClientShellUser, buildDashboardUser } from "@/lib/dashboard/shell-user";

describe("buildClientShellUser", () => {
  it("uses profile contact name for shell display", () => {
    const user = buildClientShellUser(
      { email: "client@example.com", role: "client" },
      { contactName: "Jane Smith", companyName: "Acme Corp" },
    );

    assert.equal(user.displayName, "Jane Smith");
    assert.equal(user.initials, "JS");
    assert.equal(user.subtitle, "Client account");
  });

  it("falls back to company name then email when contact name missing", () => {
    const fromCompany = buildClientShellUser(
      { email: "client@example.com", role: "client" },
      { contactName: "", companyName: "Acme Corp" },
    );
    assert.equal(fromCompany.displayName, "Acme Corp");

    const fromEmail = buildClientShellUser(
      { email: "client@example.com", role: "client" },
      null,
    );
    assert.equal(fromEmail.displayName, "client");
  });
});

describe("buildDashboardUser", () => {
  it("still supports explicit display name override", () => {
    const user = buildDashboardUser(
      { email: "pilot@example.com", role: "pilot" },
      { displayName: "Call Sign" },
    );
    assert.equal(user.displayName, "Call Sign");
  });
});
