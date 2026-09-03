"use client";

import {
  pricingBreakdownTotal,
  type ProposalDurationUnit,
} from "@/lib/applications/proposal-metadata";

export const CREW_OPTIONS = [1, 2, 3, 4, 5, 6] as const;
export const FLIGHT_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export const YES_NO_OPTIONS = ["Yes", "No"] as const;
export const EQUIPMENT_OPTIONS = [
  "DJI Mavic 3 Enterprise",
  "DJI Mavic 3 Pro",
  "DJI Air 3",
  "Autel EVO II Dual",
  "Skydio X10",
  "Other",
] as const;
export const FLIGHT_TIME_OPTIONS = [
  "1 Hour",
  "2 Hours",
  "3 Hours",
  "4 Hours",
  "5 Hours",
  "6 Hours",
  "8 Hours",
  "10 Hours",
  "12 Hours",
] as const;

export const PLAN_MAX_CHARS = 1000;

export type ExtendedProposalFormState = {
  proposedAmount: string;
  estimatedDurationAmount: number;
  estimatedDurationUnit: ProposalDurationUnit;
  estimatedDeliveryDate: string;
  message: string;
  projectedMileage: string;
  flightTimeEstimate: string;
  numberOfFlights: number;
  droneEquipment: string;
  groundSupport: string;
  crewCount: number;
  travelRequired: string;
  travelDetails: string;
  permitsWaivers: string;
  travelLodging: string;
  safetyPlan: string;
  insuranceCoverage: string;
  otherRequirements: string;
  assumptions: string;
  pricingFlightOperations: string;
  pricingTravelMileage: string;
  pricingEquipmentBatteries: string;
  pricingPlanningDelivery: string;
  accuracyConfirmed: boolean;
};

type PilotSubmitProposalExtendedSectionsProps = {
  form: ExtendedProposalFormState;
  currency: string;
  onChange: (patch: Partial<ExtendedProposalFormState>) => void;
};

