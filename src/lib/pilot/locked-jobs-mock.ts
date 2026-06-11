import type { PilotLockedJobCard } from "@/lib/pilot/locked-jobs-map";

function unlockIn(hours: number, minutes: number, seconds: number): string {
  return new Date(
    Date.now() + hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000,
  ).toISOString();
}

/** Sample locked missions when API returns no tier-delayed jobs (UI only). */
export const PILOT_LOCKED_JOBS_MOCK: readonly PilotLockedJobCard[] = [
  {
    id: "mock-locked-1",
    title: "Coral Reef Protection Initiative",
    budget: "$6,500",
    reason: "Insufficient resources",
    unlockAt: unlockIn(5, 45, 30),
    requirement: "B2 CERTIFICATE",
  },
  {
    id: "mock-locked-2",
    title: "Urban Wildlife Habitat Restoration",
    budget: "$7,800",
    reason: "Requires further studies",
    unlockAt: unlockIn(2, 30, 15),
    requirement: "C3 CERTIFICATE",
  },
  {
    id: "mock-locked-3",
    title: "Sustainable Agriculture Development",
    budget: "$8,300",
    reason: "Project scope too broad",
    unlockAt: unlockIn(1, 20, 45),
    requirement: "B1 CERTIFICATE",
  },
  {
    id: "mock-locked-4",
    title: "Biodiversity Awareness Drive",
    budget: "$11,600",
    reason: "Missing key partnerships",
    unlockAt: unlockIn(3, 50, 10),
    requirement: "A3 CERTIFICATE",
  },
  {
    id: "mock-locked-5",
    title: "Renewable Energy Promotion Campaign",
    budget: "$10,400",
    reason: "Funding insufficient",
    unlockAt: unlockIn(6, 15, 0),
    requirement: "C2 CERTIFICATE",
  },
  {
    id: "mock-locked-6",
    title: "Clean Water Access Program",
    budget: "$9,000",
    reason: "Community feedback needed",
    unlockAt: unlockIn(4, 5, 20),
    requirement: "A2 CERTIFICATE",
  },
] as const;
