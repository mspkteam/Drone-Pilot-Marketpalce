"use client";



import Link from "next/link";

import { useRouter } from "next/navigation";

import { useCallback, useEffect, useState } from "react";

import {

  buildExtendedFormPayload,

  PilotSubmitProposalExtendedSections,

  type ExtendedProposalFormState,

} from "@/components/dashboard/pilot/proposals/PilotSubmitProposalExtendedSections";

import { PilotProposalTermsModal } from "@/components/dashboard/pilot/proposals/PilotProposalTermsModal";

import {

  draftStorageKey,

  pricingBreakdownTotal,

  PROPOSAL_DELIVERABLE_OPTIONS,

  type ProposalDeliverable,

  type ProposalDurationUnit,

} from "@/lib/applications/proposal-metadata";

import { formatJobBudget } from "@/lib/jobs/format-budget";

import { formatJobVisibilityDelay } from "@/lib/subscriptions/status";

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

    permitsWaivers: "",

    travelLodging: "",

    safetyPlan: "",

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

    proposedAmount: total > 0 ? String(total) : "",

  };

}



function JobSummaryCard({ job }: { job: PilotOpenJobDto }) {

  const budget = formatJobBudget(job.budgetMin, job.budgetMax, job.currency);



  return (

    <section className="pilot-submit-job-card" aria-label="Mission summary">

      <div className="pilot-submit-job-card-head">

        <div className="pilot-submit-job-thumb" aria-hidden />

        <div>

          <h2 className="pilot-submit-job-title">{job.title}</h2>

          <p className="pilot-submit-job-location">{job.locationLabel}</p>

        </div>

      </div>

      <dl className="pilot-submit-job-meta">

        <div>

          <dt>Category</dt>

          <dd>{categoryLabel(job.category)}</dd>

        </div>

        <div>

          <dt>Budget</dt>

          <dd>{budget ?? "TBD"}</dd>

        </div>

        <div>

          <dt>Scheduled date</dt>

          <dd>{formatDisplayDate(job.scheduledDate)}</dd>

        </div>

        <div>

          <dt>Priority</dt>

          <dd>Standard</dd>

        </div>

      </dl>

      <div className="pilot-submit-job-copy">

        <div>

          <h3>Description</h3>

          <p>{job.description}</p>

        </div>

        {job.requirements ? (

          <div>

            <h3>Requirements</h3>

            <p>{job.requirements}</p>

          </div>

        ) : null}

      </div>

    </section>

  );

}



