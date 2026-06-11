"use client";

import { useEffect, useState } from "react";
import { iconLabelForType } from "@/lib/admin/badge-display";
import { getWingAutoRuleLabel } from "@/lib/wings/status";
import type { AdminBadgeCardDto, BadgeFormInput, BadgeIconType, BadgeRarity } from "@/types/admin-badges";
import { WING_AUTO_RULES, WING_CATEGORIES } from "@/types/wing";
import type { WingCategory } from "@/types/wing";

const RARITIES: BadgeRarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
const ICON_TYPES: BadgeIconType[] = [
  "trophy",
  "star",
  "lightning",
  "medal",
  "star-outline",
  "award",
];

function rarityToCategory(rarity: BadgeRarity): WingCategory {
  switch (rarity) {
    case "RARE":
      return "trust";
    case "EPIC":
      return "community";
    case "LEGENDARY":
      return "trust";
    case "COMMON":
    default:
      return "milestone";
  }
}

type AdminBadgeModalProps = {
  mode: "create" | "edit";
  badge: AdminBadgeCardDto | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: BadgeFormInput) => void;
};

export function AdminBadgeModal({
  mode,
  badge,
  saving,
  error,
  onClose,
  onSave,
}: AdminBadgeModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rarity, setRarity] = useState<BadgeRarity>("COMMON");
  const [iconType, setIconType] = useState<BadgeIconType>("star");
  const [autoRule, setAutoRule] = useState<BadgeFormInput["autoRule"]>("manual_only");
  const [threshold, setThreshold] = useState("");
  const [ruleParam, setRuleParam] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("100");
  const [autoAward, setAutoAward] = useState(false);
  const [visibleOnProfile, setVisibleOnProfile] = useState(true);

  useEffect(() => {
    if (mode === "edit" && badge) {
      setTitle(badge.title);
      setDescription(badge.description);
      setRarity(badge.rarity);
      setIconType(badge.iconType);
      setAutoRule(badge.autoRule ?? "manual_only");
      setThreshold(badge.threshold != null ? String(badge.threshold) : "");
      setRuleParam(badge.ruleParam ?? "");
      setIsActive(badge.isActive);
      setSortOrder(String(badge.sortOrder));
      setAutoAward(badge.autoRule !== "manual_only" && badge.autoRule !== null);
      setVisibleOnProfile(badge.isActive);
    } else {
      setTitle("");
      setDescription("");
      setRarity("COMMON");
      setIconType("star");
      setAutoRule("manual_only");
      setThreshold("");
      setRuleParam("");
      setIsActive(true);
      setSortOrder("100");
      setAutoAward(false);
      setVisibleOnProfile(true);
    }
  }, [mode, badge]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsedThreshold = threshold.trim() ? parseInt(threshold, 10) : null;
    const parsedSort = sortOrder.trim() ? parseInt(sortOrder, 10) : 100;
    onSave({
      title: title.trim(),
      description: description.trim(),
      category: rarityToCategory(rarity),
      rarity,
      iconType,
      autoRule: autoAward ? autoRule : "manual_only",
      threshold: Number.isFinite(parsedThreshold) ? parsedThreshold : null,
      ruleParam: ruleParam.trim(),
      isActive: isActive && visibleOnProfile,
      sortOrder: Number.isFinite(parsedSort) ? parsedSort : 100,
    });
  }

  return (
    <div
      className="admin-badges-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-badges-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-badge-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-badges-modal-head">
          <h2 id="admin-badge-modal-title" className="admin-badges-modal-title">
            {mode === "create" ? "New Badge" : "Edit Badge"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-badges-modal-body">
            {error ? (
              <p className="admin-badges-banner admin-badges-banner--error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="admin-badges-field">
              <label htmlFor="badge-title">Badge name</label>
              <input
                id="badge-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            <div className="admin-badges-field">
              <label htmlFor="badge-criteria">Criteria / short description</label>
              <textarea
                id="badge-criteria"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                required
                minLength={10}
              />
            </div>

            <div className="admin-badges-field-row">
              <div className="admin-badges-field">
                <label htmlFor="badge-rarity">Rarity</label>
                <select
                  id="badge-rarity"
                  value={rarity}
                  onChange={(event) => setRarity(event.target.value as BadgeRarity)}
                >
                  {RARITIES.map((value) => (
                    <option key={value} value={value}>
                      {value.charAt(0) + value.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-badges-field">
                <label htmlFor="badge-icon">Icon type</label>
                <select
                  id="badge-icon"
                  value={iconType}
                  onChange={(event) => setIconType(event.target.value as BadgeIconType)}
                >
                  {ICON_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {iconLabelForType(value)} {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-badges-field">
              <label htmlFor="badge-trigger">Trigger type</label>
              <select
                id="badge-trigger"
                value={autoRule}
                onChange={(event) =>
                  setAutoRule(event.target.value as BadgeFormInput["autoRule"])
                }
                disabled={!autoAward}
              >
                {WING_AUTO_RULES.map((rule) => (
                  <option key={rule} value={rule}>
                    {getWingAutoRuleLabel(rule)}
                  </option>
                ))}
              </select>
            </div>

            {autoRule !== "manual_only" && autoAward ? (
              <div className="admin-badges-field-row">
                <div className="admin-badges-field">
                  <label htmlFor="badge-threshold">Trigger value</label>
                  <input
                    id="badge-threshold"
                    type="number"
                    min={1}
                    value={threshold}
                    onChange={(event) => setThreshold(event.target.value)}
                  />
                </div>
                <div className="admin-badges-field">
                  <label htmlFor="badge-rule-param">Rule parameter</label>
                  <input
                    id="badge-rule-param"
                    value={ruleParam}
                    onChange={(event) => setRuleParam(event.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            ) : null}

            <div className="admin-badges-field">
              <label htmlFor="badge-category">Wing category (persisted)</label>
              <select
                id="badge-category"
                value={rarityToCategory(rarity)}
                disabled
                title="Derived from rarity for wing definitions"
              >
                {WING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-badges-field">
              <label htmlFor="badge-sort">Sort order</label>
              <input
                id="badge-sort"
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              />
            </div>

            <div className="admin-badges-checks">
              <label className="admin-badges-check">
                <input
                  type="checkbox"
                  checked={visibleOnProfile}
                  onChange={(event) => setVisibleOnProfile(event.target.checked)}
                />
                Visible on pilot profile
              </label>
              <label className="admin-badges-check">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                />
                Active
              </label>
              <label className="admin-badges-check">
                <input
                  type="checkbox"
                  checked={autoAward}
                  onChange={(event) => setAutoAward(event.target.checked)}
                />
                Auto-award when trigger is met
              </label>
            </div>

            {autoAward ? (
              <p className="admin-badges-hint">
                Automation uses existing wing milestone rules. Triggers like flight hours,
                night missions, and first bid require additional engine work.
              </p>
            ) : null}
          </div>

          <div className="admin-badges-modal-foot">
            <button
              type="button"
              className="admin-badges-btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="admin-badges-btn-save" disabled={saving}>
              {saving ? "Saving…" : "Save Badge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
