"use client";

import { BadgeWingIcon } from "@/components/admin/badges/BadgeWingIcon";
import type { AdminBadgeCardDto } from "@/types/admin-badges";

type AdminBadgeCardProps = {
  badge: AdminBadgeCardDto;
  canManage: boolean;
  onEdit: (badge: AdminBadgeCardDto) => void;
  onAssign: (badge: AdminBadgeCardDto) => void;
};

function rarityClass(rarity: AdminBadgeCardDto["rarity"]): string {
  switch (rarity) {
    case "LEGENDARY":
      return "admin-badges-card--legendary";
    case "RARE":
      return "admin-badges-card--rare";
    case "EPIC":
      return "admin-badges-card--epic";
    case "COMMON":
    default:
      return "admin-badges-card--common";
  }
}

function rarityValueClass(rarity: AdminBadgeCardDto["rarity"]): string {
  switch (rarity) {
    case "LEGENDARY":
      return "admin-badges-rarity-value--legendary";
    case "RARE":
      return "admin-badges-rarity-value--rare";
    case "EPIC":
      return "admin-badges-rarity-value--epic";
    case "COMMON":
    default:
      return "admin-badges-rarity-value--common";
  }
}

export function AdminBadgeCard({
  badge,
  canManage,
  onEdit,
  onAssign,
}: AdminBadgeCardProps) {
  return (
    <article
      className={`admin-badges-card ${rarityClass(badge.rarity)}`}
      data-mock={badge.isMock ? "true" : undefined}
    >
      <div className="admin-badges-card-head">
        <h3 className="admin-badges-card-title">{badge.title}</h3>
        <p className="admin-badges-card-criteria">{badge.criteria}</p>
      </div>

      <div className="admin-badges-card-divider" aria-hidden />

      <div
        className={`admin-badges-icon-block admin-badges-icon-block--${badge.rarity.toLowerCase()}`}
        aria-hidden
      >
        <BadgeWingIcon
          type={badge.iconType}
          className="admin-badges-icon-svg"
          title={badge.title}
        />
      </div>

      <div className="admin-badges-card-meta">
        <div>
          <p className="admin-badges-meta-label">RARITY</p>
          <p className={`admin-badges-rarity-value ${rarityValueClass(badge.rarity)}`}>
            {badge.rarity}
          </p>
        </div>
        <p className="admin-badges-earned">
          {badge.awardedCount.toLocaleString()} pilots earned
        </p>
      </div>

      {canManage ? (
        <div className="admin-badges-card-actions">
          <button
            type="button"
            className="admin-badges-btn-edit"
            onClick={() => onEdit(badge)}
          >
            Edit
          </button>
          <button
            type="button"
            className="admin-badges-btn-assign"
            onClick={() => onAssign(badge)}
            disabled={badge.isMock}
            title={badge.isMock ? "Assign after real badge definitions exist" : undefined}
          >
            Assign
          </button>
        </div>
      ) : null}
    </article>
  );
}
