export const PROPOSAL_DELIVERABLE_OPTIONS = [
  "Photos",
  "Video",
  "Survey Data",
  "Edited Files",
  "Raw Files",
  "Inspection Report",
  "Other",
] as const;

export type ProposalDeliverable = (typeof PROPOSAL_DELIVERABLE_OPTIONS)[number];

export const PROPOSAL_DURATION_UNITS = ["hours", "days"] as const;
export type ProposalDurationUnit = (typeof PROPOSAL_DURATION_UNITS)[number];

export type ProposalPricingBreakdown = {
  flightOperations: number;
  travelMileage: number;
  equipmentBatteries: number;
  planningDelivery: number;
};

export type ProposalOperationalPlan = {
  projectedMileage: string | null;
  flightTimeEstimate: string | null;
  numberOfFlights: number;
  droneEquipment: string | null;
  groundSupport: string | null;
  crewCount: number;
};

export type ProposalCompliance = {
  permitsWaivers: string | null;
  travelLodging: string | null;
  safetyPlan: string | null;
  insuranceCoverage: string | null;
  otherRequirements: string | null;
};

export type ProposalDetails = {
  availability?: string | null;
  estimatedDurationAmount?: number;
  estimatedDurationUnit?: ProposalDurationUnit;
  equipment?: string | null;
  experience?: string | null;
  deliverables?: ProposalDeliverable[];
  assumptions?: string | null;
  portfolioLinks?: string[];
  operationalPlan?: ProposalOperationalPlan;
  compliance?: ProposalCompliance;
  pricingBreakdown?: ProposalPricingBreakdown;
  accuracyConfirmed?: boolean;
};

export function pricingBreakdownTotal(breakdown: ProposalPricingBreakdown): number {
  return roundMoney(
    breakdown.flightOperations +
      breakdown.travelMileage +
      breakdown.equipmentBatteries +
      breakdown.planningDelivery,
  );
}

export function formatAvailabilityLabel(
  amount: number,
  unit: ProposalDurationUnit,
): string {
  const label = amount === 1 ? unit.slice(0, -1) : unit;
  return `${amount} ${label}`;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseOperationalPlan(
  value: unknown,
): ProposalOperationalPlan | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<ProposalOperationalPlan>;
  return {
    projectedMileage:
      typeof raw.projectedMileage === "string" ? raw.projectedMileage : null,
    flightTimeEstimate:
      typeof raw.flightTimeEstimate === "string" ? raw.flightTimeEstimate : null,
    numberOfFlights:
      typeof raw.numberOfFlights === "number" && raw.numberOfFlights > 0
        ? raw.numberOfFlights
        : 1,
    droneEquipment:
      typeof raw.droneEquipment === "string" ? raw.droneEquipment : null,
    groundSupport:
      typeof raw.groundSupport === "string" ? raw.groundSupport : null,
    crewCount:
      typeof raw.crewCount === "number" && raw.crewCount > 0
        ? raw.crewCount
        : 1,
  };
}

function parseCompliance(value: unknown): ProposalCompliance | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<ProposalCompliance>;
  return {
    permitsWaivers:
      typeof raw.permitsWaivers === "string" ? raw.permitsWaivers : null,
    travelLodging:
      typeof raw.travelLodging === "string" ? raw.travelLodging : null,
    safetyPlan: typeof raw.safetyPlan === "string" ? raw.safetyPlan : null,
    insuranceCoverage:
      typeof raw.insuranceCoverage === "string" ? raw.insuranceCoverage : null,
    otherRequirements:
      typeof raw.otherRequirements === "string" ? raw.otherRequirements : null,
  };
}

function parsePricingBreakdown(
  value: unknown,
): ProposalPricingBreakdown | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<ProposalPricingBreakdown>;
  const parts = [
    raw.flightOperations,
    raw.travelMileage,
    raw.equipmentBatteries,
    raw.planningDelivery,
  ];
  if (parts.some((part) => typeof part !== "number" || Number.isNaN(part))) {
    return undefined;
  }
  return {
    flightOperations: Math.max(0, raw.flightOperations ?? 0),
    travelMileage: Math.max(0, raw.travelMileage ?? 0),
    equipmentBatteries: Math.max(0, raw.equipmentBatteries ?? 0),
    planningDelivery: Math.max(0, raw.planningDelivery ?? 0),
  };
}

export function parseProposalDetails(json: string | null | undefined): ProposalDetails | null {
  if (!json?.trim()) return null;
  try {
    const parsed = JSON.parse(json) as Partial<ProposalDetails>;
    const unit =
      parsed.estimatedDurationUnit === "days" ? "days" : "hours";
    return {
      availability: parsed.availability ?? null,
      estimatedDurationAmount:
        typeof parsed.estimatedDurationAmount === "number"
          ? parsed.estimatedDurationAmount
          : undefined,
      estimatedDurationUnit: unit,
      equipment: parsed.equipment ?? null,
      experience: parsed.experience ?? null,
      deliverables: Array.isArray(parsed.deliverables)
        ? parsed.deliverables.filter((item): item is ProposalDeliverable =>
            PROPOSAL_DELIVERABLE_OPTIONS.includes(item as ProposalDeliverable),
          )
        : [],
      assumptions: parsed.assumptions ?? null,
      portfolioLinks: Array.isArray(parsed.portfolioLinks)
        ? parsed.portfolioLinks.filter((link): link is string => typeof link === "string")
        : [],
      operationalPlan: parseOperationalPlan(parsed.operationalPlan),
      compliance: parseCompliance(parsed.compliance),
      pricingBreakdown: parsePricingBreakdown(parsed.pricingBreakdown),
      accuracyConfirmed: parsed.accuracyConfirmed === true,
    };
  } catch {
    return null;
  }
}

export function serializeProposalDetails(details: ProposalDetails): string {
  return JSON.stringify(details);
}

export function draftStorageKey(jobId: string): string {
  return `pilot-proposal-draft:${jobId}`;
}
