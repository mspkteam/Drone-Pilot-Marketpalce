import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickHighestPublicWing } from "./pick-highest";
import type { PublicPilotWingDto } from "@/types/wing";

function wing(
  partial: Partial<PublicPilotWingDto> & Pick<PublicPilotWingDto, "code" | "title" | "rarity">,
): PublicPilotWingDto {
  return {
    description: "",
    category: "milestone",
    iconLabel: null,
    imageUrl: null,
    earnedAt: new Date().toISOString(),
    ...partial,
  };
}

describe("pickHighestPublicWing", () => {
  it("returns null for an empty list", () => {
    assert.equal(pickHighestPublicWing([]), null);
  });

  it("picks the highest rarity wing", () => {
    const best = pickHighestPublicWing([
      wing({ code: "common", title: "Common Wing", rarity: "COMMON" }),
      wing({ code: "legendary", title: "Master Aviator Wings", rarity: "LEGENDARY" }),
      wing({ code: "rare", title: "Aviator Wings", rarity: "RARE" }),
    ]);
    assert.equal(best?.code, "legendary");
  });

  it("breaks rarity ties alphabetically by title", () => {
    const best = pickHighestPublicWing([
      wing({ code: "b", title: "Zebra Wings", rarity: "EPIC" }),
      wing({ code: "a", title: "Alpha Wings", rarity: "EPIC" }),
    ]);
    assert.equal(best?.title, "Alpha Wings");
  });
});
