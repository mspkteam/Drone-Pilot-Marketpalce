"use client";

import { useMemo, useState } from "react";
import type { PilotServiceId } from "@/types/pilot";
import {
  filterFindPilots,
  FIND_PILOT_FILTER_CHIPS,
  type ClientFindPilot,
} from "@/lib/client/find-pilots";
import { ClientFindPilotCard } from "./ClientFindPilotCard";

type ClientFindPilotsProps = {
  pilots: ClientFindPilot[];
};

export function ClientFindPilots({ pilots }: ClientFindPilotsProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<PilotServiceId | null>(null);

  const filteredPilots = useMemo(
    () => filterFindPilots(pilots, query, activeFilter),
    [pilots, query, activeFilter],
  );

  function toggleFilter(serviceId: PilotServiceId) {
    setActiveFilter((current) => (current === serviceId ? null : serviceId));
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
            const selected = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                aria-pressed={selected}
                className={`client-find-pilots-chip${selected ? " client-find-pilots-chip--active" : ""}`}
                onClick={() => toggleFilter(chip.id)}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {pilots.length === 0 ? (
        <div className="client-find-pilots-empty" role="status">
          <p className="client-find-pilots-empty-title">No pilots available yet</p>
          <p className="client-find-pilots-empty-text">
            Verified public pilot profiles will appear here once pilots complete
            onboarding and make their profiles public.
          </p>
        </div>
      ) : filteredPilots.length === 0 ? (
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
