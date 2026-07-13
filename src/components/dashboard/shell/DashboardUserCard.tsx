import type { DashboardShellUser } from "@/types/dashboard-nav";

type DashboardUserCardProps = {
  user: DashboardShellUser;
};

export function DashboardUserCard({ user }: DashboardUserCardProps) {
  return (
    <div className="dashboard-user-card">
      <div className="dashboard-user-card-avatar" aria-hidden>
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="dashboard-user-card-avatar-img"
          />
        ) : (
          user.initials
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="dashboard-user-card-name">{user.displayName}</p>
        <p className="dashboard-user-card-subtitle">{user.subtitle}</p>
      </div>
    </div>
  );
}
