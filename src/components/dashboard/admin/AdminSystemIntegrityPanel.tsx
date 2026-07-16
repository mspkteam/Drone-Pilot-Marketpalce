"use client";

import { useState } from "react";
import type {
  AdminSystemIntegrity,
  AdminSystemIntegrityMetricId,
} from "@/types/admin-operations";

type AdminSystemIntegrityPanelProps = {
  data: AdminSystemIntegrity;
};

export function AdminSystemIntegrityPanel({
  data,
}: AdminSystemIntegrityPanelProps) {
  const [selectedId, setSelectedId] =
    useState<AdminSystemIntegrityMetricId | null>(null);

  const selected =
    data.metrics.find((m) => m.id === selectedId) ?? null;

  return (
    <section className="admin-ops-panel">
      <div className="admin-ops-panel-head">
        <div>
          <h2 className="admin-ops-panel-title">SYSTEM INTEGRITY</h2>
          <p className="admin-ops-panel-sub">{data.statusLabel}</p>
        </div>
        <p className="admin-ops-integrity-checked" aria-live="polite">
          Checked {data.checkedAtLabel}
        </p>
      </div>
      <div className="admin-ops-integrity-grid" role="list">
        {data.metrics.map((metric) => {
          const isSelected = selectedId === metric.id;
          return (
            <button
              key={metric.id}
              type="button"
              role="listitem"
              className={`admin-ops-integrity-metric admin-ops-integrity-metric--btn${
                isSelected ? " is-selected" : ""
              }`}
              aria-pressed={isSelected}
              onClick={() =>
                setSelectedId((prev) =>
                  prev === metric.id ? null : metric.id,
                )
              }
            >
              <p className="admin-ops-integrity-label">{metric.label}</p>
              <p className="admin-ops-integrity-value">{metric.value}</p>
              <div className="admin-ops-integrity-track">
                <span
                  className="admin-ops-integrity-fill"
                  style={{ width: `${metric.fillPct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
      {selected ? (
        <p className="admin-ops-integrity-detail" role="status">
          {selected.detail}
        </p>
      ) : null}
      <p className="admin-ops-integrity-strip">{data.stripLabel}</p>
    </section>
  );
}
