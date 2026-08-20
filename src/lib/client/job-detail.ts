import {
  postProjectPriorityLabel,
  postProjectQuoteTypeLabel,
  postProjectServiceLabel,
} from "@/lib/client/post-project-constants";
import { formatClientProjectBudget } from "@/lib/client/my-projects";
import type { JobPostProjectMetadata } from "@/lib/jobs/post-project-metadata";
import type { JobDto } from "@/types/job";

export type ClientJobOverviewDetail = {
  label: string;
  value: string;
};

export function formatJobOverviewBudget(job: JobDto): string {
  return formatClientProjectBudget({
    budgetMin: job.budgetMin,
    budgetMax: job.budgetMax,
    currency: job.currency,
  });
}

export function formatJobOverviewSchedule(job: JobDto): string {
  if (job.scheduledDate) {
    const parsed = new Date(job.scheduledDate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  return "Flexible";
}

function serviceLabel(serviceId: JobPostProjectMetadata["serviceId"]): string {
  return postProjectServiceLabel(serviceId);
}

function quoteTypeLabel(quoteType: JobPostProjectMetadata["quoteType"]): string {
  return postProjectQuoteTypeLabel(quoteType);
}

function priorityLabel(priority: JobPostProjectMetadata["priority"]): string {
  return postProjectPriorityLabel(priority);
}

export function buildClientJobOverviewDetails(
  job: JobDto,
): ClientJobOverviewDetail[] {
  const details: ClientJobOverviewDetail[] = [
    { label: "Location", value: job.locationLabel },
    { label: "Budget", value: formatJobOverviewBudget(job) },
    { label: "Target date", value: formatJobOverviewSchedule(job) },
  ];

  if (job.postProject) {
    details.unshift(
      { label: "Service", value: serviceLabel(job.postProject.serviceId) },
      {
        label: "Quote type",
        value: quoteTypeLabel(job.postProject.quoteType),
      },
      { label: "Priority", value: priorityLabel(job.postProject.priority) },
    );

    if (job.postProject.deliverables.length > 0) {
      details.push({
        label: "Deliverables",
        value: job.postProject.deliverables.join(", "),
      });
    }

    if (job.postProject.locations.length > 1) {
      details.push({
        label: "Additional sites",
        value: `${job.postProject.locations.length - 1} more location${
          job.postProject.locations.length === 2 ? "" : "s"
        }`,
      });
    }

    if (job.postProject.referenceFileNames.length > 0) {
      const urls = job.postProject.referenceFileUrls ?? [];
      details.push({
        label: "Reference files",
        value:
          urls.length > 0
            ? job.postProject.referenceFileNames
                .map((name, index) =>
                  urls[index] ? `${name} (${urls[index]})` : name,
                )
                .join(", ")
            : job.postProject.referenceFileNames.join(", "),
      });
    }
  }

  return details;
}

export function buildClientJobOverviewSummary(job: JobDto): string {
  if (job.postProject?.specialRequirements) {
    return job.postProject.specialRequirements;
  }
  if (job.requirements?.trim()) {
    return job.requirements;
  }
  return job.description;
}
