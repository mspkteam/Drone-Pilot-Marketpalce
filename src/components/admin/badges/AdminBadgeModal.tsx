"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatAverageRatingTenths,
  getWingConditionDefinition,
  listMembershipTierOptions,
  listSelectableWingConditions,
  listVerificationTypeOptions,
} from "@/lib/wings/conditions";
import type {
  AdminBadgeCardDto,
  BadgeFormInput,
  BadgeIconType,
  BadgeRarity,
} from "@/types/admin-badges";
import { BADGE_ICON_TYPES, BADGE_RARITIES } from "@/types/admin-badges";
import type { WingAutoRule, WingCategory } from "@/types/wing";

function rarityToCategory(rarity: BadgeRarity): WingCategory {
  switch (rarity) {
    case "RARE":
    case "LEGENDARY":
      return "trust";
    case "UNCOMMON":
    case "EPIC":
      return "community";
    case "MYTHIC":
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
  const selectableConditions = useMemo(() => listSelectableWingConditions(), []);
  const verificationOptions = useMemo(() => listVerificationTypeOptions(), []);
  const membershipOptions = useMemo(() => listMembershipTierOptions(), []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rarity, setRarity] = useState<BadgeRarity>("COMMON");
  const [iconType, setIconType] = useState<BadgeIconType>("star");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [autoRule, setAutoRule] = useState<WingAutoRule>("completed_bookings_count");
  const [threshold, setThreshold] = useState("5");
  const [ruleParam, setRuleParam] = useState("license");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("100");
  const [autoAward, setAutoAward] = useState(false);

  useEffect(() => {
    if (mode === "edit" && badge) {
      const rule = (badge.autoRule ?? "manual_only") as WingAutoRule;
      const def = getWingConditionDefinition(rule);
      setTitle(badge.title);
      setDescription(badge.description);
      setRarity(badge.rarity);
      setIconType(badge.iconType);
      setImageUrl(badge.imageUrl ?? "");
      setAutoRule(rule === "manual_only" ? "completed_bookings_count" : rule);
      setThreshold(
        badge.threshold != null
          ? String(badge.threshold)
          : String(def?.defaultThreshold ?? 1),
      );
      setRuleParam(
        badge.ruleParam ??
          (def?.field === "verification_type"
            ? "license"
            : def?.field === "membership_tier"
              ? "A2_JUNIOR_FLIGHT_OFFICER"
              : ""),
      );
      setIsActive(badge.isActive);
      setSortOrder(String(badge.sortOrder));
      setAutoAward(rule !== "manual_only" && rule !== null);
    } else {
      setTitle("");
      setDescription("");
      setRarity("COMMON");
      setIconType("star");
      setImageUrl("");
      setAutoRule("completed_bookings_count");
      setThreshold("5");
      setRuleParam("license");
      setIsActive(true);
      setSortOrder("100");
      setAutoAward(false);
    }
  }, [mode, badge]);

  const activeCondition = getWingConditionDefinition(
    autoAward ? autoRule : "manual_only",
  );

  function handleConditionChange(nextRule: WingAutoRule) {
    setAutoRule(nextRule);
    const def = getWingConditionDefinition(nextRule);
    if (def?.defaultThreshold != null) {
      setThreshold(String(def.defaultThreshold));
    }
    if (def?.field === "verification_type") {
      setRuleParam((prev) => prev || "license");
    } else if (def?.field === "membership_tier") {
      setRuleParam((prev) => prev || "A2_JUNIOR_FLIGHT_OFFICER");
    } else if (def?.field === "certificate_template_slug") {
      setRuleParam("");
    } else if (def?.field === "none" || def?.field === "threshold") {
      if (def.field === "none") setRuleParam("");
    }
  }

  async function handleImageUpload(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      if (title.trim()) body.append("code", title.trim());
      const res = await fetch("/api/admin/wing-definitions/upload", {
        method: "POST",
        body,
      });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error ?? "Upload failed.");
        return;
      }
      setImageUrl(json.url as string);
    } catch {
      setUploadError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsedThreshold = threshold.trim() ? parseInt(threshold, 10) : null;
    const parsedSort = sortOrder.trim() ? parseInt(sortOrder, 10) : 100;
    const resolvedRule: WingAutoRule = autoAward ? autoRule : "manual_only";
    const def = getWingConditionDefinition(resolvedRule);

    let resolvedParam = ruleParam.trim();
    let resolvedThreshold =
      Number.isFinite(parsedThreshold) ? parsedThreshold : null;

    if (def?.field === "none" || resolvedRule === "manual_only") {
      resolvedParam = "";
      if (resolvedRule === "manual_only") resolvedThreshold = null;
    }
    if (def?.field === "threshold" || def?.field === "average_rating_tenths") {
      resolvedParam = "";
      if (resolvedThreshold == null) {
        resolvedThreshold = def.defaultThreshold ?? 1;
      }
    }
    if (def?.field === "verification_type" && !resolvedParam) {
      resolvedParam = "license";
    }
    if (def?.field === "membership_tier" && !resolvedParam) {
      resolvedParam = "A2_JUNIOR_FLIGHT_OFFICER";
    }
    if (def?.field === "certificate_template_slug") {
      resolvedThreshold = resolvedThreshold ?? 1;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      category: rarityToCategory(rarity),
      rarity,
      iconType,
      imageUrl: imageUrl.trim(),
      autoRule: resolvedRule,
      threshold: resolvedThreshold,
      ruleParam: resolvedParam,
      isActive,
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
            {mode === "create" ? "New Wing" : "Edit Wing"}
          </h2>
          <p className="admin-badges-modal-subtitle">
            Set the award condition from live platform data. Matching pilots are
            granted this wing automatically when the trigger fires.
          </p>
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
              <label htmlFor="badge-criteria">Public criteria text</label>
              <textarea
                id="badge-criteria"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                required
                minLength={10}
                placeholder="Shown on pilot profile — describe what this badge means"
              />
            </div>

            <div className="admin-badges-field">
              <label htmlFor="badge-rarity">Rarity</label>
              <select
                id="badge-rarity"
                value={rarity}
                onChange={(event) =>
                  setRarity(event.target.value as BadgeRarity)
                }
              >
                {BADGE_RARITIES.map((value) => (
                  <option key={value} value={value}>
                    {value.charAt(0) + value.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-badges-field">
              <label htmlFor="badge-icon">Icon style</label>
              <select
                id="badge-icon"
                value={iconType}
                onChange={(event) =>
                  setIconType(event.target.value as BadgeIconType)
                }
              >
                {BADGE_ICON_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value
                      .split("-")
                      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                      .join(" ")}
                  </option>
                ))}
              </select>
              <p className="admin-badges-hint">
                Used when no wing image is set. Uploaded images override the icon.
              </p>
            </div>

            <div className="admin-badges-field">
              <label htmlFor="badge-image">Wing image</label>
              <div className="admin-badges-image-row">
                <div className="admin-badges-image-preview" aria-hidden>
                  {imageUrl.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl.trim()}
                      alt=""
                      className="admin-badges-image-preview-img"
                    />
                  ) : (
                    <span className="admin-badges-image-preview-empty">
                      No image
                    </span>
                  )}
                </div>
                <div className="admin-badges-image-controls">
                  <input
                    id="badge-image"
                    className="admin-badges-image-url"
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="/wings/aviator-wings-senior.png or https://…"
                  />
                  <div className="admin-badges-image-actions">
                    <label className="admin-badges-btn-upload">
                      {uploading ? "Uploading…" : "Upload image"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        hidden
                        disabled={uploading}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void handleImageUpload(file);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    {imageUrl.trim() ? (
                      <button
                        type="button"
                        className="admin-badges-btn-clear-image"
                        onClick={() => setImageUrl("")}
                        disabled={uploading}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
              <p className="admin-badges-hint">
                PNG, JPEG, WebP, or SVG (max 2&nbsp;MB). Files are saved to{" "}
                <code>public/wings/</code>. You can also drop artwork there named{" "}
                <code>&lt;wing-code&gt;.png</code> and reference it here.
              </p>
              {uploadError ? (
                <p className="admin-badges-hint admin-badges-hint--error">
                  {uploadError}
                </p>
              ) : null}
            </div>

            <fieldset className="admin-badges-condition-block">
              <legend className="admin-badges-condition-legend">
                Award condition
              </legend>

              <label className="admin-badges-check">
                <input
                  type="checkbox"
                  checked={autoAward}
                  onChange={(event) => setAutoAward(event.target.checked)}
                />
                Auto-award when condition is met
              </label>

              {!autoAward ? (
                <p className="admin-badges-hint">
                  Manual only — assign from the badge card. No automatic grants.
                </p>
              ) : (
                <>
                  <div className="admin-badges-field">
                    <label htmlFor="badge-condition">Condition type</label>
                    <select
                      id="badge-condition"
                      value={autoRule}
                      onChange={(event) =>
                        handleConditionChange(
                          event.target.value as WingAutoRule,
                        )
                      }
                    >
                      {selectableConditions.map((condition) => (
                        <option key={condition.rule} value={condition.rule}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                    {activeCondition ? (
                      <p className="admin-badges-condition-desc">
                        {activeCondition.description}
                      </p>
                    ) : null}
                  </div>

                  {activeCondition?.field === "threshold" ? (
                    <div className="admin-badges-field">
                      <label htmlFor="badge-threshold">
                        {activeCondition.thresholdLabel ?? "Threshold"}
                      </label>
                      <input
                        id="badge-threshold"
                        type="number"
                        min={1}
                        value={threshold}
                        onChange={(event) => setThreshold(event.target.value)}
                        required
                      />
                      {activeCondition.thresholdHint ? (
                        <p className="admin-badges-hint">
                          {activeCondition.thresholdHint}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {activeCondition?.field === "average_rating_tenths" ? (
                    <div className="admin-badges-field">
                      <label htmlFor="badge-rating-tenths">
                        {activeCondition.thresholdLabel}
                      </label>
                      <input
                        id="badge-rating-tenths"
                        type="number"
                        min={10}
                        max={50}
                        step={5}
                        value={threshold}
                        onChange={(event) => setThreshold(event.target.value)}
                        required
                      />
                      <p className="admin-badges-hint">
                        Preview:{" "}
                        {formatAverageRatingTenths(
                          Number.parseInt(threshold, 10) || 40,
                        )}{" "}
                        — {activeCondition.thresholdHint}
                      </p>
                    </div>
                  ) : null}

                  {activeCondition?.field === "verification_type" ? (
                    <div className="admin-badges-field">
                      <label htmlFor="badge-verification-type">
                        Verification type
                      </label>
                      <select
                        id="badge-verification-type"
                        value={ruleParam || "license"}
                        onChange={(event) => setRuleParam(event.target.value)}
                      >
                        {verificationOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {activeCondition?.field === "membership_tier" ? (
                    <div className="admin-badges-field">
                      <label htmlFor="badge-membership-tier">
                        Minimum membership grade
                      </label>
                      <select
                        id="badge-membership-tier"
                        value={ruleParam || "A2_JUNIOR_FLIGHT_OFFICER"}
                        onChange={(event) => setRuleParam(event.target.value)}
                      >
                        {membershipOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="admin-badges-hint">
                        Pilots at this grade or higher (with active membership)
                        qualify.
                      </p>
                    </div>
                  ) : null}

                  {activeCondition?.field === "certificate_template_slug" ? (
                    <div className="admin-badges-field-row">
                      <div className="admin-badges-field">
                        <label htmlFor="badge-cert-slug">
                          Certificate template slug
                        </label>
                        <input
                          id="badge-cert-slug"
                          value={ruleParam}
                          onChange={(event) => setRuleParam(event.target.value)}
                          placeholder="e.g. platform-verified-pilot"
                          required
                        />
                        <p className="admin-badges-hint">
                          Use the slug from Certificates → template (shown after
                          create). Issuing that certificate re-evaluates wings.
                        </p>
                      </div>
                      <div className="admin-badges-field">
                        <label htmlFor="badge-cert-count">
                          {activeCondition.thresholdLabel ?? "Minimum"}
                        </label>
                        <input
                          id="badge-cert-count"
                          type="number"
                          min={1}
                          value={threshold}
                          onChange={(event) => setThreshold(event.target.value)}
                        />
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </fieldset>

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
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                />
                Active (visible and eligible for awards)
              </label>
            </div>
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
            <button
              type="submit"
              className="admin-badges-btn-save"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Wing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
