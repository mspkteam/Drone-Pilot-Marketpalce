import { JOB_CATEGORIES, type JobCategoryId } from "@/types/job";

const VALID_CATEGORIES = new Set(JOB_CATEGORIES.map((c) => c.id));

export type JobInput = {
  title?: string;
  description?: string;
  category?: string;
  locationLabel?: string;
  locationCity?: string | null;
  locationRegion?: string | null;
  locationCountry?: string | null;
  scheduledDate?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  currency?: string;
  requirements?: string | null;
};

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function validateJobInput(input: JobInput): ValidationResult<JobInput> {
  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const category = input.category ?? "";
  const locationLabel = input.locationLabel?.trim() ?? "";

  if (title.length < 5) {
    return { ok: false, error: "Title must be at least 5 characters." };
  }
  if (description.length < 20) {
    return {
      ok: false,
      error: "Description must be at least 20 characters.",
    };
  }
  if (!VALID_CATEGORIES.has(category as JobCategoryId)) {
    return { ok: false, error: "Select a valid job category." };
  }
  if (!locationLabel) {
    return { ok: false, error: "Job location is required." };
  }

  const budgetMin = input.budgetMin ?? null;
  const budgetMax = input.budgetMax ?? null;
  if (budgetMin != null && budgetMin < 0) {
    return { ok: false, error: "Budget minimum cannot be negative." };
  }
  if (budgetMax != null && budgetMax < 0) {
    return { ok: false, error: "Budget maximum cannot be negative." };
  }
  if (budgetMin != null && budgetMax != null && budgetMin > budgetMax) {
    return {
      ok: false,
      error: "Budget minimum cannot exceed maximum.",
    };
  }

  let scheduledDate: string | null = input.scheduledDate ?? null;
  if (scheduledDate === "") scheduledDate = null;

  return {
    ok: true,
    data: {
      title,
      description,
      category,
      locationLabel,
      locationCity: input.locationCity?.trim() || null,
      locationRegion: input.locationRegion?.trim() || null,
      locationCountry: input.locationCountry?.trim() || null,
      scheduledDate,
      budgetMin,
      budgetMax,
      currency: input.currency?.trim() || "USD",
      requirements: input.requirements?.trim() || null,
    },
  };
}
