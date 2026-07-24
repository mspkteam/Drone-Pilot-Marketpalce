import type { Job } from "@/generated/prisma/client";

export type JobPostingOrg = {
  companyName: string | null;
  contactName: string;
};

export type PublicJobForPosting = Pick<
  Job,
  | "id"
  | "title"
  | "description"
  | "category"
  | "locationLabel"
  | "locationCity"
  | "locationRegion"
  | "locationCountry"
  | "budgetMin"
  | "budgetMax"
  | "currency"
  | "requirements"
  | "scheduledDate"
  | "approvedAt"
  | "createdAt"
  | "updatedAt"
> & {
  clientProfile: JobPostingOrg;
};

/** Absolute site origin for JobPosting `url` (Google requires absolute URLs). */
export function getSiteOrigin(): string {
  const raw =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";
  if (raw) return raw.replace(/\/$/, "");
  return "https://remoteairservice.com";
}

function moneyValue(
  currency: string,
  min: number | null,
  max: number | null,
): Record<string, unknown> | undefined {
  if (min == null && max == null) return undefined;
  const value: Record<string, unknown> = {
    "@type": "MonetaryAmount",
    currency: currency || "USD",
  };
  if (min != null && max != null && min !== max) {
    value.value = {
      "@type": "QuantitativeValue",
      minValue: min,
      maxValue: max,
      unitText: "JOB",
    };
  } else {
    value.value = {
      "@type": "QuantitativeValue",
      value: max ?? min,
      unitText: "JOB",
    };
  }
  return value;
}

/**
 * Google for Jobs `JobPosting` JSON-LD.
 * @see https://developers.google.com/search/docs/appearance/structured-data/job-posting
 */
export function buildJobPostingJsonLd(
  job: PublicJobForPosting,
  options?: { origin?: string },
): Record<string, unknown> {
  const origin = options?.origin ?? getSiteOrigin();
  const url = `${origin}/jobs/${job.id}`;
  const descriptionParts = [job.description.trim()];
  if (job.requirements?.trim()) {
    descriptionParts.push(`Requirements:\n${job.requirements.trim()}`);
  }
  const description = descriptionParts.join("\n\n");

  const address: Record<string, unknown> = {
    "@type": "PostalAddress",
    addressLocality: job.locationCity || undefined,
    addressRegion: job.locationRegion || undefined,
    addressCountry: job.locationCountry || undefined,
  };
  if (!job.locationCity && !job.locationRegion && !job.locationCountry) {
    address.streetAddress = job.locationLabel || undefined;
  }

  const orgName =
    job.clientProfile.companyName?.trim() ||
    job.clientProfile.contactName.trim() ||
    "Remote Air Service Client";

  const datePosted = (job.approvedAt ?? job.createdAt).toISOString();
  const validThrough = new Date(datePosted);
  validThrough.setDate(validThrough.getDate() + 60);

  const baseSalary = moneyValue(job.currency, job.budgetMin, job.budgetMax);

  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    identifier: {
      "@type": "PropertyValue",
      name: "Remote Air Service",
      value: job.id,
    },
    datePosted,
    validThrough: validThrough.toISOString(),
    employmentType: "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: orgName,
      sameAs: origin,
    },
    jobLocation: {
      "@type": "Place",
      name: job.locationLabel || undefined,
      address,
    },
    url,
    directApply: true,
  };

  if (baseSalary) payload.baseSalary = baseSalary;
  if (job.scheduledDate) {
    payload.jobStartDate = job.scheduledDate.toISOString().slice(0, 10);
  }
  if (job.category) {
    payload.occupationalCategory = job.category;
  }

  return payload;
}
