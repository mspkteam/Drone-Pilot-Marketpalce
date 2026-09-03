import { BADGE_RARITY_RANK } from "@/types/admin-badges";
import type { PublicPilotWingDto } from "@/types/wing";

/** Highest rarity wing for public profile hero display. */
export function pickHighestPublicWing(
  wings: PublicPilotWingDto[],
): PublicPilotWingDto | null {
  if (wings.length === 0) return null;
  let best = wings[0]!;
  let bestRank = BADGE_RARITY_RANK[best.rarity] ?? -1;
  for (const wing of wings.slice(1)) {
    const rank = BADGE_RARITY_RANK[wing.rarity] ?? -1;
    if (
      rank > bestRank ||
      (rank === bestRank && wing.title.localeCompare(best.title) < 0)
    ) {
      best = wing;
      bestRank = rank;
    }
  }
  return best;
}
