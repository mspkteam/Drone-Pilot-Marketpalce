import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deriveRarity } from "@/lib/admin/badge-display";
import type { WingDefinitionDto } from "@/types/wing";

function wing(code: string): WingDefinitionDto {
  return {
    id: "w1",
    code,
    title: code,
    description: "",
    category: "milestone",
    iconLabel: null,
    imageUrl: null,
    autoRule: null,
    ruleParam: null,
    threshold: null,
    isActive: true,
    sortOrder: 0,
    awardedCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("deriveRarity", () => {
  it("maps recreational aviator gold to uncommon and crew silver to common", () => {
    assert.equal(deriveRarity(wing("recreational-aviator-gold")), "UNCOMMON");
    assert.equal(deriveRarity(wing("remote-aviation-crew-silver")), "COMMON");
  });
});
