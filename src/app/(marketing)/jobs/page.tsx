import Link from "next/link";
import { PublicPageContainer } from "@/components/layout/PublicPageContainer";
import { listPublicOpenJobs } from "@/lib/jobs/public-jobs";

export const metadata = {
  title: "Open drone jobs | Remote Air Service",
  description:
    "Browse approved Remote Air Service missions open to qualified drone pilots.",
};

export default async function PublicJobsIndexPage() {
  const jobs = await listPublicOpenJobs(50);

  return (
    <section className="figma-marketing-section pt-8 sm:pt-10 pb-16">
      <PublicPageContainer>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
          Marketplace
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
          Open jobs
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70">
          Approved client missions available to Remote Air Service pilots. Sign
          in to submit a proposal.
        </p>

        {jobs.length === 0 ? (
          <p className="mt-10 text-white/60">No open jobs right now. Check back soon.</p>
        ) : (
          <ul className="mt-10 space-y-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="block border border-white/10 bg-white/[0.03] px-5 py-4 transition hover:border-gold/50"
                >
                  <span className="text-lg font-medium text-white">
                    {job.title}
                  </span>
                  <span className="mt-1 block text-sm text-white/60">
                    {job.locationLabel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PublicPageContainer>
    </section>
  );
}
