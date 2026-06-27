import { formatPilotDayRateLabel } from "@/lib/client/pilot-pricing";
import type { NotificationDto } from "@/types/notification";
import { PILOT_SERVICE_OPTIONS } from "@/types/pilot";
import type { PublicPilotListItemDto } from "@/types/public-pilot";

export type ClientDashboardStat = {
  label: string;
  value: string;
  helper: string;
};

export type ClientProjectStatus = "quotes_received" | "pilot_selected" | "awaiting_quotes";

export type ClientRecentProject = {
  id: string;
  title: string;
  metadata: string;
  status: ClientProjectStatus;
  statusLabel: string;
  href: string;
};

export type ClientActivityItem = {
  id: string;
  actor: string;
  action: string;
  project: string;
  timestamp: string;
};

export type ClientRecommendedPilot = {
  id: string;
  initials: string;
  name: string;
  location: string;
  rating: string;
  projects: string;
  hours: string;
  tags: string[];
  priceAmount: string;
  profileHref: string;
  verified?: boolean;
};

export type ClientDashboardOverviewData = {
  clientName: string;
  stats: ClientDashboardStat[];
  recentProjects: ClientRecentProject[];
  recentActivity: ClientActivityItem[];
  recommendedPilots: ClientRecommendedPilot[];
};

export const CLIENT_DASHBOARD_ROUTES = {
  postProject: "/dashboard/client/jobs/new",
  browsePilots: "/dashboard/client/find-pilots",
  viewAllProjects: "/dashboard/client/jobs",
  seeAllPilots: "/dashboard/client/find-pilots",
} as const;

export function formatDashboardRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

const SERVICE_LABELS = Object.fromEntries(
  PILOT_SERVICE_OPTIONS.map((option) => [option.id, option.label]),
) as Record<string, string>;

export function mapNotificationToActivity(
  notification: NotificationDto,
): ClientActivityItem {
  const jobTitle =
    typeof notification.payload?.jobTitle === "string"
      ? notification.payload.jobTitle
      : typeof notification.payload?.jobId === "string"
        ? "Your project"
        : "Workspace";

  if (notification.type === "bid_received") {
    const match = notification.body.match(/^(.+?) submitted an offer on "(.+)"\.$/);
    return {
      id: notification.id,
      actor: match?.[1] ?? "A pilot",
      action: "submitted a proposal",
      project: match?.[2] ?? jobTitle,
      timestamp: formatDashboardRelativeTime(notification.createdAt),
    };
  }

  if (notification.type === "booking_completed") {
    return {
      id: notification.id,
      actor: "System",
      action: "Project completed",
      project: jobTitle,
      timestamp: formatDashboardRelativeTime(notification.createdAt),
    };
  }

  if (notification.type === "message_received") {
    return {
      id: notification.id,
      actor: "Pilot",
      action: "sent you a message",
      project: jobTitle,
      timestamp: formatDashboardRelativeTime(notification.createdAt),
    };
  }

  return {
    id: notification.id,
    actor: "System",
    action: notification.title.toLowerCase(),
    project: jobTitle,
    timestamp: formatDashboardRelativeTime(notification.createdAt),
  };
}

export function mapPublicPilotToRecommended(
  pilot: PublicPilotListItemDto,
): ClientRecommendedPilot {
  const location =
    [pilot.locationCity, pilot.locationRegion].filter(Boolean).join(", ") ||
    "Location not set";

  const tags = pilot.servicesOffered
    .slice(0, 3)
    .map((service) => SERVICE_LABELS[service] ?? service);

  let priceAmount = formatPilotDayRateLabel(
    pilot.hourlyRateMin,
    pilot.hourlyRateMax,
  );
  if (priceAmount.startsWith("from ")) {
    priceAmount = priceAmount.slice(5);
  }

  return {
    id: pilot.id,
    initials: initialsFromName(pilot.displayName),
    name: pilot.displayName,
    location,
    rating: pilot.averageRating != null ? pilot.averageRating.toFixed(1) : "New",
    projects:
      pilot.reviewCount > 0
        ? `${pilot.reviewCount} review${pilot.reviewCount === 1 ? "" : "s"}`
        : "New pilot",
    hours: pilot.reviewCount >= 5 ? "Experienced" : "Verified operator",
    tags: tags.length > 0 ? tags : ["Drone services"],
    priceAmount,
    profileHref: `/pilots/${pilot.id}`,
    verified: true,
  };
}
