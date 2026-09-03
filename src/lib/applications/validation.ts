import {
  formatAvailabilityLabel,
  pricingBreakdownTotal,
  PROPOSAL_DELIVERABLE_OPTIONS,
  type ProposalCompliance,
  type ProposalDeliverable,
  type ProposalDetails,
  type ProposalDurationUnit,
  type ProposalOperationalPlan,
  type ProposalPricingBreakdown,
} from "@/lib/applications/proposal-metadata";

export type ApplicationInput = {
  proposedAmount?: number | string;
  message?: string | null;
  estimatedDeliveryDate?: string | null;
  currency?: string;
  availability?: string | null;
  estimatedDurationAmount?: number | string;
  estimatedDurationUnit?: ProposalDurationUnit;
  equipment?: string | null;
  experience?: string | null;
  deliverables?: string[];
  assumptions?: string | null;
  portfolioLinks?: string[];
  attachments?: { url?: string; name?: string; contentType?: string }[];
  operationalPlan?: Partial<ProposalOperationalPlan>;
  compliance?: Partial<ProposalCompliance>;
  pricingBreakdown?: Partial<ProposalPricingBreakdown>;
  accuracyConfirmed?: boolean;
};

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function parseMoney(value: number | string | undefined): number | null {
  if (value == null || value === "") return null;
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) return null;
  return amount;
}

function parseOperationalPlanInput(
  input: Partial<ProposalOperationalPlan> | undefined,
): ProposalOperationalPlan | null {
  if (!input) return null;

  const projectedMileage = input.projectedMileage?.trim() || null;
  const flightTimeEstimate = input.flightTimeEstimate?.trim() || null;
  const droneEquipment = input.droneEquipment?.trim() || null;
  const groundSupport = input.groundSupport?.trim() || null;

  const numberOfFlights =
    typeof input.numberOfFlights === "number" && input.numberOfFlights >= 1
      ? Math.floor(input.numberOfFlights)
      : 1;
  const crewCount =
    typeof input.crewCount === "number" && input.crewCount >= 1
      ? Math.floor(input.crewCount)
      : 1;

  if (!flightTimeEstimate || !droneEquipment) {
    return null;
  }

  return {
    projectedMileage,
    flightTimeEstimate,
    numberOfFlights,
    droneEquipment,
    groundSupport,
    crewCount,
  };
}

function parseComplianceInput(
  input: Partial<ProposalCompliance> | undefined,
): ProposalCompliance | null {
  if (!input) return null;

  const permitsWaivers = input.permitsWaivers?.trim() || null;
  const travelLodging = input.travelLodging?.trim() || null;
  const safetyPlan = input.safetyPlan?.trim() || null;
  const insuranceCoverage = input.insuranceCoverage?.trim() || null;
  const otherRequirements = input.otherRequirements?.trim() || null;

  if (!permitsWaivers || !travelLodging || !safetyPlan) {
    return null;
  }

  return {
    permitsWaivers,
    travelLodging,
    safetyPlan,
    insuranceCoverage,
    otherRequirements,
  };
}

function parsePricingInput(
  input: Partial<ProposalPricingBreakdown> | undefined,
): ProposalPricingBreakdown | null {
  if (!input) return null;

  const flightOperations = parseMoney(input.flightOperations);
  const travelMileage = parseMoney(input.travelMileage);
  const equipmentBatteries = parseMoney(input.equipmentBatteries);
  const planningDelivery = parseMoney(input.planningDelivery);

  if (
    flightOperations == null ||
    travelMileage == null ||
    equipmentBatteries == null ||
    planningDelivery == null
  ) {
    return null;
  }

  if (
    flightOperations < 0 ||
    travelMileage < 0 ||
    equipmentBatteries < 0 ||
    planningDelivery < 0
  ) {
    return null;
  }

  return {
    flightOperations,
    travelMileage,
    equipmentBatteries,
    planningDelivery,
  };
}

