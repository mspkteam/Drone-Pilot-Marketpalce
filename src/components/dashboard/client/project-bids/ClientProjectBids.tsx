"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CLIENT_PROJECT_BIDS_COPY,
  CLIENT_PROJECT_BIDS_ROUTES,
  type ClientProjectBid,
  type ClientProjectBidSummary,
  type ClientProjectJobOption,
} from "@/lib/client/project-bids";
import { isMilestoneUnlocked } from "@/lib/milestone-access";
import { AcceptBidModal } from "./AcceptBidModal";
import { ClientProjectBidCard } from "./ClientProjectBidCard";

type ClientProjectBidsProps = {
  jobOptions: ClientProjectJobOption[];
  selectedJobId: string | null;
  summary: ClientProjectBidSummary | null;
  initialBids: ClientProjectBid[];
  hasBooking: boolean;
  bookingId: string | null;
};

export function ClientProjectBids({
  jobOptions,
  selectedJobId,
  summary,
  initialBids,
  hasBooking,
  bookingId,
}: ClientProjectBidsProps) {
  const router = useRouter();
  const [bids, setBids] = useState<ClientProjectBid[]>(() => [...initialBids]);
  const [pendingAccept, setPendingAccept] = useState<ClientProjectBid | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const hasAcceptedBid = bids.some((bid) => bid.status === "Accepted");
  const bookingsUnlocked = isMilestoneUnlocked(3);

  function handleJobChange(jobId: string) {
    router.push(CLIENT_PROJECT_BIDS_ROUTES.hub(jobId));
  }

  async function handleShortlist(bidId: string) {
    if (!selectedJobId) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setBusyId(bidId);

    try {
      const res = await fetch(
        `/api/client/jobs/${selectedJobId}/applications/${bidId}/shortlist`,
        { method: "POST" },
      );
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error ?? "Failed to update shortlist.");
        return;
      }

      setBids((current) =>
        current.map((bid) =>
          bid.id === bidId
            ? {
                ...bid,
                status: json.shortlisted
                  ? ("Shortlisted" as const)
                  : ("Pending Review" as const),
              }
            : bid,
        ),
      );
      setSuccessMessage(
        json.shortlisted ? "Quote shortlisted." : "Quote removed from shortlist.",
      );
      router.refresh();
    } catch {
      setErrorMessage("Failed to update shortlist.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(bidId: string) {
    if (!selectedJobId) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setBusyId(bidId);

    try {
      const res = await fetch(
        `/api/client/jobs/${selectedJobId}/applications/${bidId}/reject`,
        { method: "POST" },
      );
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error ?? "Failed to decline quote.");
        return;
      }

      setBids((current) =>
        current.map((bid) =>
          bid.id === bidId
            ? {
                ...bid,
                status: "Declined" as const,
                applicationStatus: "rejected",
              }
            : bid,
        ),
      );
      setSuccessMessage("Quote declined.");
      router.refresh();
    } catch {
      setErrorMessage("Failed to decline quote.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmAccept() {
    if (!pendingAccept || !selectedJobId) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setBusyId(pendingAccept.id);

    try {
      const res = await fetch(
        `/api/client/jobs/${selectedJobId}/applications/${pendingAccept.applicationId}/accept`,
        { method: "POST" },
      );
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error ?? "Failed to hire pilot.");
        setPendingAccept(null);
        return;
      }

      const acceptedBid = pendingAccept;
      setPendingAccept(null);
      setBids((current) =>
        current.map((bid) => {
          if (bid.applicationId === acceptedBid.applicationId) {
            return {
              ...bid,
              status: "Accepted" as const,
              applicationStatus: "accepted",
            };
          }
          if (bid.status === "Pending Review" || bid.status === "Shortlisted") {
            return {
              ...bid,
              status: "Declined" as const,
              applicationStatus: "rejected",
            };
          }
          return bid;
        }),
      );

      if (bookingsUnlocked && json.booking?.id) {
        router.push(`/dashboard/client/bookings/${json.booking.id}?accepted=1`);
        router.refresh();
        return;
      }

      setSuccessMessage(
        `${acceptedBid.name} has been assigned to your project. The booking was created successfully — full booking management opens in Week 3 (Pilot milestone). You can message the pilot from Messages now.`,
      );
      router.refresh();
    } catch {
      setErrorMessage("Failed to hire pilot.");
      setPendingAccept(null);
    } finally {
      setBusyId(null);
    }
  }

  if (!selectedJobId || !summary) {
    return (
      <div className="client-project-bids-page">
        <header className="client-project-bids-header">
          <h1 className="client-project-bids-title">{CLIENT_PROJECT_BIDS_COPY.title}</h1>
          <p className="client-project-bids-subtitle">
            {CLIENT_PROJECT_BIDS_COPY.subtitle}
          </p>
        </header>

        <div className="client-project-bids-empty" role="status">
          <p className="client-project-bids-empty-title">
            {CLIENT_PROJECT_BIDS_COPY.emptyProjectsTitle}
          </p>
          <p className="client-project-bids-empty-text">
            {CLIENT_PROJECT_BIDS_COPY.emptyProjectsText}
          </p>
          <Link href="/dashboard/client/jobs/new" className="client-my-projects-empty-cta">
            Post a Project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="client-project-bids-page">
      <header className="client-project-bids-header">
        <h1 className="client-project-bids-title">{CLIENT_PROJECT_BIDS_COPY.title}</h1>
        <p className="client-project-bids-subtitle">
          {CLIENT_PROJECT_BIDS_COPY.subtitle}
        </p>
      </header>

      {jobOptions.length > 1 ? (
        <label className="client-project-bids-select-wrap">
          <span className="client-project-bids-select-label">Project</span>
          <select
            className="client-project-bids-select"
            value={selectedJobId}
            onChange={(event) => handleJobChange(event.target.value)}
          >
            {jobOptions.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.bidCount}{" "}
                {job.bidCount === 1 ? "quote" : "quotes"})
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="client-project-bids-summary" role="status">
        <span>
          Project: <strong>{summary.title}</strong>
          {" · "}
          {summary.location}
          {" · "}
          {summary.postedLabel}
        </span>
      </div>

      {hasBooking && bookingId ? (
        <p className="client-project-bids-success" role="status">
          A pilot has been assigned to this project.
          {bookingsUnlocked ? (
            <>
              {" "}
              <Link
                href={`/dashboard/client/bookings/${bookingId}`}
                className="underline"
              >
                View booking
              </Link>
            </>
          ) : (
            " Message the pilot from Messages — booking views open in Week 3."
          )}
        </p>
      ) : null}

      {successMessage ? (
        <p className="client-project-bids-success" role="status">
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="client-project-bids-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {bids.length === 0 ? (
        <div className="client-project-bids-empty" role="status">
          <p className="client-project-bids-empty-title">
            {CLIENT_PROJECT_BIDS_COPY.emptyBidsTitle}
          </p>
          <p className="client-project-bids-empty-text">
            {CLIENT_PROJECT_BIDS_COPY.emptyBidsText}
          </p>
        </div>
      ) : (
        <div className="client-project-bids-list">
          {bids.map((bid) => (
            <ClientProjectBidCard
              key={bid.id}
              bid={bid}
              hasAcceptedBid={hasAcceptedBid || hasBooking}
              busy={busyId === bid.id}
              onShortlist={(bidId) => void handleShortlist(bidId)}
              onDecline={handleDecline}
              onAccept={setPendingAccept}
            />
          ))}
        </div>
      )}

      <AcceptBidModal
        bid={pendingAccept}
        onCancel={() => setPendingAccept(null)}
        onConfirm={handleConfirmAccept}
      />
    </div>
  );
}
