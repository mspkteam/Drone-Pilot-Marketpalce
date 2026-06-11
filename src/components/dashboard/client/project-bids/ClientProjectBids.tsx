"use client";

import { useMemo, useState } from "react";
import {
  CLIENT_PROJECT_BID_SUMMARY,
  CLIENT_PROJECT_BID_TABS,
  CLIENT_PROJECT_BIDS,
  filterClientProjectBids,
  type ClientBidTabId,
  type ClientProjectBid,
} from "@/lib/client/project-bids-mock";
import { AcceptBidModal } from "./AcceptBidModal";
import { ClientProjectBidCard } from "./ClientProjectBidCard";

export function ClientProjectBids() {
  const [bids, setBids] = useState<ClientProjectBid[]>(() => [
    ...CLIENT_PROJECT_BIDS,
  ]);
  const [activeTab, setActiveTab] = useState<ClientBidTabId>("all");
  const [pendingAccept, setPendingAccept] = useState<ClientProjectBid | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredBids = useMemo(
    () => filterClientProjectBids(bids, activeTab),
    [bids, activeTab],
  );

  const hasAcceptedBid = bids.some((bid) => bid.status === "Accepted");
  const bidCount = bids.length;

  function handleShortlist(bidId: string) {
    setSuccessMessage(null);
    setBids((current) =>
      current.map((bid) => {
        if (bid.id !== bidId) return bid;
        if (bid.status === "Accepted" || bid.status === "Declined") return bid;
        return {
          ...bid,
          status:
            bid.status === "Shortlisted" ? "Pending Review" : "Shortlisted",
        };
      }),
    );
  }

  function handleDecline(bidId: string) {
    setSuccessMessage(null);
    setBids((current) =>
      current.map((bid) =>
        bid.id === bidId ? { ...bid, status: "Declined" as const } : bid,
      ),
    );
  }

  function handleConfirmAccept() {
    if (!pendingAccept) return;

    setBids((current) =>
      current.map((bid) => {
        if (bid.id === pendingAccept.id) {
          return { ...bid, status: "Accepted" as const };
        }
        if (bid.status !== "Declined") {
          return { ...bid, status: "Declined" as const };
        }
        return bid;
      }),
    );

    setPendingAccept(null);
    setSuccessMessage(
      "Bid accepted. Booking/payment workflow pending implementation.",
    );
  }

  return (
    <div className="client-project-bids-page">
      <header className="client-project-bids-header">
        <h1 className="client-project-bids-title">Project Bids</h1>
        <p className="client-project-bids-subtitle">
          Compare pilot bids before hiring the right operator.
        </p>
      </header>

      <div className="client-project-bids-summary" role="status">
        <span>
          Project:{" "}
          <strong>{CLIENT_PROJECT_BID_SUMMARY.title}</strong>
          {" · "}
          {CLIENT_PROJECT_BID_SUMMARY.location}
          {" · "}
          {CLIENT_PROJECT_BID_SUMMARY.postedLabel}
          {" · "}
          {bidCount} {bidCount === 1 ? "bid" : "bids"} received
        </span>
      </div>

      {successMessage ? (
        <p className="client-project-bids-success" role="status">
          {successMessage}
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
            Bids matching this status will appear here.
          </p>
        </div>
      ) : (
        <div className="client-project-bids-list">
          {filteredBids.map((bid) => (
            <ClientProjectBidCard
              key={bid.id}
              bid={bid}
              hasAcceptedBid={hasAcceptedBid}
              onShortlist={handleShortlist}
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
