"use client";

import { FormField, inputClassName } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { JOB_CATEGORIES } from "@/types/job";
import type { JobDto } from "@/types/job";
import { cn } from "@/lib/utils";

export type JobFormState = {
  title: string;
  description: string;
  category: string;
  locationLabel: string;
  locationCity: string;
  locationRegion: string;
  locationCountry: string;
  scheduledDate: string;
  budgetMin: string;
  budgetMax: string;
  requirements: string;
};

export const emptyJobFormState: JobFormState = {
  title: "",
  description: "",
  category: "",
  locationLabel: "",
  locationCity: "",
  locationRegion: "",
  locationCountry: "",
  scheduledDate: "",
  budgetMin: "",
  budgetMax: "",
  requirements: "",
};

export function jobDtoToFormState(job: JobDto): JobFormState {
  return {
    title: job.title,
    description: job.description,
    category: job.category,
    locationLabel: job.locationLabel,
    locationCity: job.locationCity ?? "",
    locationRegion: job.locationRegion ?? "",
    locationCountry: job.locationCountry ?? "",
    scheduledDate: job.scheduledDate
      ? job.scheduledDate.slice(0, 10)
      : "",
    budgetMin: job.budgetMin?.toString() ?? "",
    budgetMax: job.budgetMax?.toString() ?? "",
    requirements: job.requirements ?? "",
  };
}

export function jobFormToPayload(form: JobFormState) {
  return {
    title: form.title,
    description: form.description,
    category: form.category,
    locationLabel: form.locationLabel,
    locationCity: form.locationCity || null,
    locationRegion: form.locationRegion || null,
    locationCountry: form.locationCountry || null,
    scheduledDate: form.scheduledDate || null,
    budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
    budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
    requirements: form.requirements || null,
    currency: "USD",
  };
}

export type JobFormSection = "basics" | "requirements" | "budget" | "location";

type JobFormProps = {
  form: JobFormState;
  onChange: (patch: Partial<JobFormState>) => void;
  disabled?: boolean;
  section?: JobFormSection;
};

function showJobSection(
  section: JobFormSection | undefined,
  target: JobFormSection,
) {
  return !section || section === target;
}

export function JobForm({ form, onChange, disabled, section }: JobFormProps) {
  return (
    <div className="space-y-6">
      {showJobSection(section, "basics") ? (
      <>
      <FormField label="Job title" htmlFor="title" required>
        <input
          id="title"
          className={inputClassName}
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          disabled={disabled}
          required
        />
      </FormField>

      <FormField label="Description" htmlFor="description" required>
        <textarea
          id="description"
          rows={4}
          className={inputClassName}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          disabled={disabled}
          required
        />
      </FormField>

      <fieldset>
        <legend className="text-sm font-medium">
          Category <span className="text-destructive">*</span>
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {JOB_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ category: cat.id })}
              className={cn(
                "chip-select",
                form.category === cat.id && "chip-select-active",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </fieldset>
      </>
      ) : null}

      {showJobSection(section, "requirements") ? (
      <FormField
        label="Requirements & deliverables"
        htmlFor="requirements"
        hint="FAA notes, shot list, file formats, etc."
      >
        <textarea
          id="requirements"
          rows={4}
          className={inputClassName}
          value={form.requirements}
          onChange={(e) => onChange({ requirements: e.target.value })}
          disabled={disabled}
        />
      </FormField>
      ) : null}

      {showJobSection(section, "budget") ? (
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Preferred date" htmlFor="scheduledDate">
          <input
            id="scheduledDate"
            type="date"
            className={inputClassName}
            value={form.scheduledDate}
            onChange={(e) => onChange({ scheduledDate: e.target.value })}
            disabled={disabled}
          />
        </FormField>
        <FormField label="Budget min ($)" htmlFor="budgetMin">
          <input
            id="budgetMin"
            type="number"
            min={0}
            className={inputClassName}
            value={form.budgetMin}
            onChange={(e) => onChange({ budgetMin: e.target.value })}
            disabled={disabled}
          />
        </FormField>
        <FormField label="Budget max ($)" htmlFor="budgetMax">
          <input
            id="budgetMax"
            type="number"
            min={0}
            className={inputClassName}
            value={form.budgetMax}
            onChange={(e) => onChange({ budgetMax: e.target.value })}
            disabled={disabled}
          />
        </FormField>
      </div>
      ) : null}

      {showJobSection(section, "location") ? (
      <>
      <FormField label="Location (site name or address)" htmlFor="locationLabel" required>
        <input
          id="locationLabel"
          className={inputClassName}
          value={form.locationLabel}
          onChange={(e) => onChange({ locationLabel: e.target.value })}
          disabled={disabled}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="City" htmlFor="locationCity">
          <input
            id="locationCity"
            className={inputClassName}
            value={form.locationCity}
            onChange={(e) => onChange({ locationCity: e.target.value })}
            disabled={disabled}
          />
        </FormField>
        <FormField label="Region" htmlFor="locationRegion">
          <input
            id="locationRegion"
            className={inputClassName}
            value={form.locationRegion}
            onChange={(e) => onChange({ locationRegion: e.target.value })}
            disabled={disabled}
          />
        </FormField>
        <FormField label="Country" htmlFor="locationCountry">
          <input
            id="locationCountry"
            className={inputClassName}
            value={form.locationCountry}
            onChange={(e) => onChange({ locationCountry: e.target.value })}
            disabled={disabled}
          />
        </FormField>
      </div>
      </>
      ) : null}
    </div>
  );
}

type JobFormActionsProps = {
  loading?: boolean;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
  showSubmit?: boolean;
  submitLabel?: string;
};

export function JobFormActions({
  loading,
  onSaveDraft,
  onSubmit,
  showSubmit = true,
  submitLabel = "Submit for approval",
}: JobFormActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {onSaveDraft ? (
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={onSaveDraft}
        >
          {loading ? "Saving…" : "Save draft"}
        </Button>
      ) : null}
      {showSubmit && onSubmit ? (
        <Button type="button" disabled={loading} onClick={onSubmit}>
          {loading ? "Submitting…" : submitLabel}
        </Button>
      ) : null}
    </div>
  );
}
