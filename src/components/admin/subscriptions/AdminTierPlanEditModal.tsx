"use client";

import { useEffect, useId, useState } from "react";
import { PricingFeatureIcon } from "@/components/marketing/pricing/PricingFeatureIcon";
import { DashboardModalPortal } from "@/components/ui/DashboardModalPortal";
import { formatJobVisibilityDelay } from "@/lib/subscriptions/status";
import type { AdminPlanDto, AdminPlanUpdateInput } from "@/types/admin";

type AdminTierPlanEditModalProps = {
  plan: AdminPlanDto;
  focusFeatures: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: AdminPlanUpdateInput) => void;
};

export function AdminTierPlanEditModal({
  plan,
  focusFeatures,
  saving,
  error,
  onClose,
  onSave,
}: AdminTierPlanEditModalProps) {
  const titleId = useId();
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
  const [priceMonthly, setPriceMonthly] = useState(String(plan.priceMonthly));
  const [jobVisibilityDelayHours, setJobVisibilityDelayHours] = useState(
    String(plan.jobVisibilityDelayHours),
  );
  const [canViewJobs, setCanViewJobs] = useState(plan.canViewJobs);
  const [canApply, setCanApply] = useState(plan.canApply);
  const [instructorEligible, setInstructorEligible] = useState(
    plan.instructorEligible,
  );
  const [isRecommended, setIsRecommended] = useState(plan.isRecommended);
  const [isActive, setIsActive] = useState(plan.isActive);
  const [displayFeatures, setDisplayFeatures] = useState(plan.displayFeatures);

  useEffect(() => {
    setName(plan.name);
    setDescription(plan.description);
    setPriceMonthly(String(plan.priceMonthly));
    setJobVisibilityDelayHours(String(plan.jobVisibilityDelayHours));
    setCanViewJobs(plan.canViewJobs);
    setCanApply(plan.canApply);
    setInstructorEligible(plan.instructorEligible);
    setIsRecommended(plan.isRecommended);
    setIsActive(plan.isActive);
    setDisplayFeatures(plan.displayFeatures);
  }, [plan]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, saving]);

  function handleFeatureLabelChange(index: number, label: string) {
    setDisplayFeatures((current) =>
      current.map((feature, i) =>
        i === index ? { ...feature, label } : feature,
      ),
    );
  }

  function handleFeatureIncludedChange(index: number, included: boolean) {
    setDisplayFeatures((current) =>
      current.map((feature, i) =>
        i === index ? { ...feature, included } : feature,
      ),
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSave({
      name,
      description,
      priceMonthly: Number(priceMonthly) || 0,
      jobVisibilityDelayHours: Number(jobVisibilityDelayHours) || 0,
      canViewJobs,
      canApply,
      instructorEligible,
      isRecommended,
      isActive,
      displayFeatures,
    });
  }

  const visibilityPreview = formatJobVisibilityDelay(
    Number(jobVisibilityDelayHours) || 0,
  );

  return (
    <DashboardModalPortal>
      <div
        className="admin-subscriptions-modal-backdrop"
        role="presentation"
        onClick={() => {
          if (!saving) onClose();
        }}
      >
        <div
          className="admin-subscriptions-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="admin-subscriptions-modal-head">
            <h2 id={titleId} className="admin-subscriptions-modal-title">
              {focusFeatures ? "Manage Features" : "Edit Plan"} —{" "}
              {plan.pricingCode ?? plan.code}
            </h2>
            <p className="admin-subscriptions-modal-sub">
              Changes persist to the membership tier database. Stripe mapping is
              not integrated.
            </p>
          </div>

          <form className="admin-subscriptions-modal-form" onSubmit={handleSubmit}>
            <div className="admin-subscriptions-modal-body">
              {error ? (
                <p
                  className="admin-subscriptions-banner admin-subscriptions-banner--error"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              {!focusFeatures ? (
                <>
                  <div className="admin-subscriptions-field-grid admin-subscriptions-field-grid--2">
                    <div className="admin-subscriptions-field">
                      <label htmlFor="tier-code">Tier code</label>
                      <input
                        id="tier-code"
                        value={plan.pricingCode ?? plan.code}
                        readOnly
                      />
                    </div>
                    <div className="admin-subscriptions-field">
                      <label htmlFor="tier-name">Tier name</label>
                      <input
                        id="tier-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-subscriptions-field">
                    <label htmlFor="tier-description">Short description</label>
                    <textarea
                      id="tier-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="admin-subscriptions-field-grid admin-subscriptions-field-grid--2">
                    <div className="admin-subscriptions-field">
                      <label htmlFor="tier-price">Monthly price (USD)</label>
                      <input
                        id="tier-price"
                        type="number"
                        min={0}
                        step={0.01}
                        value={priceMonthly}
                        onChange={(event) => setPriceMonthly(event.target.value)}
                      />
                    </div>
                    <div className="admin-subscriptions-field">
                      <label htmlFor="tier-visibility">
                        Job visibility delay (hours)
                      </label>
                      <input
                        id="tier-visibility"
                        type="number"
                        min={0}
                        step={1}
                        value={jobVisibilityDelayHours}
                        onChange={(event) =>
                          setJobVisibilityDelayHours(event.target.value)
                        }
                      />
                      <p className="admin-subscriptions-commission-note">
                        Preview: {visibilityPreview}
                      </p>
                    </div>
                  </div>

                  <label className="admin-subscriptions-check-row">
                    <input
                      type="checkbox"
                      checked={canViewJobs}
                      onChange={(event) => setCanViewJobs(event.target.checked)}
                    />
                    Can view jobs
                  </label>
                  <label className="admin-subscriptions-check-row">
                    <input
                      type="checkbox"
                      checked={canApply}
                      onChange={(event) => setCanApply(event.target.checked)}
                    />
                    Can submit proposals / bids
                  </label>
                  <label className="admin-subscriptions-check-row">
                    <input
                      type="checkbox"
                      checked={instructorEligible}
                      onChange={(event) =>
                        setInstructorEligible(event.target.checked)
                      }
                    />
                    Instructor eligible
                  </label>
                  <label className="admin-subscriptions-check-row">
                    <input
                      type="checkbox"
                      checked={isRecommended}
                      onChange={(event) =>
                        setIsRecommended(event.target.checked)
                      }
                    />
                    Recommended tier
                  </label>
                  <label className="admin-subscriptions-check-row">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(event) => setIsActive(event.target.checked)}
                    />
                    Active / visible to pilots
                  </label>
                </>
              ) : null}

              <div className="admin-subscriptions-feature-editor">
                <p className="admin-subscriptions-commission-title">
                  Included features
                </p>
                {displayFeatures.map((feature, index) => (
                  <div
                    key={`${feature.sortOrder}-${index}`}
                    className="admin-subscriptions-feature-row"
                  >
                    <input
                      value={feature.label}
                      onChange={(event) =>
                        handleFeatureLabelChange(index, event.target.value)
                      }
                      aria-label={`Feature ${index + 1}`}
                    />
                    <label className="admin-subscriptions-check-row admin-subscriptions-check-row--compact">
                      <input
                        type="checkbox"
                        checked={feature.included}
                        onChange={(event) =>
                          handleFeatureIncludedChange(
                            index,
                            event.target.checked,
                          )
                        }
                      />
                      <PricingFeatureIcon included={feature.included} />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-subscriptions-modal-foot">
              <button
                type="button"
                className="admin-subscriptions-btn admin-subscriptions-btn--ghost"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-subscriptions-btn admin-subscriptions-btn--primary"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Plan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardModalPortal>
  );
}
