"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildExtendedFormPayload,
  CREW_OPTIONS,
  EQUIPMENT_OPTIONS,
  PLAN_MAX_CHARS,
  PilotSubmitProposalExtendedSections,
  type ExtendedProposalFormState,
} from "@/components/dashboard/pilot/proposals/PilotSubmitProposalExtendedSections";
import { PilotProposalTermsModal } from "@/components/dashboard/pilot/proposals/PilotProposalTermsModal";
import { PostProjectDateField } from "@/components/dashboard/client/post-project/PostProjectDateField";
import { PostProjectTermsAcknowledgment } from "@/components/dashboard/client/post-project/PostProjectTermsAcknowledgment";
import {
  draftStorageKey,
  parseProposalDraftForm,
  pricingBreakdownTotal,
  PROPOSAL_DELIVERABLE_OPTIONS,
  type ProposalDeliverable,
} from "@/lib/applications/proposal-metadata";
import { formatJobBudget } from "@/lib/jobs/format-budget";
import { JOB_CATEGORIES } from "@/types/job";
import type { PilotJobDetailDto, PilotOpenJobDto } from "@/types/application";

type FormState = ExtendedProposalFormState & {
  experience: string;
  deliverables: ProposalDeliverable[];
  portfolioLinks: string[];
  termsAcknowledged: boolean;
};

type PilotSubmitProposalViewProps = {
  jobId: string;
  initial: PilotJobDetailDto;
};

