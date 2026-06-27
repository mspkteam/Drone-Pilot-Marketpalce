"use client";

import { useMemo, useState } from "react";
import {
  CAPTAIN_DIRECTORY_PAGE_SIZE,
  CAPTAIN_SORT_OPTIONS,
  type CaptainClubPilot,
  type CaptainSortOption,
} from "@/types/captains-club";
import {
  filterCaptainsClub,
  sortCaptainsClub,
} from "@/lib/pilot/captains-club";
import type { PilotServiceId } from "@/types/pilot";
import { CaptainClubCard } from "./CaptainClubCard";

type CaptainsClubDirectoryProps = {
  captains: CaptainClubPilot[];
  regions: string[];
  specialties: { id: PilotServiceId; label: string }[];
  initialRegion?: string | null;
};

export function CaptainsClubDirectory({
  captains,
  regions,
  specialties,
  initialRegion = null,
}: CaptainsClubDirectoryProps) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>(
    initialRegion && regions.includes(initialRegion) ? initialRegion : "all",
  );
  const [specialty, setSpecialty] = useState<PilotServiceId | "all">("all");
  const [sortBy, setSortBy] = useState<CaptainSortOption>("highest_rated");
  const [visibleCount, setVisibleCount] = useState(CAPTAIN_DIRECTORY_PAGE_SIZE);

  const filteredCaptains = useMemo(() => {
    const filtered = filterCaptainsClub(
      captains,
      query,
      region === "all" ? null : region,
      specialty === "all" ? null : specialty,
    );
    return sortCaptainsClub(filtered, sortBy);
  }, [captains, query, region, specialty, sortBy]);

  const visibleCaptains = filteredCaptains.slice(0, visibleCount);
  const canViewMore = visibleCount < filteredCaptains.length;

  return (
    <section
      id="captains-directory"
      className="captains-club-directory"
      aria-label="Captain directory"
    >
      <div className="public-container">
        <div className="captains-club-directory-toolbar">
          <label className="captains-club-search">
            <span className="sr-only">Search captains</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(CAPTAIN_DIRECTORY_PAGE_SIZE);
              }}
              placeholder="Search Captains..."
              className="captains-club-search-input"
            />
          </label>

          <label className="captains-club-select-wrap">
            <span className="sr-only">Filter by region</span>
            <select
              value={region}
              onChange={(event) => {
                setRegion(event.target.value);
                setVisibleCount(CAPTAIN_DIRECTORY_PAGE_SIZE);
              }}
              className="captains-club-select"
            >
              <option value="all">Region</option>
              {regions.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>

          <label className="captains-club-select-wrap">
            <span className="sr-only">Filter by specialty</span>
            <select
              value={specialty}
              onChange={(event) => {
                setSpecialty(event.target.value as PilotServiceId | "all");
                setVisibleCount(CAPTAIN_DIRECTORY_PAGE_SIZE);
              }}
              className="captains-club-select"
            >
              <option value="all">Specialty</option>
              {specialties.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>

          <label className="captains-club-select-wrap">
            <span className="sr-only">Sort captains</span>
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as CaptainSortOption);
                setVisibleCount(CAPTAIN_DIRECTORY_PAGE_SIZE);
              }}
              className="captains-club-select"
            >
              {CAPTAIN_SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {captains.length === 0 ? (
          <div className="captains-club-empty" role="status">
            <p className="captains-club-empty-title">No captains listed yet</p>
            <p className="captains-club-empty-text">
              A-6 Captain profiles will appear here once pilots reach the highest tier
              and publish their profiles.
            </p>
          </div>
        ) : filteredCaptains.length === 0 ? (
          <div className="captains-club-empty" role="status">
            <p className="captains-club-empty-title">No captains match your filters</p>
            <p className="captains-club-empty-text">
              Try adjusting search, region, or specialty filters.
            </p>
          </div>
        ) : (
          <>
            <div className="captains-club-grid">
              {visibleCaptains.map((captain) => (
                <CaptainClubCard key={captain.id} captain={captain} />
              ))}
            </div>
            {canViewMore ? (
              <div className="captains-club-more-wrap">
                <button
                  type="button"
                  className="ras-btn-outline captains-club-more-btn"
                  onClick={() =>
                    setVisibleCount((count) => count + CAPTAIN_DIRECTORY_PAGE_SIZE)
                  }
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
