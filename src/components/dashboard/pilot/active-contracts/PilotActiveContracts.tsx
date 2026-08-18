"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PilotContractCard } from "./PilotContractCard";
import { mapBookingToActiveContract } from "@/lib/pilot/active-contracts-map";
import { PILOT_ACTIVE_CONTRACTS_ROUTES } from "@/lib/pilot/active-contracts-types";
import type { BookingListItemDto } from "@/types/booking";

const BOOKINGS_API = "/api/pilot/bookings" as const;

export function PilotActiveContracts() {
  const [bookings, setBookings] = useState<BookingListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <p className="pilot-contracts-loading">Loading contracts…</p>;
  }

  return (
    <div className="pilot-contracts-page">
      <header className="pilot-contracts-header pilot-contracts-bracket-card">
        <p className="pilot-contracts-eyebrow">OPERATIONS / CONTRACTS</p>
        <h1 className="pilot-contracts-title">Active Contracts</h1>
      </header>

      {error ? (
        <p className="pilot-contracts-banner pilot-contracts-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {contracts.length === 0 ? (
        <div className="pilot-contracts-empty" role="status">
          <p className="pilot-contracts-empty-title">No contracts found</p>
          <p className="pilot-contracts-empty-text">
            Browse the marketplace and submit proposals to win your first
            contract.
          </p>
          <Link
            href={PILOT_ACTIVE_CONTRACTS_ROUTES.browseJobs}
            className="pilot-contracts-empty-cta"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <ul className="pilot-contracts-list">
          {contracts.map((contract) => (
            <li key={contract.id}>
              <PilotContractCard contract={contract} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