function categoryLabel(id: string): string {
  return JOB_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function formatDisplayDate(iso: string | null): string {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
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

function peopleLabel(count: number): string {
  return `${count} ${count === 1 ? "Person" : "People"}`;
}

function jobIdLabel(id: string): string {
  return `JOB-${id.slice(-8).toUpperCase()}`;
}

function emptyForm(): FormState {
  return {
    proposedAmount: "",
    estimatedDurationAmount: 1,
    estimatedDurationUnit: "hours",
    estimatedDeliveryDate: "",
    message: "",
    projectedMileage: "",
    flightTimeEstimate: "",
    numberOfFlights: 1,
    droneEquipment: "",
    groundSupport: "",
    crewCount: 1,
    travelRequired: "",
    travelDetails: "",
    permitsWaivers: "",
    travelLodging: "",
    safetyPlan: "",
    insuranceCoverage: "",
    otherRequirements: "",
    assumptions: "",
    pricingFlightOperations: "",
    pricingTravelMileage: "",
    pricingEquipmentBatteries: "",
    pricingPlanningDelivery: "",
    accuracyConfirmed: false,
    experience: "",
    deliverables: [],
    portfolioLinks: [""],
    termsAcknowledged: false,
  };
}

function syncProposedAmount(form: FormState): FormState {
  const total = pricingBreakdownTotal({
    flightOperations: Number(form.pricingFlightOperations) || 0,
    travelMileage: Number(form.pricingTravelMileage) || 0,
    equipmentBatteries: Number(form.pricingEquipmentBatteries) || 0,
    planningDelivery: Number(form.pricingPlanningDelivery) || 0,
  });
  return {
    ...form,
    proposedAmount: total > 0 ? String(total) : form.proposedAmount,
  };
}

function quoteTypeLabel(job: PilotOpenJobDto): string {
  if (job.postProject?.quoteTypeLabel) return job.postProject.quoteTypeLabel;
  if (job.budgetMin != null && job.budgetMax != null) return "Fixed budget";
  return "Pilot proposals";
}

function requestedDeliverables(job: PilotOpenJobDto): string {
  if (job.postProject?.deliverables.length) {
    return job.postProject.deliverables.join(", ");
  }
  return "To be confirmed";
}

function prefillDeliverables(job: PilotOpenJobDto): ProposalDeliverable[] {
  return (job.postProject?.deliverables ?? []).filter((item): item is ProposalDeliverable =>
    PROPOSAL_DELIVERABLE_OPTIONS.includes(item as ProposalDeliverable),
  );
}

function MissionSplitCards({ job }: { job: PilotOpenJobDto }) {
  const budget = formatJobBudget(job.budgetMin, job.budgetMax, job.currency) ?? "TBD";
  const deliverables = requestedDeliverables(job);
  const priority = job.postProject?.priorityLabel ?? "Standard";
  const completion = formatDisplayDate(
    job.postProject?.completionDate ?? job.scheduledDate,
  );

  return (
    <div className="pilot-submit-split">
      <section className="pilot-submit-split-card" aria-label="Description">
        <h2>Description</h2>
        <p>
          {job.description.trim() ||
            `${job.clientDisplayName} posted this mission via the project wizard.`}
        </p>
        <dl>
          <div>
            <dt>Deliverables requested:</dt>
            <dd>{deliverables}</dd>
          </div>
          <div>
            <dt>Quote type:</dt>
            <dd>{quoteTypeLabel(job)}</dd>
          </div>
          <div>
            <dt>Priority:</dt>
            <dd>{priority}</dd>
          </div>
        </dl>
      </section>
      <section className="pilot-submit-split-card" aria-label="Requirements">
        <h2>Requirements</h2>
        <dl>
          <div>
            <dt>Deliverables:</dt>
            <dd>{deliverables}</dd>
          </div>
          <div>
            <dt>Completion target:</dt>
            <dd>{completion}</dd>
          </div>
          <div>
            <dt>Budget:</dt>
            <dd>{budget.replace("–", " - ")}</dd>
          </div>
          <div>
            <dt>Client review:</dt>
            <dd>Offers reviewed after submission</dd>
          </div>
        </dl>
        {job.requirements ? <p>{job.requirements}</p> : null}
      </section>
    </div>
  );
}

function applyStoredDraft(parsed: Partial<FormState>): FormState {
  return syncProposedAmount({
    ...emptyForm(),
    ...parsed,
    termsAcknowledged: false,
    accuracyConfirmed: parsed.accuracyConfirmed === true,
  });
}

export function PilotSubmitProposalView({ jobId, initial }: PilotSubmitProposalViewProps) {
  const router = useRouter();
  const { job } = initial;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [deliverableMenu, setDeliverableMenu] = useState("");

  const budget = formatJobBudget(job.budgetMin, job.budgetMax, job.currency);
  const metaLine = [
    job.locationLabel,
    categoryLabel(job.category),
    budget?.replace("–", " – ") ?? "Budget TBD",
    `Scheduled ${formatDisplayDate(job.scheduledDate)}`,
  ].join("  •  ");

  const snapshotAmount = useMemo(() => {
    const total = pricingBreakdownTotal({
      flightOperations: Number(form.pricingFlightOperations) || 0,
      travelMileage: Number(form.pricingTravelMileage) || 0,
      equipmentBatteries: Number(form.pricingEquipmentBatteries) || 0,
      planningDelivery: Number(form.pricingPlanningDelivery) || 0,
    });
    const amount = total > 0 ? total : Number(form.proposedAmount) || 0;
    return amount > 0 ? formatUsd(amount, job.currency) : "—";
  }, [form, job.currency]);

  const patchForm = useCallback((patch: Partial<FormState>) => {
    setForm((current) => syncProposedAmount({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    const serverForm = initial.application?.draftForm as Partial<FormState> | undefined;
    if (serverForm && Object.keys(serverForm).length > 0) {
      setForm(applyStoredDraft(serverForm));
      return;
    }
    try {
      const raw = localStorage.getItem(draftStorageKey(jobId));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FormState>;
        setForm(applyStoredDraft(parsed));
        return;
      }
    } catch {
      /* ignore corrupt draft */
    }
    const fromJob = prefillDeliverables(job);
    if (fromJob.length) {
      setForm((current) => ({ ...current, deliverables: fromJob }));
    }
  }, [job, jobId, initial.application]);

  useEffect(() => {
    if (!termsOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTermsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [termsOpen]);

  const saveDraft = useCallback(async () => {
    setError(null);
    setDraftSaved(false);
    setSavingDraft(true);
    const { termsAcknowledged: _terms, ...draft } = form;
    try {
      localStorage.setItem(draftStorageKey(jobId), JSON.stringify(draft));
    } catch {
      /* still try server */
    }
    try {
      const res = await fetch(`/api/pilot/jobs/${jobId}/applications/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedAmount: Number(form.proposedAmount) || 0,
          message: form.message,
          estimatedDeliveryDate: form.estimatedDeliveryDate || null,
          currency: job.currency,
          draftForm: draft,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save draft.");
        return;
      }
      setDraftSaved(true);
    } catch {
      setError("Could not save draft.");
    } finally {
      setSavingDraft(false);
    }
  }, [form, job.currency, jobId]);

  function addDeliverable(item: string) {
    if (!PROPOSAL_DELIVERABLE_OPTIONS.includes(item as ProposalDeliverable)) return;
    const value = item as ProposalDeliverable;
    setForm((current) => ({
      ...current,
      deliverables: current.deliverables.includes(value)
        ? current.deliverables
        : [...current.deliverables, value],
    }));
    setDeliverableMenu("");
  }

  function removeDeliverable(item: ProposalDeliverable) {
    setForm((current) => ({
      ...current,
      deliverables: current.deliverables.filter((entry) => entry !== item),
    }));
  }

  function validateBeforeModal(): string | null {
    if (!form.proposedAmount || Number(form.proposedAmount) <= 0) {
      return "Enter a valid proposed amount.";
    }
    if (form.estimatedDurationAmount < 1) {
      return "Estimated hours or days is required.";
    }
    if (form.deliverables.length === 0) {
      return "Select at least one deliverable.";
    }
    if (!form.estimatedDeliveryDate) {
      return "Estimated delivery date is required.";
    }
    if (!form.droneEquipment) {
      return "Select aircraft / primary equipment.";
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      return "Operational plan must be at least 10 characters.";
    }
    if (!form.travelRequired) {
      return "Select whether travel or lodging is required.";
    }
    if (form.travelRequired === "Yes" && !form.travelDetails.trim()) {
      return "Enter travel / lodging details.";
    }
    if (!form.flightTimeEstimate) {
      return "Select total flight time.";
    }
    if (
      !form.permitsWaivers ||
      !form.safetyPlan ||
      !form.insuranceCoverage ||
      !form.otherRequirements
    ) {
      return "Select Yes or No for permits, safety plan, insurance, and other requirements.";
    }
    if (
      !form.pricingFlightOperations ||
      !form.pricingTravelMileage ||
      !form.pricingEquipmentBatteries ||
      !form.pricingPlanningDelivery
    ) {
      return "Enter all pricing breakdown amounts.";
    }
    const breakdownTotal = pricingBreakdownTotal({
      flightOperations: Number(form.pricingFlightOperations) || 0,
      travelMileage: Number(form.pricingTravelMileage) || 0,
      equipmentBatteries: Number(form.pricingEquipmentBatteries) || 0,
      planningDelivery: Number(form.pricingPlanningDelivery) || 0,
    });
    if (Math.abs(Number(form.proposedAmount) - breakdownTotal) > 0.01) {
      return "Proposed amount must match the pricing breakdown total.";
    }
    return null;
  }

  async function submitProposal() {
    setError(null);
    setSubmitting(true);
    try {
      const payload = buildExtendedFormPayload(form);
      const res = await fetch(`/api/pilot/jobs/${jobId}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:         JSON.stringify({
          ...payload,
          proposedAmount: form.proposedAmount,
          currency: job.currency,
          accuracyConfirmed: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit proposal.");
        return;
      }
      localStorage.removeItem(draftStorageKey(jobId));
      setTermsOpen(false);
      router.push("/dashboard/pilot/proposals?submitted=1");
      router.refresh();
    } catch {
      setError("Failed to submit proposal.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmitClick(e: React.FormEvent) {
    e.preventDefault();
    const nextError = validateBeforeModal();
    if (nextError) {
      setError(nextError);
      const complianceMissing = nextError.toLowerCase().includes("permits");
      const target = document.getElementById(
        complianceMissing ? "pilot-submit-compliance" : "pilot-submit-error",
      );
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setError(null);
    setTermsOpen(true);
  }

  const remainingDeliverables = PROPOSAL_DELIVERABLE_OPTIONS.filter(
    (item) => !form.deliverables.includes(item),
  );
  const amountHelper =
    job.budgetMin != null && job.budgetMax != null
      ? `Enter amount between $${job.budgetMin.toLocaleString()} - $${job.budgetMax.toLocaleString()}`
      : "Enter your proposed amount for this mission.";

  return (
    <div className="pilot-submit-page">
      <header className="pilot-submit-header pilot-submit-bracket-card">
        <p className="pilot-submit-eyebrow">PILOT / MARKETPLACE</p>
        <h1 className="pilot-submit-title">{job.title}</h1>
        <p className="pilot-submit-meta">{metaLine}</p>
      </header>

      <div className="pilot-submit-layout">
        <div className="pilot-submit-main">
          <MissionSplitCards job={job} />

          <form className="pilot-submit-form" onSubmit={handleSubmitClick} noValidate>
            <header className="pilot-submit-form-head">
              <h2>Submit your bid</h2>
              <p>
                Provide a complete operational proposal so the client can understand the
                scope, execution plan, and cost basis.
              </p>
            </header>

            {error ? (
              <p id="pilot-submit-error" className="pilot-submit-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="pilot-submit-form-body">
              <div className="pilot-submit-grid-2">
                <label className="pilot-submit-field">
                  <span>
                    Proposed Amount (USD) <i>*</i>
                  </span>
                  <div className="pilot-submit-amount">
                    <span aria-hidden>$</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={form.proposedAmount}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          proposedAmount: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <em className="pilot-submit-hint-gold">{amountHelper}</em>
                </label>

                <div className="pilot-submit-field">
                  <span>
                    Estimated Hours / Days <i>*</i>
                  </span>
                  <div className="pilot-submit-qty pilot-submit-qty--unit">
                    <button
                      type="button"
                      aria-label="Decrease duration"
                      onClick={() =>
                        patchForm({
                          estimatedDurationAmount: Math.max(
                            1,
                            form.estimatedDurationAmount - 1,
                          ),
                        })
                      }
                    >
                      −
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={form.estimatedDurationAmount}
                      aria-label="Duration amount"
                    />
                    <button
                      type="button"
                      aria-label="Increase duration"
                      onClick={() =>
                        patchForm({
                          estimatedDurationAmount: form.estimatedDurationAmount + 1,
                        })
                      }
                    >
                      +
                    </button>
                    <select
                      value={form.estimatedDurationUnit}
                      aria-label="Duration unit"
                      onChange={(e) =>
                        patchForm({
                          estimatedDurationUnit:
                            e.target.value === "days" ? "days" : "hours",
                        })
                      }
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>

                <div className="pilot-submit-field">
                  <span>
                    Deliverables (Select all that apply) <i>*</i>
                  </span>
                  <div className="pilot-submit-chips">
                    {form.deliverables.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="pilot-submit-chip"
                        onClick={() => removeDeliverable(item)}
                      >
                        {item} ×
                      </button>
                    ))}
                    {remainingDeliverables.length > 0 ? (
                      <select
                        value={deliverableMenu}
                        aria-label="Add deliverable"
                        onChange={(e) => addDeliverable(e.target.value)}
                      >
                        <option value="">Add</option>
                        {remainingDeliverables.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                  <em>You can select multiple options</em>
                </div>

                <div className="pilot-submit-field">
                  <span>
                    Estimated Delivery Date <i>*</i>
                  </span>
                  <PostProjectDateField
                    id="pilot-proposal-delivery-date"
                    value={form.estimatedDeliveryDate}
                    onChange={(estimatedDeliveryDate) =>
                      patchForm({ estimatedDeliveryDate })
                    }
                    placeholder="dd/mm/yyyy"
                  />
                </div>

                <label className="pilot-submit-field">
                  <span>
                    Crew / Personnel <i>*</i>
                  </span>
                  <select
                    value={form.crewCount}
                    onChange={(e) =>
                      patchForm({ crewCount: Math.max(1, Number(e.target.value) || 1) })
                    }
                  >
                    {CREW_OPTIONS.map((count) => (
                      <option key={count} value={count}>
                        {peopleLabel(count)}
                      </option>
                    ))}
                  </select>
                  <em className="pilot-submit-hint-gold">Select number of crew members</em>
                </label>

                <label className="pilot-submit-field">
                  <span>
                    Equipment / Aircraft <i>*</i>
                  </span>
                  <select
                    required
                    value={form.droneEquipment}
                    onChange={(e) => patchForm({ droneEquipment: e.target.value })}
                  >
                    <option value="">Select</option>
                    {EQUIPMENT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <em className="pilot-submit-hint-gold">
                    Select aircraft / primary equipment
                  </em>
                </label>
              </div>

              <label className="pilot-submit-field">
                <span>
                  Operational Plan / Approach <i>*</i>
                </span>
                <textarea
                  rows={4}
                  required
                  maxLength={PLAN_MAX_CHARS}
                  value={form.message}
                  onChange={(e) => patchForm({ message: e.target.value })}
                  placeholder="I will conduct this mission using a structured flight plan, pre-flight site survey, and visual flight rules."
                />
                <span className="pilot-submit-counter-text">
                  {form.message.length}/{PLAN_MAX_CHARS} characters
                </span>
              </label>

              <PilotSubmitProposalExtendedSections
                form={form}
                currency={job.currency}
                onChange={patchForm}
              />

              <PostProjectTermsAcknowledgment
                variant="review"
                acknowledged={form.termsAcknowledged}
                onOpenTerms={() => {
                  setError(null);
                  setTermsOpen(true);
                }}
              />

              <div className="pilot-submit-actions">
                <button type="submit" className="pilot-submit-btn-primary" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Application"}
                </button>
                <button
                  type="button"
                  className="pilot-submit-btn-secondary"
                  disabled={submitting || savingDraft}
                  onClick={() => void saveDraft()}
                >
                  {savingDraft ? "Saving…" : draftSaved ? "Draft saved" : "Save Draft"}
                </button>
                <span className="pilot-submit-draft-hint">
                  ⓘ Saved to your account — you can finish and submit later
                </span>
              </div>
            </div>
          </form>
        </div>

        <aside className="pilot-submit-sidebar" aria-label="Order summary">
          <section className="pilot-submit-side-card">
            <h2>Order Summary</h2>
            <dl className="pilot-submit-side-rows">
              <div>
                <dt>Job ID</dt>
                <dd>{jobIdLabel(job.id)}</dd>
              </div>
              <div>
                <dt>Job Title</dt>
                <dd>{job.title}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{job.locationLabel}</dd>
              </div>
              <div>
                <dt>Scheduled Date</dt>
                <dd>{formatDisplayDate(job.scheduledDate)}</dd>
              </div>
              <div>
                <dt>Budget</dt>
                <dd>{budget?.replace("–", " - ") ?? "TBD"}</dd>
              </div>
              <div>
                <dt>Quote Type</dt>
                <dd>{quoteTypeLabel(job)}</dd>
              </div>
            </dl>
            <div className="pilot-submit-side-block">
              <h3>Deliverables</h3>
              <p>{requestedDeliverables(job)}</p>
            </div>
            <div className="pilot-submit-side-block">
              <h3>Proposal Snapshot</h3>
              <dl className="pilot-submit-side-rows">
                <div>
                  <dt>Bid Amount</dt>
                  <dd className="pilot-submit-bid">{snapshotAmount}</dd>
                </div>
                <div>
                  <dt>Estimated Hours</dt>
                  <dd>
                    {form.estimatedDurationAmount}{" "}
                    {form.estimatedDurationUnit === "days" ? "Days" : "Hours"}
                  </dd>
                </div>
                <div>
                  <dt>Projected Mileage</dt>
                  <dd>
                    {form.travelRequired === "Yes"
                      ? form.travelDetails.trim() || "Required"
                      : form.travelRequired === "No"
                        ? "None"
                        : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Crew</dt>
                  <dd>{peopleLabel(form.crewCount)}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="pilot-submit-side-card">
            <h2>What Client Sees</h2>
            <ul>
              <li>How the pilot will conduct the operation.</li>
              <li>Projected mileage and travel requirement.</li>
              <li>Flight time, number of flights, and crew estimate.</li>
              <li>Equipment and waiver or clearance needs.</li>
              <li>Pricing breakdown that justifies the bid.</li>
            </ul>
          </section>

          <section className="pilot-submit-side-card pilot-submit-side-card--info">
            <h2>ⓘ Important</h2>
            <ul>
              <li>
                Dropdowns are used for fixed choices like crew, flights, equipment, and
                compliance.
              </li>
              <li>Text areas have character limits and internal scrolling.</li>
              <li>Long text will not resize or break the layout.</li>
              <li>Pricing and estimated values stay structured for client review.</li>
            </ul>
          </section>
        </aside>
      </div>

      <PilotProposalTermsModal
        open={termsOpen}
        acknowledged={form.termsAcknowledged}
        loading={submitting}
        onAcknowledgedChange={(acknowledged) =>
          setForm((current) => ({ ...current, termsAcknowledged: acknowledged }))
        }
        onCancel={() => setTermsOpen(false)}
        onSubmit={() => {
          if (!form.termsAcknowledged) return;
          void submitProposal();
        }}
      />
    </div>
  );
}
