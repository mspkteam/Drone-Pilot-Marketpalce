import {
  POST_PROJECT_PRIORITIES,
  POST_PROJECT_QUOTE_TYPES,
  type PostProjectFormState,
  type PostProjectPriority,
  type PostProjectQuoteType,
} from "@/lib/client/post-project";
import { cn } from "@/lib/utils";

type PostProjectStepBudgetProps = {
  form: PostProjectFormState;
  onChange: (patch: Partial<PostProjectFormState>) => void;
};

export function PostProjectStepBudget({ form, onChange }: PostProjectStepBudgetProps) {
  return (
    <div className="client-post-project-step">
      <h2 className="client-post-project-step-title">Project budget &amp; timeline</h2>
      <p className="client-post-project-step-subtitle">
        Set expectations so pilots can respond accurately.
      </p>

      <p className="client-post-project-section-label">
        How would you like to receive quotes?
      </p>
      <div className="client-post-project-choice-grid client-post-project-choice-grid--2">
        {POST_PROJECT_QUOTE_TYPES.map((option) => {
          const selected = form.quoteType === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={cn(
                "client-post-project-choice-card",
                selected && "client-post-project-choice-card--selected",
              )}
              onClick={() => onChange({ quoteType: option.id as PostProjectQuoteType })}
            >
              <span className="client-post-project-choice-title">{option.label}</span>
              <span className="client-post-project-choice-helper">{option.helper}</span>
            </button>
          );
        })}
      </div>

      <div className="client-post-project-field-row client-post-project-field-row--spaced">
        <label className="client-post-project-field">
          <span className="client-post-project-field-label">Minimum Budget (USD)</span>
          <input
            type="number"
            min={0}
            className="client-post-project-input"
            placeholder="2000"
            value={form.budgetMin}
            onChange={(e) => onChange({ budgetMin: e.target.value })}
          />
        </label>
        <label className="client-post-project-field">
          <span className="client-post-project-field-label">Maximum Budget (USD)</span>
          <input
            type="number"
            min={0}
            className="client-post-project-input"
            placeholder="4000"
            value={form.budgetMax}
            onChange={(e) => onChange({ budgetMax: e.target.value })}
          />
        </label>
      </div>

      <p className="client-post-project-section-label">Project Priority</p>
      <div className="client-post-project-choice-grid client-post-project-choice-grid--3">
        {POST_PROJECT_PRIORITIES.map((option) => {
          const selected = form.priority === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={cn(
                "client-post-project-choice-card",
                selected && "client-post-project-choice-card--selected",
              )}
              onClick={() => onChange({ priority: option.id as PostProjectPriority })}
            >
              <span className="client-post-project-choice-title">{option.label}</span>
              <span className="client-post-project-choice-helper">{option.helper}</span>
            </button>
          );
        })}
      </div>

      <label className="client-post-project-field client-post-project-field--full">
        <span className="client-post-project-field-label">Project Deadline</span>
        <input
          type="text"
          className="client-post-project-input"
          placeholder="dd/mm/yyyy"
          value={form.deadline}
          onChange={(e) => onChange({ deadline: e.target.value })}
        />
      </label>
    </div>
  );
}
