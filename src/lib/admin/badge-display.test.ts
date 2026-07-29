import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultRarityForCode, deriveRarity } from "@/lib/admin/badge-display";
import type { WingDefinitionDto } from "@/types/wing";
import type { BadgeRarity } from "@/types/admin-badges";

function wing(
  code: string,
  overrides: Partial<WingDefinitionDto> = {},
): WingDefinitionDto {
  return {
    id: "w1",
    code,
    title: code,
    description: "",
    category: "milestone",
    rarity: "COMMON",
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
    ...overrides,
  };
}

describe("deriveRarity", () => {
  it("uses persisted rarity when present", () => {
    assert.equal(
      deriveRarity(wing("custom-wing", { rarity: "UNCOMMON" })),
      "UNCOMMON",
    );
    assert.equal(
      deriveRarity(wing("custom-wing", { rarity: "MYTHIC" })),
      "MYTHIC",
    );
  });

  it("maps canonical wing codes for seed defaults", () => {
    assert.equal(defaultRarityForCode("recreational-aviator-gold"), "UNCOMMON");
    assert.equal(defaultRarityForCode("remote-aviation-crew-silver"), "COMMON");
    assert.equal(defaultRarityForCode("aviator-wings-basic-silver"), "RARE");
    assert.equal(defaultRarityForCode("aviator-wings-basic-gold"), "EPIC");
    assert.equal(defaultRarityForCode("aviator-wings-master"), "MYTHIC");
  });

  it("falls back when rarity value is invalid", () => {
    assert.equal(
      deriveRarity(
        wing("recreational-aviator-gold", {
          rarity: "NOT_A_RARITY" as BadgeRarity,
        }),
      ),
      "UNCOMMON",
    );
  });
});
