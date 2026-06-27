import {
  enrichBadgeDefinition,
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

  const badges = definitions.map(enrichBadgeDefinition);
  const stats = await getBadgeStatsForAdmin(definitions);

  return {
    badges,
    stats,
    recentAwards,
    pilots,
    usingMockBadges: false,
  };
}
