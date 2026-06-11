"use client";

import { useCallback, useState } from "react";
import { useModeratorPermissions } from "@/contexts/ModeratorPermissionsContext";
import type { AdminOperationsExportRow } from "@/types/admin-operations";

type AdminOperationsActionsProps = {
  exportRows: AdminOperationsExportRow[];
};

function rowsToCsv(rows: AdminOperationsExportRow[]): string {
  const header = "Section,Label,Value";
  const lines = rows.map((row) => {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    return [escape(row.section), escape(row.label), escape(row.value)].join(",");
  });
  return [header, ...lines].join("\n");
}

export function AdminOperationsActions({ exportRows }: AdminOperationsActionsProps) {
  const { canPerform, role } = useModeratorPermissions();
  const canExport = canPerform("reports", "export");
  const [briefingOpen, setBriefingOpen] = useState(false);

  const handleExport = useCallback(() => {
    const csv = rowsToCsv(exportRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "operations-dashboard-export.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [exportRows]);

  if (!canExport && role !== "super_admin") {
    return null;
  }

  return (
    <>
      <div className="admin-ops-hero-actions">
        {canExport ? (
          <button
            type="button"
            className="admin-ops-btn-primary"
            onClick={handleExport}
          >
            Export
          </button>
        ) : null}
        {role === "super_admin" ? (
          <button
            type="button"
            className="admin-ops-btn-outline"
            onClick={() => setBriefingOpen(true)}
          >
            New briefing
          </button>
        ) : null}
      </div>

      {briefingOpen ? (
        <div
          className="admin-ops-modal-backdrop"
          role="presentation"
          onClick={() => setBriefingOpen(false)}
        >
          <div
            className="admin-ops-modal"
            role="dialog"
            aria-labelledby="admin-briefing-title"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="admin-briefing-title" className="admin-ops-modal-title">
              New briefing
            </h2>
            <p className="admin-ops-modal-copy">
              Briefing and announcement management is pending backend
              integration. This placeholder confirms the command action slot in
              the operations dashboard layout.
            </p>
            <div className="admin-ops-modal-actions">
              <button
                type="button"
                className="admin-ops-btn-outline"
                onClick={() => setBriefingOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