export function validateApplicationInput(
  input: ApplicationInput,
): ValidationResult<{
  proposedAmount: number;
  message: string | null;
  estimatedDeliveryDate: string | null;
  currency: string;
  proposalDetails: ProposalDetails | null;
}> {
  const pricingBreakdown = parsePricingInput(input.pricingBreakdown);
  let amount = parseMoney(input.proposedAmount);

  if (pricingBreakdown) {
    const breakdownTotal = pricingBreakdownTotal(pricingBreakdown);
    if (breakdownTotal <= 0) {
      return {
        ok: false,
        error: "Pricing breakdown must total more than zero.",
      };
    }
    if (amount != null && Math.abs(amount - breakdownTotal) > 0.01) {
      return {
        ok: false,
        error: "Proposed amount must match the pricing breakdown total.",
      };
    }
    amount = breakdownTotal;
  }

  if (amount == null || amount <= 0) {
    return { ok: false, error: "Enter a valid proposed amount greater than zero." };
  }

  const message = input.message?.trim() || null;
  if (!message || message.length < 10) {
    return {
      ok: false,
      error: "Cover message must be at least 10 characters.",
    };
  }
  if (message.length > 1000) {
    return {
      ok: false,
      error: "Cover message must be 1000 characters or fewer.",
    };
  }

  const durationAmountRaw = parseMoney(input.estimatedDurationAmount);
  const durationUnit: ProposalDurationUnit =
    input.estimatedDurationUnit === "days" ? "days" : "hours";
  const durationAmount =
    durationAmountRaw != null && durationAmountRaw >= 1
      ? Math.floor(durationAmountRaw)
      : null;

  const availabilityFromDuration =
    durationAmount != null
      ? formatAvailabilityLabel(durationAmount, durationUnit)
      : null;
  const availability = input.availability?.trim() || availabilityFromDuration;

  if (!availability) {
    return {
      ok: false,
      error: "Estimated hours or days is required.",
    };
  }

  let estimatedDeliveryDate: string | null = input.estimatedDeliveryDate ?? null;
  if (estimatedDeliveryDate === "") estimatedDeliveryDate = null;
  if (!estimatedDeliveryDate) {
    return { ok: false, error: "Estimated delivery date is required." };
  }
  const deliveryDate = new Date(estimatedDeliveryDate);
  if (Number.isNaN(deliveryDate.getTime())) {
    return { ok: false, error: "Invalid estimated delivery date." };
  }

  const deliverables = (input.deliverables ?? []).filter((item): item is ProposalDeliverable =>
    PROPOSAL_DELIVERABLE_OPTIONS.includes(item as ProposalDeliverable),
  );
  if (deliverables.length === 0) {
    return { ok: false, error: "Select at least one deliverable." };
  }

  const operationalPlan = parseOperationalPlanInput(input.operationalPlan);
  if (!operationalPlan) {
    return {
      ok: false,
      error: "Complete operational plan fields: flight time and equipment.",
    };
  }

  const compliance = parseComplianceInput(input.compliance);
  if (!compliance) {
    return {
      ok: false,
      error:
        "Complete compliance fields: permits, travel/lodging, and safety plan.",
    };
  }

  if (!pricingBreakdown) {
    return {
      ok: false,
      error: "Enter all pricing breakdown amounts.",
    };
  }

  if (input.accuracyConfirmed !== true) {
    return {
      ok: false,
      error: "Confirm the accuracy and compliance statement before submitting.",
    };
  }

  const portfolioLinks = (input.portfolioLinks ?? [])
    .map((link) => link.trim())
    .filter(Boolean);

  const attachments = (input.attachments ?? [])
    .filter(
      (item): item is { url: string; name: string; contentType: string } =>
        !!item &&
        typeof item.url === "string" &&
        item.url.trim().length > 0 &&
        typeof item.name === "string" &&
        typeof item.contentType === "string",
    )
    .map((item) => ({
      url: item.url.trim(),
      name: item.name.trim() || "Attachment",
      contentType: item.contentType.trim() || "application/octet-stream",
    }));

  const proposalDetails: ProposalDetails = {
    availability,
    estimatedDurationAmount: durationAmount ?? undefined,
    estimatedDurationUnit: durationUnit,
    equipment: operationalPlan.droneEquipment,
    experience: input.experience?.trim() || null,
    deliverables,
    assumptions: input.assumptions?.trim() || null,
    portfolioLinks,
    attachments,
    operationalPlan,
    compliance,
    pricingBreakdown,
    accuracyConfirmed: true,
  };

  return {
    ok: true,
    data: {
      proposedAmount: amount,
      message,
      estimatedDeliveryDate,
      currency: input.currency?.trim() || "USD",
      proposalDetails,
    },
  };
}
