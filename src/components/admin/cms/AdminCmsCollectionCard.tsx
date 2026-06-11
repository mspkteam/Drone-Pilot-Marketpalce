import Link from "next/link";
import type { CmsCollectionStats } from "@/types/cms";

type AdminCmsCollectionCardProps = {
  title: string;
  description: string;
  stats: CmsCollectionStats;
  manageHref: string;
  addHref: string;
  manageLabel: string;
  addLabel: string;
};

export function AdminCmsCollectionCard({
  title,
  description,
  stats,
  manageHref,
  addHref,
  manageLabel,
  addLabel,
}: AdminCmsCollectionCardProps) {
  return (
    <article className="admin-cms-collection-card">
      <h2 className="admin-cms-collection-title">{title}</h2>
      <p className="admin-cms-collection-desc">{description}</p>
      <div className="admin-cms-collection-meta">
        <span>{stats.total} total</span>
        <span>{stats.published} published</span>
        <span>{stats.drafts} drafts</span>
      </div>
      <div className="admin-cms-collection-actions">
        <Link href={manageHref} className="admin-cms-btn-outline">
          {manageLabel}
        </Link>
        <Link href={addHref} className="admin-cms-btn-gold">
          {addLabel}
        </Link>
      </div>
    </article>
  );
}
