import { cn } from "@/lib/utils";

type ClientDashboardCardProps = {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function ClientDashboardCard({
  title,
  subtitle,
  action,
  children,
  className,
}: ClientDashboardCardProps) {
  return (
    <article className={cn("client-dashboard-card", className)}>
      <header className="client-dashboard-card-header">
        <div className="client-dashboard-card-heading">
          <h2 className="client-dashboard-card-title">{title}</h2>
          <p className="client-dashboard-card-subtitle">{subtitle}</p>
        </div>
        {action ? (
          <div className="client-dashboard-card-action">{action}</div>
        ) : null}
      </header>
      <div className="client-dashboard-card-divider" aria-hidden />
      <div className="client-dashboard-card-content">{children}</div>
    </article>
  );
}
