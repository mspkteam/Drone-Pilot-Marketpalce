import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clientFirstDisplayName,
  clientFullDisplayName,
} from "@/lib/client/display-name";

describe("client display names", () => {
  it("returns first token for welcome copy", () => {
    assert.equal(
      clientFirstDisplayName({ contactName: "Jane Marie Smith" }),
      "Jane",
    );
  });

  it("returns full display name with fallbacks", () => {
    assert.equal(
      clientFullDisplayName({
        contactName: "",
        companyName: "Acme Corp",
      }),
      "Acme Corp",
    );
    assert.equal(clientFullDisplayName({ fallback: "Client" }), "Client");
  });
});
