/** Client notification preference UI state — persisted on ClientProfile.preferencesJson. */

import type { ClientProfilePreferencesDto } from "@/types/client";

export type ClientNotificationPreferences = {
  emailUpdates: boolean;
  newBids: boolean;
  messages: boolean;
  projectUpdates: boolean;
};

export const CLIENT_NOTIFICATION_DEFAULTS: ClientNotificationPreferences = {
  emailUpdates: true,
  newBids: true,
  messages: true,
  projectUpdates: false,
};

export const CLIENT_NOTIFICATION_ROWS: readonly {
  key: keyof ClientNotificationPreferences;
  title: string;
  description: string;
}[] = [
  {
    key: "emailUpdates",
    title: "Email updates",
    description: "Weekly summary of activity",
  },
  {
    key: "newBids",
    title: "New quotes",
    description: "Get notified when a pilot bids on your project",
  },
  {
    key: "messages",
    title: "Messages",
    description: "Direct messages from pilots",
  },
  {
    key: "projectUpdates",
    title: "Project updates",
    description: "Status changes and approvals",
  },
] as const;

export function notificationPreferencesFromProfile(
  preferences: ClientProfilePreferencesDto | undefined,
): ClientNotificationPreferences {
  return preferences?.notifications ?? { ...CLIENT_NOTIFICATION_DEFAULTS };
}

