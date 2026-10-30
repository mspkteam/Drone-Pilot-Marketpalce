export type HireViewerRole = "client" | "pilot" | "admin" | "guest";

export function normalizeHireViewerRole(
  role: string | null | undefined,
): HireViewerRole {
  if (role === "client" || role === "pilot") return role;
  if (role === "admin" || role === "super_admin" || role === "moderator") {
    return "admin";
  }
  return "guest";
}

export function canHirePilot(role: HireViewerRole): boolean {
  return role === "guest" || role === "client";
}

export function hireMarketplaceHref(
  role: HireViewerRole,
  pilotProfileId: string,
  displayName: string,
): string | null {
  if (role === "client") {
    const params = new URLSearchParams({
      preferredPilot: pilotProfileId,
      preferredPilotName: displayName,
    });
    return `/dashboard/client/jobs/new?${params.toString()}`;
  }
  if (role === "guest") return "/register?role=client";
  return null;
}

export function browsePilotsHref(role: HireViewerRole): string {
  if (role === "client") return "/dashboard/client/find-pilots";
  return "/pilots";
}

export function hireCaptainHref(role: HireViewerRole): string | null {
  if (role === "client") return "/dashboard/client/find-pilots";
  if (role === "guest") return "/register?role=client";
  return null;
}

export function clientPilotProfileHref(pilotProfileId: string): string {
  return `/dashboard/client/find-pilots/${pilotProfileId}`;
}
