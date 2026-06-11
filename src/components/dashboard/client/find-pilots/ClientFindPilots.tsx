"use client";

import { useMemo, useState } from "react";
import {
  CLIENT_FIND_PILOTS,
  filterFindPilots,
  FIND_PILOT_FILTER_CHIPS,
  type FindPilotFilterChip,
} from "@/lib/client/find-pilots-mock";
import { ClientFindPilotCard } from "./ClientFindPilotCard";

export function ClientFindPilots() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FindPilotFilterChip | null>(
    null,
  );

  const filteredPilots = useMemo(
    () => filterFindPilots(CLIENT_FIND_PILOTS, query, activeFilter),
    [query, activeFilter],
  );

  function toggleFilter(chip: FindPilotFilterChip) {
    setActiveFilter((current) => (current === chip ? null : chip));
  }

  return (
    <div className="client-find-pilots-page">
      <header className="client-find-pilots-header">
        <h1 className="client-find-pilots-title">Find verified pilots</h1>
        <p className="client-find-pilots-subtitle">
          Browse top-rated drone professionals across the United States.
        </p>
      </header>

      <div className="client-find-pilots-toolbar">
        <label className="client-find-pilots-search-wrap">
          <span className="sr-only">Search pilots</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, or specialty..."
            className="client-find-pilots-search"
          />
        </label>

        <div
          className="client-find-pilots-filters"
          role="group"
          aria-label="Filter by specialty"
        >
          {FIND_PILOT_FILTER_CHIPS.map((chip) => {
            const selected = activeFilter === chip;
            return (
              <button
                key={chip}
                type="button"
                aria-pressed={selected}
                className={`client-find-pilots-chip${selected ? " client-find-pilots-chip--active" : ""}`}
                onClick={() => toggleFilter(chip)}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {filteredPilots.length === 0 ? (
        <div className="client-find-pilots-empty" role="status">
          <p className="client-find-pilots-empty-title">No pilots found</p>
          <p className="client-find-pilots-empty-text">
            Try adjusting your search or filter selection.
          </p>
        </div>
      ) : (
        <div className="client-find-pilots-grid">
          {filteredPilots.map((pilot) => (
            <ClientFindPilotCard key={pilot.id} pilot={pilot} />
          ))}
        </div>
      )}
    </div>
  );
}
