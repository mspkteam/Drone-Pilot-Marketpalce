import {
  POST_PROJECT_PRIORITIES,
  POST_PROJECT_QUOTE_TYPES,
  type PostProjectFormState,
  type PostProjectPriority,
  type PostProjectQuoteType,
  type PostProjectTravelExpenses,
} from "@/lib/client/post-project";
import { cn } from "@/lib/utils";

type PostProjectStepBudgetProps = {
  form: PostProjectFormState;
  onChange: (patch: Partial<PostProjectFormState>) => void;
};

function updateTravelExpenses(
  current: PostProjectTravelExpenses,
  patch: Partial<PostProjectTravelExpenses>,
): PostProjectTravelExpenses {
  return { ...current, ...patch };
}

export function PostProjectStepBudget({ form, onChange }: PostProjectStepBudgetProps) {
  const showTravelAmounts = form.coverTravelExpenses === true;

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

      <section className="client-post-project-travel-section">
        <h3 className="client-post-project-travel-title">Pilot travel coverage</h3>
        <p className="client-post-project-travel-subtitle">
          Set expectations so pilots can respond accurately.
        </p>
        <p className="client-post-project-section-label client-post-project-section-label--compact">
          Will you cover pilot travel expenses separately?
        </p>
        <div className="client-post-project-radio-group" role="radiogroup">
          {(
            [
              { value: true, label: "Yes" },
              { value: false, label: "No" },
            ] as const
          ).map((option) => {
            const selected = form.coverTravelExpenses === option.value;
            return (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={selected}
                className={cn(
                  "client-post-project-radio-option",
                  selected && "client-post-project-radio-option--selected",
                )}
                onClick={() => onChange({ coverTravelExpenses: option.value })}
              >
                <span className="client-post-project-radio-indicator" aria-hidden />
                {option.label}
              </button>
            );
          })}
        </div>

        {showTravelAmounts ? (
          <div className="client-post-project-travel-grid">
            <label className="client-post-project-field">
              <span className="client-post-project-field-label">Air travel (USD)</span>
              <input
                type="number"
                min={0}
                className="client-post-project-input"
                placeholder="500"
                value={form.travelExpenses.airTravel}
                onChange={(e) =>
                  onChange({
                    travelExpenses: updateTravelExpenses(form.travelExpenses, {
                      airTravel: e.target.value,
                    }),
                  })
                }
              />
            </label>
            <label className="client-post-project-field">
              <span className="client-post-project-field-label">Lodging (USD)</span>
              <input
                type="number"
                min={0}
                className="client-post-project-input"
                placeholder="300"
                value={form.travelExpenses.lodging}
                onChange={(e) =>
                  onChange({
                    travelExpenses: updateTravelExpenses(form.travelExpenses, {
                      lodging: e.target.value,
                    }),
                  })
                }
              />
            </label>
            <label className="client-post-project-field">
              <span className="client-post-project-field-label">Incidentals (USD)</span>
              <input
                type="number"
                min={0}
                className="client-post-project-input"
                placeholder="150"
                value={form.travelExpenses.incidentals}
                onChange={(e) =>
                  onChange({
                    travelExpenses: updateTravelExpenses(form.travelExpenses, {
                      incidentals: e.target.value,
                    }),
                  })
                }
              />
            </label>
            <label className="client-post-project-field">
              <span className="client-post-project-field-label">Ground transport (USD)</span>
              <input
                type="number"
                min={0}
                className="client-post-project-input"
                placeholder="100"
                value={form.travelExpenses.groundTransport}
                onChange={(e) =>
                  onChange({
                    travelExpenses: updateTravelExpenses(form.travelExpenses, {
                      groundTransport: e.target.value,
                    }),
                  })
                }
              />
            </label>
          </div>
        ) : null}
      </section>
    </div>
  );
}
