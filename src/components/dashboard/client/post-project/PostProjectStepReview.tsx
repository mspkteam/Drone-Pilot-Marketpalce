import {
  formatPostProjectBudget,
  formatPostProjectDeadline,
  formatPostProjectLocation,
  POST_PROJECT_PRIORITIES,
  POST_PROJECT_QUOTE_TYPES,
  serviceLabel,
  type PostProjectFormState,
} from "@/lib/client/post-project";

type PostProjectStepReviewProps = {
  form: PostProjectFormState;
};

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="client-post-project-summary-card">
      <p className="client-post-project-summary-label">{label}</p>
      <p className="client-post-project-summary-value">{value}</p>
    </article>
  );
}

export function PostProjectStepReview({ form }: PostProjectStepReviewProps) {
  const quoteLabel =
    POST_PROJECT_QUOTE_TYPES.find((q) => q.id === form.quoteType)?.label ?? "—";
  const priorityLabel =
    POST_PROJECT_PRIORITIES.find((p) => p.id === form.priority)?.label ?? "—";
  const deliverables =
    form.deliverables.length > 0 ? form.deliverables.join(", ") : "—";
  const notes = form.specialRequirements.trim() || "—";

  return (
    <div className="client-post-project-step">
      <h2 className="client-post-project-step-title">Review your project</h2>
      <p className="client-post-project-step-subtitle">
        Make sure everything looks right before posting.
      </p>

      <p className="client-post-project-section-label">{quoteLabel}</p>

      <div className="client-post-project-summary-grid">
        <SummaryCard label="SERVICE TYPE" value={serviceLabel(form.serviceId)} />
        <SummaryCard
          label="LOCATION"
          value={formatPostProjectLocation(form.locations)}
        />
        <SummaryCard label="DELIVERABLES" value={deliverables} />
        <SummaryCard label="BUDGET" value={formatPostProjectBudget(form)} />
        <SummaryCard label="PRIORITY" value={priorityLabel} />
        <SummaryCard label="DEADLINE" value={formatPostProjectDeadline(form)} />
        <SummaryCard
          label="ATTACHMENTS"
          value={`${form.referenceFileNames.length} files`}
        />
      </div>

      <article className="client-post-project-summary-card client-post-project-summary-card--wide">
        <p className="client-post-project-summary-label">NOTES</p>
        <p className="client-post-project-summary-value client-post-project-summary-value--notes">
          {notes}
        </p>
      </article>
    </div>
  );
}
