import type { WaitlistRoleInterest } from "@/types/waitlist";

export function getWaitlistRoleLabel(role: WaitlistRoleInterest): string {
  const labels: Record<WaitlistRoleInterest, string> = {
    pilot: "Pilot",
    client: "Client",
    both: "Pilot & client",
  };
  return labels[role];
}
