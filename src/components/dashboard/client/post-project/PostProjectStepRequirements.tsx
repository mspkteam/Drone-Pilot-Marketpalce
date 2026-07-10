import {
  POST_PROJECT_DELIVERABLES,
  type PostProjectDeliverable,
  type PostProjectFormState,
} from "@/lib/client/post-project";
import { PostProjectDateField } from "@/components/dashboard/client/post-project/PostProjectDateField";
import { cn } from "@/lib/utils";

type PostProjectStepRequirementsProps = {
  form: PostProjectFormState;
  onChange: (patch: Partial<PostProjectFormState>) => void;
};

export function PostProjectStepRequirements({
  form,
  onChange,
}: PostProjectStepRequirementsProps) {
  function toggleDeliverable(item: PostProjectDeliverable) {
    const next = form.deliverables.includes(item)
      ? form.deliverables.filter((d) => d !== item)
      : [...form.deliverables, item];
    onChange({ deliverables: next });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const names = Array.from(e.target.files ?? []).map((f) => f.name);
    onChange({ referenceFileNames: names });
  }

  return (
    <div className="client-post-project-step">
      <h2 className="client-post-project-step-title">Tell us about your project</h2>
      <p className="client-post-project-step-subtitle">
        The more detail you share, the better quotes you&apos;ll receive.
      </p>

      <p className="client-post-project-section-label">
        What type of deliverables do you need?
      </p>

      <div
        className="client-post-project-deliverable-grid"
        role="group"
        aria-label="Deliverables"
      >
        {POST_PROJECT_DELIVERABLES.map((item) => {
          const selected = form.deliverables.includes(item);
          return (
            <button
              key={item}
              type="button"
              className={cn(
                "client-post-project-deliverable-option",
                selected && "client-post-project-deliverable-option--selected",
              )}
              aria-pressed={selected}
              onClick={() => toggleDeliverable(item)}
            >
              <span className="client-post-project-deliverable-indicator" aria-hidden />
              <span>{item}</span>
            </button>
          );
        })}
      </div>

      <div className="client-post-project-field-row client-post-project-field-row--spaced">
        <label className="client-post-project-field">
          <span className="client-post-project-field-label">
            When does the work need to completed?
          </span>
          <PostProjectDateField
            value={form.completionDate}
            onChange={(completionDate) => onChange({ completionDate })}
          />
        </label>
        <label className="client-post-project-field">
          <span className="client-post-project-field-label">
            Reference files (optional)
          </span>
          <input
            type="file"
            multiple
            className="client-post-project-input client-post-project-input--file"
            onChange={handleFileChange}
          />
          <span className="client-post-project-input-hint">
            Upload site plans, mood boards...
          </span>
        </label>
      </div>

      <label className="client-post-project-field client-post-project-field--full">
        <span className="client-post-project-field-label">Any special requirements?</span>
        <textarea
          className="client-post-project-textarea"
          placeholder="Night operations, FAA waivers, specific equipment deliverable formats..."
          value={form.specialRequirements}
          onChange={(e) => onChange({ specialRequirements: e.target.value })}
        />
      </label>
    </div>
  );
}
