"use client";

import {
  pricingBreakdownTotal,
  type ProposalDurationUnit,
} from "@/lib/applications/proposal-metadata";

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
  permitsWaivers: string;
  travelLodging: string;
  safetyPlan: string;
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

function CounterField({
  label,
  value,
  suffix,
  onDecrement,
  onIncrement,
}: {
  label: string;
  value: number;
  suffix: string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="pilot-submit-mini-card">
      <span className="pilot-submit-mini-label">{label}</span>
      <div className="pilot-submit-counter">
        <button type="button" onClick={onDecrement} aria-label={`Decrease ${label}`}>
          −
        </button>
        <span>
          {value} {suffix}
        </span>
        <button type="button" onClick={onIncrement} aria-label={`Increase ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

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
      <section className="pilot-submit-subcard" aria-label="Operational plan">
        <h3 className="pilot-submit-subcard-title">Operational Plan &amp; Estimations</h3>
        <p className="pilot-submit-subcard-lead">
          Explain how the pilot will conduct the mission and what resources are required.
        </p>
        <div className="pilot-submit-mini-grid">
          <label className="pilot-submit-mini-card">
            <span className="pilot-submit-mini-label">Projected Mileage</span>
            <input
              type="text"
              value={form.projectedMileage}
              placeholder="120 miles round trip"
              onChange={(e) => onChange({ projectedMileage: e.target.value })}
            />
          </label>
          <label className="pilot-submit-mini-card">
            <span className="pilot-submit-mini-label">Flight Time Estimate</span>
            <input
              type="text"
              value={form.flightTimeEstimate}
              placeholder="4.5 hours total flight window"
              onChange={(e) => onChange({ flightTimeEstimate: e.target.value })}
            />
          </label>
          <CounterField
            label="Number of Flights"
            value={form.numberOfFlights}
            suffix="Flights"
            onDecrement={() =>
              onChange({
                numberOfFlights: Math.max(1, form.numberOfFlights - 1),
              })
            }
            onIncrement={() =>
              onChange({ numberOfFlights: form.numberOfFlights + 1 })
            }
          />
          <label className="pilot-submit-mini-card pilot-submit-mini-card--wide">
            <span className="pilot-submit-mini-label">Drone / Equipment To Be Used</span>
            <textarea
              rows={2}
              value={form.droneEquipment}
              placeholder="DJI Mavic 3 Enterprise, spare batteries, landing pad"
              onChange={(e) => onChange({ droneEquipment: e.target.value })}
            />
          </label>
          <label className="pilot-submit-mini-card">
            <span className="pilot-submit-mini-label">Ground Support / Vehicle</span>
            <input
              type="text"
              value={form.groundSupport}
              placeholder="4x4 vehicle for site access"
              onChange={(e) => onChange({ groundSupport: e.target.value })}
            />
          </label>
          <CounterField
            label="Crew / Personnel"
            value={form.crewCount}
            suffix="People"
            onDecrement={() =>
              onChange({ crewCount: Math.max(1, form.crewCount - 1) })
            }
            onIncrement={() => onChange({ crewCount: form.crewCount + 1 })}
          />
        </div>
      </section>

      <section className="pilot-submit-subcard" aria-label="Compliance and travel">
        <h3 className="pilot-submit-subcard-title">
          Compliance, Travel &amp; Site Requirements
        </h3>
        <div className="pilot-submit-mini-grid pilot-submit-mini-grid--two">
          <label className="pilot-submit-mini-card">
            <span className="pilot-submit-mini-label">Permits / Waivers / Clearances</span>
            <input
              type="text"
              value={form.permitsWaivers}
              placeholder="Airspace review and site permission check required"
              onChange={(e) => onChange({ permitsWaivers: e.target.value })}
            />
          </label>
          <label className="pilot-submit-mini-card">
            <span className="pilot-submit-mini-label">Travel / Lodging Required</span>
            <input
              type="text"
              value={form.travelLodging}
              placeholder="Travel required, lodging not included"
              onChange={(e) => onChange({ travelLodging: e.target.value })}
            />
          </label>
          <label className="pilot-submit-mini-card pilot-submit-mini-card--wide">
            <span className="pilot-submit-mini-label">Risk Management / Safety Plan</span>
            <textarea
              rows={3}
              value={form.safetyPlan}
              placeholder="Pre-flight weather check, obstacle assessment, controlled takeoff and landing zone..."
              onChange={(e) => onChange({ safetyPlan: e.target.value })}
            />
          </label>
          <label className="pilot-submit-mini-card pilot-submit-mini-card--wide">
            <span className="pilot-submit-mini-label">Additional Notes</span>
            <textarea
              rows={3}
              value={form.assumptions}
              placeholder="Final flight path and capture list will be confirmed after client communication."
              onChange={(e) => onChange({ assumptions: e.target.value })}
            />
          </label>
        </div>
      </section>

      <section className="pilot-submit-subcard" aria-label="Pricing justification">
        <h3 className="pilot-submit-subcard-title">Pricing Justification</h3>
        <p className="pilot-submit-subcard-lead">
          Break down the proposal amount so the client can see how mileage, flight time,
          and operational needs affect the price.
        </p>
        <div className="pilot-submit-pricing-grid">
          {(
            [
              ["pricingFlightOperations", "Flight Operations"],
              ["pricingTravelMileage", "Travel Mileage"],
              ["pricingEquipmentBatteries", "Equipment / Batteries"],
              ["pricingPlanningDelivery", "Planning / Delivery"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="pilot-submit-price-box">
              <span>{label}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form[key]}
                onChange={(e) => onChange({ [key]: e.target.value })}
              />
            </label>
          ))}
          <div className="pilot-submit-price-box pilot-submit-price-box--total">
            <span>Total Proposal</span>
            <strong>{formatUsd(breakdownTotal, currency)}</strong>
          </div>
        </div>
      </section>

      <label className="pilot-submit-terms-inline">
        <input
          type="checkbox"
          checked={form.accuracyConfirmed}
          onChange={(e) => onChange({ accuracyConfirmed: e.target.checked })}
        />
        <span>
          I confirm that all information provided is accurate and I will conduct the
          operation in accordance with all applicable laws, platform rules, and safety
          requirements.
        </span>
      </label>
    </>
  );
}

export function buildExtendedFormPayload(form: ExtendedProposalFormState & {
  deliverables: string[];
  portfolioLinks: string[];
  experience: string;
}) {
  return {
    proposedAmount: form.proposedAmount,
    message: form.message,
    estimatedDeliveryDate: form.estimatedDeliveryDate,
    estimatedDurationAmount: form.estimatedDurationAmount,
    estimatedDurationUnit: form.estimatedDurationUnit,
    experience: form.experience,
    deliverables: form.deliverables,
    assumptions: form.assumptions,
    portfolioLinks: form.portfolioLinks,
    accuracyConfirmed: form.accuracyConfirmed,
    operationalPlan: {
      projectedMileage: form.projectedMileage,
      flightTimeEstimate: form.flightTimeEstimate,
      numberOfFlights: form.numberOfFlights,
      droneEquipment: form.droneEquipment,
      groundSupport: form.groundSupport,
      crewCount: form.crewCount,
    },
    compliance: {
      permitsWaivers: form.permitsWaivers,
      travelLodging: form.travelLodging,
      safetyPlan: form.safetyPlan,
    },
    pricingBreakdown: {
      flightOperations: form.pricingFlightOperations,
      travelMileage: form.pricingTravelMileage,
      equipmentBatteries: form.pricingEquipmentBatteries,
      planningDelivery: form.pricingPlanningDelivery,
    },
  };
}
