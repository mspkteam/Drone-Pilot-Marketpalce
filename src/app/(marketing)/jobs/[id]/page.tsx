import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPageContainer } from "@/components/layout/PublicPageContainer";
import { formatJobBudget } from "@/lib/jobs/format-budget";
import {
  getPublicOpenJob,
  publicJobPostingScript,
} from "@/lib/jobs/public-jobs";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const job = await getPublicOpenJob(id);
  if (!job) return { title: "Job not found" };
  return {
    title: `${job.title} | Remote Air Service Jobs`,
    description: job.description.slice(0, 160),
  };
}

export default async function PublicJobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = await getPublicOpenJob(id);
  if (!job) notFound();

  const budget = formatJobBudget(
    job.budgetMin,
    job.budgetMax,
    job.currency,
  );
  const org =
    job.clientProfile.companyName?.trim() ||
    job.clientProfile.contactName.trim();
  const jsonLd = publicJobPostingScript(job);

  return (
    <section className="figma-marketing-section pt-8 sm:pt-10 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <PublicPageContainer>
        <Link
          href="/jobs"
          className="mb-8 inline-flex text-sm font-medium text-gold-light transition-colors hover:text-gold"
        >
          ← All open jobs
        </Link>

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
          Open mission
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
          {job.title}
        </h1>
        <p className="mt-3 text-sm text-white/70">
          {job.locationLabel}
          {org ? ` · Posted by ${org}` : null}
        </p>

        {budget ? (
          <p className="mt-4 text-base font-medium text-gold">{budget}</p>
        ) : null}

        <div className="mt-8 max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-white/85">
          {job.description}
        </div>

        {job.requirements?.trim() ? (
          <div className="mt-8 max-w-3xl">
            <h2 className="text-lg font-semibold text-white">Requirements</h2>
            <p className="mt-2 whitespace-pre-wrap text-white/80">
              {job.requirements}
            </p>
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={`/register?role=pilot`}
            className="inline-flex items-center justify-center rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gold-light"
          >
            Join as pilot to apply
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-sm border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-gold hover:text-gold"
          >
            Sign in
          </Link>
        </div>
      </PublicPageContainer>
    </section>
  );
}
