"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CLIENT_PROJECT_BID_TABS,
  CLIENT_PROJECT_BIDS_ROUTES,
  filterClientProjectBids,
  type ClientBidTabId,
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
  const [activeTab, setActiveTab] = useState<ClientBidTabId>("all");
  const [pendingAccept, setPendingAccept] = useState<ClientProjectBid | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filteredBids = useMemo(
    () => filterClientProjectBids(bids, activeTab),
    [bids, activeTab],
  );

  const hasAcceptedBid = bids.some((bid) => bid.status === "Accepted");
  const bidCount = bids.length;
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
        json.shortlisted ? "Bid shortlisted." : "Bid removed from shortlist.",
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
        setErrorMessage(json.error ?? "Failed to decline bid.");
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
      setSuccessMessage("Bid declined.");
      router.refresh();
    } catch {
      setErrorMessage("Failed to decline bid.");
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
        setErrorMessage(json.error ?? "Failed to accept bid.");
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
      setErrorMessage("Failed to accept bid.");
      setPendingAccept(null);
    } finally {
      setBusyId(null);
    }
  }

  if (!selectedJobId || !summary) {
    return (
      <div className="client-project-bids-page">
        <header className="client-project-bids-header">
          <h1 className="client-project-bids-title">Project Quotes</h1>
          <p className="client-project-bids-subtitle">
            Compare pilot bids before hiring the right operator.
          </p>
        </header>

        <div className="client-project-bids-empty" role="status">
          <p className="client-project-bids-empty-title">No projects to review</p>
          <p className="client-project-bids-empty-text">
            Post a project and submit it for approval to start receiving bids.
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
        <h1 className="client-project-bids-title">Project Quotes</h1>
        <p className="client-project-bids-subtitle">
          Compare pilot bids before hiring the right operator.
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
                {job.bidCount === 1 ? "bid" : "bids"})
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
          {" · "}
          {bidCount} {bidCount === 1 ? "bid" : "bids"} received
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

      <div className="client-project-bids-tabs-wrap">
        <div
          className="client-project-bids-tabs"
          role="tablist"
          aria-label="Filter bids by status"
        >
          {CLIENT_PROJECT_BID_TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`client-project-bids-tab${selected ? " client-project-bids-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="client-project-bids-tabs-divider" aria-hidden />
      </div>

      {filteredBids.length === 0 ? (
        <div className="client-project-bids-empty" role="status">
          <p className="client-project-bids-empty-title">No bids found</p>
          <p className="client-project-bids-empty-text">
            {bidCount === 0
              ? "Pilots can bid once your project is approved and open on the marketplace."
              : "Bids matching this status will appear here."}
          </p>
        </div>
      ) : (
        <div className="client-project-bids-list">
          {filteredBids.map((bid) => (
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
