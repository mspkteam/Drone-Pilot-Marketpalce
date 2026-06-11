import type { CmsStatus } from "@/types/cms";

type AdminCmsStatusBadgeProps = {
  status: CmsStatus;
};

export function AdminCmsStatusBadge({ status }: AdminCmsStatusBadgeProps) {
  const className =
    status === "published"
      ? "admin-cms-status admin-cms-status--published"
      : status === "draft"
        ? "admin-cms-status admin-cms-status--draft"
        : "admin-cms-status admin-cms-status--archived";

  return <span className={className}>{status.toUpperCase()}</span>;
}
