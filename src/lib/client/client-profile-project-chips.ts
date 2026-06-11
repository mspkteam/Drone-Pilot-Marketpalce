export const CLIENT_PROFILE_PROJECT_CHIPS = [
  "Real Estate",
  "Roof Inspection",
  "Construction",
  "Aerial Photography",
  "Events",
  "Thermal",
  "Survey Mapping",
  "Agriculture",
  "Emergency Response",
  "Custom Drone Work",
] as const;

export type ClientProjectChip = (typeof CLIENT_PROFILE_PROJECT_CHIPS)[number];
