"use client";

import { useCallback } from "react";
import { useModeratorPermissions } from "@/contexts/ModeratorPermissionsContext";
import type { AdminReportsExportRow } from "@/types/admin-reports";

type AdminReportsExportButtonProps = {
  exportRows: AdminReportsExportRow[];
};

function rowsToCsv(rows: AdminReportsExportRow[]): string {
  const header = "Section,Label,Value";
  const lines = rows.map((row) => {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    return [escape(row.section), escape(row.label), escape(row.value)].join(",");
  });
  return [header, ...lines].join("\n");
}

export function AdminReportsExportButton({
  exportRows,
}: AdminReportsExportButtonProps) {
  const { canPerform } = useModeratorPermissions();
  const canExport = canPerform("reports", "export");

  const handleExport = useCallback(() => {
    const csv = rowsToCsv(exportRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "reports-analytics-export.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [exportRows]);

  if (!canExport) {
    return null;
  }

  return (
    <button
      type="button"
      className="admin-reports-btn-export"
      onClick={handleExport}
    >
      EXPORT CSV
    </button>
  );
}
