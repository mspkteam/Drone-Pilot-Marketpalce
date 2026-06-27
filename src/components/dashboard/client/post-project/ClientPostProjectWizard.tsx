"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon } from "@/components/dashboard/client/post-project/PostProjectIcons";
import { PostProjectProgress } from "@/components/dashboard/client/post-project/PostProjectProgress";
import { PostProjectStepBudget } from "@/components/dashboard/client/post-project/PostProjectStepBudget";
import { PostProjectStepLocation } from "@/components/dashboard/client/post-project/PostProjectStepLocation";
import { PostProjectStepRequirements } from "@/components/dashboard/client/post-project/PostProjectStepRequirements";
import { PostProjectStepReview } from "@/components/dashboard/client/post-project/PostProjectStepReview";
import { PostProjectStepService } from "@/components/dashboard/client/post-project/PostProjectStepService";
import { PostProjectTermsModal } from "@/components/dashboard/client/post-project/PostProjectTermsModal";
import {
  initialPostProjectFormState,
  postProjectStepSubtitle,
  postProjectToJobPayload,
  POST_PROJECT_STEPS,
  validatePostProjectStep,
  validatePostProjectSubmit,
  type PostProjectFormState,
  type PostProjectServiceId,
} from "@/lib/client/post-project";

export function ClientPostProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PostProjectFormState>(initialPostProjectFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const isReview = step === POST_PROJECT_STEPS.length - 1;

  function patchForm(patch: Partial<PostProjectFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function goNext() {
    const err = validatePostProjectStep(step, form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, POST_PROJECT_STEPS.length - 1));
  }

  function openTermsModal() {
    for (let i = 0; i < POST_PROJECT_STEPS.length - 1; i++) {
      const err = validatePostProjectStep(i, form);
      if (err) {
        setError(err);
        return;
      }
    }
    setError(null);
    setTermsModalOpen(true);
  }

  async function handleSubmit() {
    const submitError = validatePostProjectSubmit(form);
    if (submitError) {
      setError(submitError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const payload = postProjectToJobPayload(form);
      const createRes = await fetch("/api/client/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error ?? "Failed to create project.");
      }

      const jobId = createData.job.id as string;
      const submitRes = await fetch(`/api/client/jobs/${jobId}/submit`, {
        method: "POST",
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) {
        throw new Error(submitData.error ?? "Failed to submit project.");
      }

      setTermsModalOpen(false);
      router.push("/dashboard/client/jobs?submitted=1");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit project.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="client-post-project-page">
        <header className="client-post-project-header">
          <h1 className="client-post-project-title">Post a new project</h1>
          <p className="client-post-project-meta">{postProjectStepSubtitle(step)}</p>
        </header>

        <PostProjectProgress currentStep={step} />

        <article className="client-post-project-card">
          {error ? (
            <p className="client-post-project-error" role="alert">
              {error}
            </p>
          ) : null}

          {step === 0 ? (
            <PostProjectStepService
              form={form}
              onSelect={(serviceId: PostProjectServiceId) =>
                patchForm({ serviceId })
              }
            />
          ) : null}
          {step === 1 ? (
            <PostProjectStepLocation
              form={form}
              onChange={(locations) => patchForm({ locations })}
            />
          ) : null}
          {step === 2 ? (
            <PostProjectStepRequirements form={form} onChange={patchForm} />
          ) : null}
          {step === 3 ? (
            <PostProjectStepBudget form={form} onChange={patchForm} />
          ) : null}
          {step === 4 ? (
            <PostProjectStepReview form={form} onOpenTermsModal={openTermsModal} />
          ) : null}

          <footer className="client-post-project-card-footer">
            {isReview ? (
              <div className="client-post-project-review-actions">
                <button
                  type="button"
                  className="client-post-project-btn-primary"
                  disabled={loading}
                  onClick={openTermsModal}
                >
                  Submit Project
                </button>
                <button
                  type="button"
                  className="client-post-project-btn-secondary"
                  disabled={loading}
                  onClick={() => {
                    setError(null);
                    setStep(0);
                  }}
                >
                  Edit Project
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="client-post-project-btn-primary client-post-project-btn-primary--continue"
                disabled={loading}
                onClick={goNext}
              >
                Continue
                <ArrowRightIcon />
              </button>
            )}
          </footer>
        </article>
      </div>

      <PostProjectTermsModal
        open={termsModalOpen}
        acknowledged={form.termsAcknowledged}
        loading={loading}
        onAcknowledgedChange={(termsAcknowledged) => patchForm({ termsAcknowledged })}
        onCancel={() => setTermsModalOpen(false)}
        onSubmit={() => void handleSubmit()}
      />
    </>
  );
}
