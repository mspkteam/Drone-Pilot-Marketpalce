import { prisma } from "@/lib/db";
import { parseClientProfilePreferences } from "@/lib/client/preferences";
import { parseBillingAddress } from "@/lib/client/profile";
import {
  PLATFORM_DEFAULT_TIMEZONE,
  normalizeTimeZone,
  pickTimezoneFromRegionCodes,
  timezoneFromAreaLabel,
  timezoneFromCountry,
} from "@/lib/format/timezone";
import { parseProfileExtrasJson } from "@/lib/pilot/profile-extras";

/**
 * Resolve the IANA timezone used for this user's notification timestamps.
 *
 * Policy (B6):
 * - Pilot → first selected operating region (by region sort order)
 * - Client → billing country, else typical project area label
 * - Admin / unknown → platform default (America/Chicago)
 * Delivery stays immediate; only display timezone is region-aware.
 */
export async function resolveUserNotificationTimezone(
  userId: string,
): Promise<string> {
  const [user, regions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        pilotProfile: {
          select: {
            locationCountry: true,
            profileExtrasJson: true,
          },
        },
        clientProfile: {
          select: {
            billingAddress: true,
            preferencesJson: true,
          },
        },
      },
    }),
    prisma.operatingRegion.findMany({
      where: { isActive: true },
      select: { code: true, timezone: true, sortOrder: true },
      orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
    }),
  ]);

  if (!user) return PLATFORM_DEFAULT_TIMEZONE;

  const regionTimezones = Object.fromEntries(
    regions.map((r) => [r.code.trim().toLowerCase(), r.timezone]),
  );

  if (user.role === "pilot" && user.pilotProfile) {
    const extras = parseProfileExtrasJson(user.pilotProfile.profileExtrasJson);
    const fromRegions = pickTimezoneFromRegionCodes(
      extras.operatingRegionCodes,
      regions,
    );
    if (fromRegions) return normalizeTimeZone(fromRegions);

    const fromCountry = timezoneFromCountry(
      user.pilotProfile.locationCountry,
      regionTimezones,
    );
    if (fromCountry) return normalizeTimeZone(fromCountry);
  }

  if (user.role === "client" && user.clientProfile) {
    const billing = parseBillingAddress(user.clientProfile.billingAddress);
    const fromBilling = timezoneFromCountry(billing?.country, regionTimezones);
    if (fromBilling) return normalizeTimeZone(fromBilling);

    const prefs = parseClientProfilePreferences(
      user.clientProfile.preferencesJson,
    );
    const fromArea = timezoneFromAreaLabel(
      prefs.typicalProjectArea,
      regionTimezones,
    );
    if (fromArea) return normalizeTimeZone(fromArea);
  }

  return PLATFORM_DEFAULT_TIMEZONE;
}