function formatUsd(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function peopleLabel(count: number): string {
  return `${count} ${count === 1 ? "Person" : "People"}`;
}

function flightsLabel(count: number): string {
  return `${count} ${count === 1 ? "Flight" : "Flights"}`;
}

export function PilotSubmitProposalExtendedSections({
  form,
  currency,
  onChange,
}: PilotSubmitProposalExtendedSectionsProps) {
  const breakdownTotal = pricingBreakdownTotal({
    flightOperations: Number(form.pricingFlightOperations) || 0,
    travelMileage: Number(form.pricingTravelMileage) || 0,
    equipmentBatteries: Number(form.pricingEquipmentBatteries) || 0,
    planningDelivery: Number(form.pricingPlanningDelivery) || 0,
  });

  return (
    <>
      <div className="pilot-submit-grid-2">
        <label className="pilot-submit-field">
          <span>Travel / Lodging Required</span>
          <select
            value={form.travelRequired}
            onChange={(e) => onChange({ travelRequired: e.target.value })}
          >
            <option value="">Select</option>
            {YES_NO_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <em className="pilot-submit-hint-gold">
            Select Yes if travel or lodging is required
          </em>
        </label>
        <label className="pilot-submit-field">
          <span>Travel / Lodging Details</span>
          <textarea
            rows={2}
            maxLength={PLAN_MAX_CHARS}
            value={form.travelDetails}
            disabled={form.travelRequired !== "Yes"}
            onChange={(e) => onChange({ travelDetails: e.target.value })}
            placeholder="Overnight stay near the site. Hotel and transportation included."
          />
          <span className="pilot-submit-counter-text">
            {form.travelDetails.length}/{PLAN_MAX_CHARS} characters
          </span>
        </label>
      </div>

      <hr className="pilot-submit-divider" />

      <section aria-label="Operational plan">
        <h3 className="pilot-submit-section-title">Operational Plan &amp; Estimations</h3>
        <p className="pilot-submit-section-lead">
          Break down the plan so the client understands your approach and resources.
        </p>
        <div className="pilot-submit-grid-4">
          <label className="pilot-submit-field">
            <span>Flight Operations</span>
            <select
              value={form.numberOfFlights}
              onChange={(e) =>
                onChange({ numberOfFlights: Math.max(1, Number(e.target.value) || 1) })
              }
            >
              {FLIGHT_COUNT_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {flightsLabel(count)}
                </option>
              ))}
            </select>
          </label>
          <label className="pilot-submit-field">
            <span>Total Flight Time</span>
            <select
              value={form.flightTimeEstimate}
              onChange={(e) => onChange({ flightTimeEstimate: e.target.value })}
            >
              <option value="">Select</option>
              {FLIGHT_TIME_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <div className="pilot-submit-field">
            <span>Number of Flights</span>
            <div className="pilot-submit-qty">
              <button
                type="button"
                aria-label="Decrease flights"
                onClick={() =>
                  onChange({ numberOfFlights: Math.max(1, form.numberOfFlights - 1) })
                }
              >
                −
              </button>
              <input
                type="text"
                readOnly
                value={form.numberOfFlights}
                aria-label="Number of flights"
              />
              <button
                type="button"
                aria-label="Increase flights"
                onClick={() =>
                  onChange({ numberOfFlights: Math.min(8, form.numberOfFlights + 1) })
                }
              >
                +
              </button>
            </div>
          </div>
          <label className="pilot-submit-field">
            <span>Crew / Personnel</span>
            <select
              value={form.crewCount}
              onChange={(e) =>
                onChange({ crewCount: Math.max(1, Number(e.target.value) || 1) })
              }
            >
              {CREW_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {peopleLabel(count)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <hr className="pilot-submit-divider" />

      <section id="pilot-submit-compliance" aria-label="Compliance">
        <h3 className="pilot-submit-section-title">
          Compliance, Travel &amp; Site Requirements
        </h3>
        <p className="pilot-submit-section-lead">Confirm all requirements will be met.</p>
        <div className="pilot-submit-grid-4">
          {(
            [
              ["permitsWaivers", "Permits / Waivers / Clearances"],
              ["safetyPlan", "Risk Management / Safety Plan"],
              ["insuranceCoverage", "Insurance Coverage"],
              ["otherRequirements", "Other Requirements"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="pilot-submit-field">
              <span>
                {label} <i>*</i>
              </span>
              <select
                value={form[key]}
                onChange={(e) => onChange({ [key]: e.target.value })}
              >
                <option value="">Select</option>
                {YES_NO_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </section>

      <hr className="pilot-submit-divider" />

      <section aria-label="Pricing justification">
        <h3 className="pilot-submit-section-title">Pricing Justification</h3>
        <p className="pilot-submit-section-lead">
          Explain how the proposed amount covers all mission costs and operational needs.
        </p>
        <div className="pilot-submit-grid-4">
          {(
            [
              ["pricingFlightOperations", "Flight Operations"],
              ["pricingTravelMileage", "Travel / Lodging"],
              ["pricingEquipmentBatteries", "Equipment / Processing"],
              ["pricingPlanningDelivery", "Planning / Delivery"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="pilot-submit-field">
              <span>{label}</span>
              <div className="pilot-submit-amount">
                <span aria-hidden>$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form[key]}
                  onChange={(e) => onChange({ [key]: e.target.value })}
                />
              </div>
            </label>
          ))}
        </div>
        <div className="pilot-submit-grid-2 pilot-submit-total-row">
          <div className="pilot-submit-field">
            <span>Total Proposal Amount</span>
            <p className="pilot-submit-total-amount">{formatUsd(breakdownTotal, currency)}</p>
          </div>
          <aside className="pilot-submit-info-box" aria-label="Important">
            <span className="pilot-submit-info-icon" aria-hidden>
              ⓘ
            </span>
            <p>
              <strong>Important</strong>
              All information provided is accurate and will help the client evaluate your
              proposal effectively.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}

export function buildExtendedFormPayload(
  form: ExtendedProposalFormState & {
    deliverables: string[];
    portfolioLinks: string[];
    attachments?: { url: string; name: string; contentType: string }[];
    experience: string;
    termsAcknowledged?: boolean;
  },
) {
  const travelLodging =
    form.travelRequired === "No"
      ? "No"
      : form.travelDetails.trim() || form.travelLodging.trim();

  return {
    proposedAmount: form.proposedAmount,
    message: form.message,
    estimatedDeliveryDate: form.estimatedDeliveryDate,
    estimatedDurationAmount: form.estimatedDurationAmount,
    estimatedDurationUnit: form.estimatedDurationUnit,
    experience: form.experience,
    deliverables: form.deliverables,
    assumptions: form.assumptions,
    portfolioLinks: form.portfolioLinks.filter((link) => link.trim().length > 0),
    attachments: form.attachments ?? [],
    accuracyConfirmed: form.accuracyConfirmed || form.termsAcknowledged,
    operationalPlan: {
      projectedMileage: form.projectedMileage.trim() || "Not listed",
      flightTimeEstimate: form.flightTimeEstimate,
      numberOfFlights: form.numberOfFlights,
      droneEquipment: form.droneEquipment,
      groundSupport: form.groundSupport,
      crewCount: form.crewCount,
    },
    compliance: {
      permitsWaivers: form.permitsWaivers,
      travelLodging,
      safetyPlan: form.safetyPlan,
      insuranceCoverage: form.insuranceCoverage,
      otherRequirements: form.otherRequirements,
    },
    pricingBreakdown: {
      flightOperations: form.pricingFlightOperations,
      travelMileage: form.pricingTravelMileage,
      equipmentBatteries: form.pricingEquipmentBatteries,
      planningDelivery: form.pricingPlanningDelivery,
    },
  };
}
