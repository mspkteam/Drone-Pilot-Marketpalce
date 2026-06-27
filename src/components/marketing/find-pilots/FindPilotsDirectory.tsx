"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  filterFindPilots,
  FIND_PILOT_FILTER_CHIPS,
  type ClientFindPilot,
} from "@/lib/client/find-pilots";
import type { PilotServiceId } from "@/types/pilot";
import { ClientFindPilotCard } from "@/components/dashboard/client/find-pilots/ClientFindPilotCard";

const PAGE_SIZE = 9;

type FindPilotsDirectoryProps = {
  pilots: ClientFindPilot[];
  initialRegion?: string | null;
};

export function FindPilotsDirectory({ pilots, initialRegion = null }: FindPilotsDirectoryProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<PilotServiceId | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredPilots = useMemo(
    () => filterFindPilots(pilots, query, activeFilter),
    [pilots, query, activeFilter],
  );

  const regionFilteredPilots = useMemo(() => {
    if (!initialRegion) return filteredPilots;
    const normalized = initialRegion.toLowerCase();
    return filteredPilots.filter((pilot) =>
      pilot.location.toLowerCase().includes(normalized),
    );
  }, [filteredPilots, initialRegion]);

  const visiblePilots = regionFilteredPilots.slice(0, visibleCount);
  const canViewMore = visibleCount < regionFilteredPilots.length;

  function toggleFilter(serviceId: PilotServiceId) {
    setActiveFilter((current) => (current === serviceId ? null : serviceId));
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <section id="pilots-directory" className="find-pilots-directory" aria-label="Pilot directory">
      <div className="public-container find-pilots-directory-shell">
        <div className="find-pilots-directory-toolbar">
          <label className="find-pilots-search">
            <span className="sr-only">Search pilots</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Search by name, city, or specialty..."
              className="find-pilots-search-input"
            />
          </label>

          <div className="find-pilots-filters" role="group" aria-label="Filter by specialty">
            {FIND_PILOT_FILTER_CHIPS.map((chip) => {
              const selected = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  aria-pressed={selected}
                  className={`find-pilots-chip${selected ? " find-pilots-chip--active" : ""}`}
                  onClick={() => toggleFilter(chip.id)}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="find-pilots-club-note">
          Looking for elite A-6 captains?{" "}
          <Link href="/captains-club">Explore Captain&apos;s Club →</Link>
        </p>

        {pilots.length === 0 ? (
          <div className="find-pilots-empty" role="status">
            <p className="find-pilots-empty-title">No pilots available yet</p>
            <p className="find-pilots-empty-text">
              Verified public pilot profiles will appear here once pilots complete
              onboarding and publish their profiles.
            </p>
          </div>
        ) : regionFilteredPilots.length === 0 ? (
          <div className="find-pilots-empty" role="status">
            <p className="find-pilots-empty-title">No pilots found</p>
            <p className="find-pilots-empty-text">
              Try adjusting your search or filter selection.
            </p>
          </div>
        ) : (
          <>
            <div className="find-pilots-grid">
              {visiblePilots.map((pilot) => (
                <ClientFindPilotCard key={pilot.id} pilot={pilot} />
              ))}
            </div>
            {canViewMore ? (
              <div className="find-pilots-more-wrap">
                <button
                  type="button"
                  className="ras-btn-outline find-pilots-more-btn"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  View more
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
