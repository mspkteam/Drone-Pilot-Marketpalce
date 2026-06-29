"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PilotContractCard } from "./PilotContractCard";
import { BriefcaseIcon } from "./PilotActiveContractsIcons";
import { mapBookingToActiveContract } from "@/lib/pilot/active-contracts-map";
import {
  filterPilotActiveContracts,
  PILOT_ACTIVE_CONTRACT_TABS,
  PILOT_ACTIVE_CONTRACTS_ROUTES,
  type PilotContractTabId,
} from "@/lib/pilot/active-contracts-types";
import type { BookingListItemDto } from "@/types/booking";

const BOOKINGS_API = "/api/pilot/bookings" as const;

export function PilotActiveContracts() {
  const [bookings, setBookings] = useState<BookingListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PilotContractTabId>("all");

  useEffect(() => {
    fetch(BOOKINGS_API)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setBookings([]);
        } else {
          setBookings(data.bookings ?? []);
        }
      })
      .catch(() => {
        setError("Failed to load contracts.");
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const contracts = useMemo(
    () => bookings.map(mapBookingToActiveContract),
    [bookings],
  );

  const filteredContracts = useMemo(
    () => filterPilotActiveContracts(contracts, activeTab),
    [contracts, activeTab],
  );

  if (loading) {
    return <p className="client-my-projects-empty-text">Loading contracts…</p>;
  }

  return (
    <div className="client-my-projects-page">
      <header className="client-my-projects-header">
        <div className="client-my-projects-header-copy">
          <h1 className="client-my-projects-title">Active Contracts</h1>
          <p className="client-my-projects-subtitle">
            Manage your current missions, deliveries, and client handoffs.
          </p>
        </div>

        <Link
          href={PILOT_ACTIVE_CONTRACTS_ROUTES.browseJobs}
          className="client-my-projects-new-btn"
        >
          <BriefcaseIcon />
          Browse Jobs
        </Link>
      </header>

      {error ? (
        <p className="client-my-projects-banner" role="alert">
          {error}
        </p>
      ) : null}

      {contracts.length === 0 && !error ? (
        <p className="client-my-projects-banner" role="status">
          No active contracts yet. When a client accepts your proposal, the
          booking will appear here.
        </p>
      ) : null}

      <div className="client-my-projects-tabs-wrap">
        <div
          className="client-my-projects-tabs"
          role="tablist"
          aria-label="Filter contracts by status"
        >
          {PILOT_ACTIVE_CONTRACT_TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`client-my-projects-tab${selected ? " client-my-projects-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="client-my-projects-tabs-divider" aria-hidden />
      </div>

      {filteredContracts.length === 0 ? (
        <div className="client-my-projects-empty" role="status">
          <p className="client-my-projects-empty-title">No contracts found</p>
          <p className="client-my-projects-empty-text">
            Contracts matching this status will appear here.
          </p>
          {activeTab === "all" && contracts.length === 0 ? (
            <Link
              href={PILOT_ACTIVE_CONTRACTS_ROUTES.browseJobs}
              className="client-my-projects-empty-cta"
            >
              Browse Jobs
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="client-my-projects-grid">
          {filteredContracts.map((contract) => (
            <PilotContractCard key={contract.id} contract={contract} />
          ))}
        </div>
      )}
    </div>
  );
}