export function PilotSubmitProposalView({ jobId, initial }: PilotSubmitProposalViewProps) {

  const router = useRouter();

  const { job, membership } = initial;

  const [form, setForm] = useState<FormState>(emptyForm);

  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [termsOpen, setTermsOpen] = useState(false);



  const patchForm = useCallback((patch: Partial<FormState>) => {

    setForm((current) => syncProposedAmount({ ...current, ...patch }));

  }, []);



  useEffect(() => {

    try {

      const raw = localStorage.getItem(draftStorageKey(jobId));

      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<FormState>;

      setForm((current) =>

        syncProposedAmount({

          ...current,

          ...parsed,

          termsAcknowledged: false,

          accuracyConfirmed: false,

        }),

      );

    } catch {

      /* ignore corrupt draft */

    }

  }, [jobId]);



  const saveDraft = useCallback(() => {

    try {

      const { termsAcknowledged: _terms, accuracyConfirmed: _accuracy, ...draft } = form;

      localStorage.setItem(draftStorageKey(jobId), JSON.stringify(draft));

    } catch {

      /* storage unavailable */

    }

  }, [form, jobId]);



  function toggleDeliverable(item: ProposalDeliverable) {

    setForm((current) => {

      const has = current.deliverables.includes(item);

      return {

        ...current,

        deliverables: has

          ? current.deliverables.filter((d) => d !== item)

          : [...current.deliverables, item],

      };

    });

  }



  function updatePortfolioLink(index: number, value: string) {

    setForm((current) => {

      const next = [...current.portfolioLinks];

      next[index] = value;

      return { ...current, portfolioLinks: next };

    });

  }



  function addPortfolioLink() {

    setForm((current) => ({

      ...current,

      portfolioLinks: [...current.portfolioLinks, ""],

    }));

  }



  function setDurationUnit(unit: ProposalDurationUnit) {

    patchForm({ estimatedDurationUnit: unit });

  }



  async function submitProposal() {

    setError(null);

    setSubmitting(true);

    try {

      const payload = buildExtendedFormPayload(form);

      const res = await fetch(`/api/pilot/jobs/${jobId}/applications`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          ...payload,

          proposedAmount: form.proposedAmount,

          currency: job.currency,

        }),

      });

      const data = await res.json();

      if (!res.ok) {

        setError(data.error ?? "Failed to submit proposal.");

        return;

      }

      localStorage.removeItem(draftStorageKey(jobId));

      router.push("/dashboard/pilot/proposals?submitted=1");

      router.refresh();

    } catch {

      setError("Failed to submit proposal.");

    } finally {

      setSubmitting(false);

      setTermsOpen(false);

    }

  }



  function handleSubmitClick(e: React.FormEvent) {

    e.preventDefault();

    setError(null);

    if (!form.termsAcknowledged) {

      setTermsOpen(true);

      return;

    }

    void submitProposal();

  }



  return (

    <div className="pilot-submit-page">

      <header className="pilot-submit-header">

        <div className="pilot-submit-header-nav">

          <Link href={`/dashboard/pilot/jobs/${jobId}`} className="pilot-submit-back">

            ← Back

          </Link>

        </div>

        <p className="pilot-submit-eyebrow">PILOT / MARKETPLACE</p>

        <h1 className="pilot-submit-title">Submit Proposal</h1>

        <p className="pilot-submit-desc">

          Send your initial offer for this mission. The client will review your proposal

          before any contract planning begins.

        </p>

        <p className="pilot-submit-unlock" role="status">

          ✓ This job is unlocked for your grade. You may submit a proposal.

        </p>

      </header>



      <div className="pilot-submit-layout">

        <div className="pilot-submit-main">

          <JobSummaryCard job={job} />



          <form className="pilot-submit-form" onSubmit={handleSubmitClick} noValidate>

            <h2 className="pilot-submit-form-title">Your Proposal</h2>



            {error ? (

              <p className="pilot-submit-error" role="alert">

                {error}

              </p>

            ) : null}



            <div className="pilot-submit-duration-row">

              <div className="pilot-submit-mini-card">

                <span className="pilot-submit-mini-label">

                  Estimated Hours / Days <span aria-hidden>*</span>

                </span>

                <div className="pilot-submit-counter">

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

                  <span>

                    {form.estimatedDurationAmount}{" "}

                    {form.estimatedDurationUnit === "days" ? "Days" : "Hours"}

                  </span>

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

                </div>

              </div>

              <div className="pilot-submit-unit-toggle" role="group" aria-label="Duration unit">

                <button

                  type="button"

                  className={

                    form.estimatedDurationUnit === "hours"

                      ? "pilot-submit-unit-btn pilot-submit-unit-btn--active"

                      : "pilot-submit-unit-btn"

                  }

                  onClick={() => setDurationUnit("hours")}

                >

                  Hours

                </button>

                <button

                  type="button"

                  className={

                    form.estimatedDurationUnit === "days"

                      ? "pilot-submit-unit-btn pilot-submit-unit-btn--active"

                      : "pilot-submit-unit-btn"

                  }

                  onClick={() => setDurationUnit("days")}

                >

                  Days

                </button>

              </div>

            </div>



            <label className="pilot-submit-field">

              <span>

                Estimated Delivery Date <span aria-hidden>*</span>

              </span>

              <input

                type="date"

                required

                value={form.estimatedDeliveryDate}

                onChange={(e) => patchForm({ estimatedDeliveryDate: e.target.value })}

              />

            </label>



            <label className="pilot-submit-field">

              <span>

                Cover Message <span aria-hidden>*</span>

              </span>

              <textarea

                rows={5}

                required

                value={form.message}

                onChange={(e) => patchForm({ message: e.target.value })}

                placeholder="Briefly describe your approach, equipment, and availability."

              />

            </label>



            <label className="pilot-submit-field">

              <span>Relevant Experience</span>

              <textarea

                rows={3}

                value={form.experience}

                onChange={(e) => patchForm({ experience: e.target.value })}

              />

            </label>



            <fieldset className="pilot-submit-fieldset">

              <legend>

                Deliverables Included <span aria-hidden>*</span>

              </legend>

              <div className="pilot-submit-checkgrid">

                {PROPOSAL_DELIVERABLE_OPTIONS.map((item) => (

                  <label key={item} className="pilot-submit-check">

                    <input

                      type="checkbox"

                      checked={form.deliverables.includes(item)}

                      onChange={() => toggleDeliverable(item)}

                    />

                    <span>{item}</span>

                  </label>

                ))}

              </div>

            </fieldset>



            <PilotSubmitProposalExtendedSections

              form={form}

              currency={job.currency}

              onChange={patchForm}

            />



            <div className="pilot-submit-field">

              <span>Portfolio / Attachments (Optional)</span>

              {form.portfolioLinks.map((link, index) => (

                <input

                  key={index}

                  type="url"

                  placeholder="https://"

                  value={link}

                  onChange={(e) => updatePortfolioLink(index, e.target.value)}

                />

              ))}

              <button

                type="button"

                className="pilot-submit-link-btn"

                onClick={addPortfolioLink}

              >

                + Add Another Link

              </button>

            </div>



            <p className="pilot-submit-notice">

              This is an initial proposal only. Final mission details are confirmed after

              the client accepts your offer and contract planning begins.

            </p>



            <label className="pilot-submit-terms-inline">

              <input

                type="checkbox"

                checked={form.termsAcknowledged}

                onChange={(e) =>

                  setForm((current) => ({ ...current, termsAcknowledged: e.target.checked }))

                }

              />

              <span>

                I acknowledge off-platform billing violates platform terms and may result

                in permanent removal.{" "}

                <button

                  type="button"

                  className="pilot-submit-terms-link"

                  onClick={() => setTermsOpen(true)}

                >

                  Read terms

                </button>

              </span>

            </label>



            <div className="pilot-submit-actions">

              <button

                type="submit"

                className="pilot-submit-btn-primary"

                disabled={submitting}

              >

                {submitting ? "Submitting…" : "Submit Proposal"}

              </button>

              <button

                type="button"

                className="pilot-submit-btn-secondary"

                disabled={submitting}

                onClick={saveDraft}

              >

                Save as draft

              </button>

            </div>

          </form>

        </div>



        <aside className="pilot-submit-sidebar" aria-label="Proposal guidance">

          <section className="pilot-submit-side-card">

            <h2>Proposal Tips</h2>

            <ul>

              <li>Break down pricing so the client understands your costs.</li>

              <li>Confirm availability that matches the mission schedule.</li>

              <li>Include operational details, permits, and safety planning.</li>

              <li>List deliverables the client will receive.</li>

            </ul>

          </section>



          {membership ? (

            <section className="pilot-submit-side-card">

              <h2>Grade &amp; Visibility</h2>

              <p className="pilot-submit-tier">{membership.tierName}</p>

              <p className="pilot-submit-muted">

                Job visible {formatJobVisibilityDelay(membership.jobVisibilityDelayHours).toLowerCase()}

              </p>

              <Link href="/dashboard/pilot/subscription" className="pilot-submit-side-link">

                View Grade Benefits →

              </Link>

            </section>

          ) : null}



          <section className="pilot-submit-side-card">

            <h2>How It Works</h2>

            <ol className="pilot-submit-steps">

              <li>Submit your initial proposal.</li>

              <li>Client reviews and may shortlist or request revisions.</li>

              <li>After acceptance, contract planning begins.</li>

              <li>Deliver work and receive payment through the platform.</li>

            </ol>

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


