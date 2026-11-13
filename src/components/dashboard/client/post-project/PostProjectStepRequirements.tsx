import {
  POST_PROJECT_DELIVERABLES,
  type PostProjectDeliverable,
  type PostProjectFieldErrors,
  type PostProjectFormState,
} from "@/lib/client/post-project";
import { cn } from "@/lib/utils";

type PostProjectStepRequirementsProps = {
  form: PostProjectFormState;
  fieldErrors?: PostProjectFieldErrors;
  onChange: (patch: Partial<PostProjectFormState>) => void;
};

export function PostProjectStepRequirements({
  form,
  fieldErrors = {},
  onChange,
}: PostProjectStepRequirementsProps) {
  function toggleDeliverable(item: PostProjectDeliverable) {
    const next = form.deliverables.includes(item)
      ? form.deliverables.filter((d) => d !== item)
      : [...form.deliverables, item];
    onChange({ deliverables: next });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const { uploadUserImage } = await import("@/lib/storage/upload-browser");
    const names: string[] = [];
    const urls: string[] = [];

    for (const file of files) {
      const result = await uploadUserImage({ kind: "job-reference", file });
      if (!result.ok) {
        onChange({
          referenceFileNames: [...form.referenceFileNames, ...names],
          referenceFileUrls: [
            ...(form.referenceFileUrls ?? []),
            ...urls,
          ],
        });
        return;
      }
      names.push(file.name);
      urls.push(result.url);
    }

    onChange({
      referenceFileNames: [...form.referenceFileNames, ...names],
      referenceFileUrls: [...(form.referenceFileUrls ?? []), ...urls],
    });
  }

  function removeReferenceFile(index: number) {
    const names = form.referenceFileNames.filter((_, i) => i !== index);
    const urls = (form.referenceFileUrls ?? []).filter((_, i) => i !== index);
    onChange({
      referenceFileNames: names,
      referenceFileUrls: urls,
    });
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
      {fieldErrors.deliverables ? (
        <p className="client-post-project-field-error" role="alert">
          {fieldErrors.deliverables}
        </p>
      ) : null}

      <div className="client-post-project-field-row client-post-project-field-row--spaced">
        <div className="client-post-project-field">
          <span className="client-post-project-field-label">
            Reference files (optional)
          </span>
          <label className="client-post-project-file-picker">
            <span className="client-post-project-file-picker-icon" aria-hidden>
              📎
            </span>
            <span>
              {form.referenceFileNames.length > 0
                ? `${form.referenceFileNames.length} file${form.referenceFileNames.length === 1 ? "" : "s"} attached — add more`
                : "Upload reference files"}
            </span>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
              className="client-post-project-file-picker-input"
              onChange={handleFileChange}
            />
          </label>
          <span className="client-post-project-input-hint">
            PNG, JPG, WEBP, GIF, or PDF — site plans, mood boards…
          </span>
          {form.referenceFileNames.length > 0 ? (
            <ul className="client-post-project-file-list">
              {form.referenceFileNames.map((name, index) => (
                <li key={`${name}-${index}`} className="client-post-project-file-list-item">
                  <span className="client-post-project-file-list-name">{name}</span>
                  <button
                    type="button"
                    className="client-post-project-file-remove"
                    onClick={() => removeReferenceFile(index)}
                    aria-label={`Remove ${name}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
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
