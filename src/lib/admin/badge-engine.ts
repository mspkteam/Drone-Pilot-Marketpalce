import {
  enrichBadgeDefinition,
  MOCK_BADGE_CARDS,
} from "@/lib/admin/badge-display";
import { getBadgeStatsForAdmin } from "@/lib/admin/badge-stats";
import {
  listPilotsForWingAssign,
  listRecentPilotWingsForAdmin,
  listWingDefinitionsForAdmin,
} from "@/lib/wings/wings";
import type { AdminBadgeEngineDataDto } from "@/types/admin-badges";

export async function getAdminBadgeEngineData(): Promise<AdminBadgeEngineDataDto> {
  const [definitions, recentAwards, pilots] = await Promise.all([
    listWingDefinitionsForAdmin(),
    listRecentPilotWingsForAdmin(),
    listPilotsForWingAssign(),
  ]);

  const usingMockBadges = definitions.length === 0;
  const badges = usingMockBadges
    ? MOCK_BADGE_CARDS
    : definitions.map(enrichBadgeDefinition);

  const stats = await getBadgeStatsForAdmin(
    usingMockBadges ? MOCK_BADGE_CARDS : definitions,
  );

  return {
    badges,
    stats,
    recentAwards,
    pilots,
    usingMockBadges,
  };
}
