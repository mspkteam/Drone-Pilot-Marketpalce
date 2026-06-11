"use client";

import { useEffect, useState } from "react";
import type { AdminReportsFooterMetric } from "@/types/admin-reports";

type AdminReportsFooterStripProps = {
  metrics: AdminReportsFooterMetric[];
  syncedAt: string;
};

function formatUtcTime(date: Date): string {
  return date.toISOString().slice(11, 19);
}

export function AdminReportsFooterStrip({
  metrics,
  syncedAt,
}: AdminReportsFooterStripProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [utcTime, setUtcTime] = useState(() => formatUtcTime(new Date()));

  useEffect(() => {
    const base = new Date(syncedAt).getTime();

    const tick = () => {
      const now = Date.now();
      setSecondsAgo(Math.max(0, Math.floor((now - base) / 1000)));
      setUtcTime(formatUtcTime(new Date()));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [syncedAt]);

  return (
    <footer className="admin-reports-footer-strip">
      <div className="admin-reports-footer-metrics">
        {metrics.map((metric) => (
          <div key={metric.label} className="admin-reports-footer-metric">
            <span className="admin-reports-footer-metric-label">{metric.label}</span>
            <span
              className={`admin-reports-footer-metric-value${
                metric.tone === "gold"
                  ? " admin-reports-footer-metric-value--gold"
                  : metric.tone === "warning"
                    ? " admin-reports-footer-metric-value--warning"
                    : ""
              }`}
            >
              {metric.value}
            </span>
          </div>
        ))}
      </div>
      <p className="admin-reports-footer-sync">
        DATA SYNCHRONIZED {secondsAgo}S AGO • UTC {utcTime}
      </p>
    </footer>
  );
}
