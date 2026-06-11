import Link from "next/link";
import { AdminOperationsActions } from "@/components/dashboard/admin/AdminOperationsActions";
import { AdminPlatformGrowthChart } from "@/components/dashboard/admin/AdminPlatformGrowthChart";
import type {
  AdminActionQueueItem,
  AdminOperationsDashboardData,
} from "@/types/admin-operations";

type AdminOperationsDashboardProps = {
  data: AdminOperationsDashboardData;
};

function QueueIcon({ icon }: { icon: AdminActionQueueItem["icon"] }) {
  if (icon === "alert") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path
          d="M9 3.5l5.5 9H3.5L9 3.5z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path
          d="M9 8v2.25M9 12h.01"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (icon === "user-plus") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <circle cx="7" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.25" />
        <path
          d="M3.5 14.5c0-2 1.8-3.5 3.5-3.5s3.5 1.5 3.5 3.5M13 6.5v3M14.5 8h-3"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (icon === "wallet") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <rect
          x="3"
          y="5"
          width="12"
          height="8.5"
          rx="1.25"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path d="M3 8h12" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="12.5" cy="10.5" r="1" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M9 3l3.5 1.5V8c0 1.6-1.2 3-3.5 3.6C6.7 11 5.5 9.6 5.5 8V4.5L9 3z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M7 9.5l1.25 1.25L11 8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminOperationsDashboard({ data }: AdminOperationsDashboardProps) {
  return (
    <div className="admin-ops-page">
      <section
        className="admin-ops-hero admin-ops-bracket-card"
        aria-label="Operations command center"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-ops-hero-inner">
          <div className="admin-ops-hero-copy">
            <p className="admin-ops-eyebrow">COMMAND CENTER</p>
            <h1 className="admin-ops-hero-title">Operations Dashboard</h1>
            <p className="admin-ops-hero-desc">
              Welcome back, Commander. Here&apos;s how the platform is performing
              right now.
            </p>
          </div>
          <AdminOperationsActions exportRows={data.exportRows} />
        </div>
      </section>

      <section className="admin-ops-stats-grid" aria-label="Platform statistics">
        {data.stats.map((stat) => (
          <article
            key={stat.label}
            className="admin-ops-stat-card admin-ops-bracket-card"
          >
            <span className="admin-ops-stat-accent" aria-hidden />
            <p className="admin-ops-stat-label">{stat.label}</p>
            <p className="admin-ops-stat-value">{stat.value}</p>
            <p
              className={`admin-ops-stat-sub${
                stat.subtextTone === "success" ? " admin-ops-stat-sub--success" : ""
              }`}
            >
              {stat.subtext}
            </p>
          </article>
        ))}
      </section>

      <div className="admin-ops-main-grid">
        <div className="admin-ops-main-left">
          <section className="admin-ops-panel admin-ops-panel--growth">
            <div className="admin-ops-panel-head">
              <div>
                <h2 className="admin-ops-panel-title">PLATFORM GROWTH</h2>
                <p className="admin-ops-panel-sub">
                  Mission volume — last 90 days
                </p>
              </div>
              <div className="admin-ops-legend">
                <span className="admin-ops-legend-item">
                  <span className="admin-ops-legend-dot admin-ops-legend-dot--gold" />
                  Missions completed
                </span>
                <span className="admin-ops-legend-item">
                  <span className="admin-ops-legend-dot admin-ops-legend-dot--green" />
                  New pilots onboarded
                </span>
              </div>
            </div>
            <AdminPlatformGrowthChart series={data.growth} />
          </section>

          <section className="admin-ops-panel">
            <div className="admin-ops-panel-head">
              <div>
                <h2 className="admin-ops-panel-title">SYSTEM INTEGRITY</h2>
                <p className="admin-ops-panel-sub">All services healthy</p>
              </div>
            </div>
            <div className="admin-ops-integrity-grid">
              {data.systemIntegrity.map((metric) => (
                <div key={metric.label} className="admin-ops-integrity-metric">
                  <p className="admin-ops-integrity-label">{metric.label}</p>
                  <p className="admin-ops-integrity-value">{metric.value}</p>
                  <div className="admin-ops-integrity-track">
                    <span
                      className="admin-ops-integrity-fill"
                      style={{ width: `${metric.fillPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="admin-ops-integrity-strip">
              • ALL NODES SYNCHRONIZED · SECTOR 7 SECURED
            </p>
          </section>
        </div>

        <div className="admin-ops-main-right">
          <section className="admin-ops-panel">
            <div className="admin-ops-panel-head">
              <div>
                <h2 className="admin-ops-panel-title">CRITICAL ACTION QUEUE</h2>
                <p className="admin-ops-panel-sub">Items waiting on you</p>
              </div>
            </div>
            {data.actionQueue.length > 0 ? (
              <ul className="admin-ops-queue-list">
                {data.actionQueue.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`admin-ops-queue-item admin-ops-queue-item--${item.tone}`}
                    >
                      <span className="admin-ops-queue-icon">
                        <QueueIcon icon={item.icon} />
                      </span>
                      <span className="admin-ops-queue-body">
                        <span className="admin-ops-queue-type">{item.typeLabel}</span>
                        <span className="admin-ops-queue-text">{item.text}</span>
                      </span>
                      <span className="admin-ops-queue-action">{item.actionLabel}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-ops-empty">No critical items in queue.</p>
            )}
          </section>

          <section className="admin-ops-panel">
            <div className="admin-ops-panel-head">
              <h2 className="admin-ops-panel-title">RECENT SIGN-UPS</h2>
            </div>
            {data.recentSignups.length > 0 ? (
              <ul className="admin-ops-signups-list">
                {data.recentSignups.map((signup) => (
                  <li key={signup.id} className="admin-ops-signup-row">
                    <span className="admin-ops-signup-avatar">{signup.initials}</span>
                    <span className="admin-ops-signup-copy">
                      <span className="admin-ops-signup-name">{signup.name}</span>
                      <span className="admin-ops-signup-time">{signup.timeAgo}</span>
                    </span>
                    <span className="admin-ops-signup-badge">{signup.badge}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-ops-empty">No recent sign-ups.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
