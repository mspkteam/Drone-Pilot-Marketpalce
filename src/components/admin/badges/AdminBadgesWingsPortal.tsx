"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminBadgeAssignModal } from "@/components/admin/badges/AdminBadgeAssignModal";
import { AdminBadgeCard } from "@/components/admin/badges/AdminBadgeCard";
import { AdminBadgeModal } from "@/components/admin/badges/AdminBadgeModal";
import { iconLabelForType } from "@/lib/admin/badge-display";
import type {
  AdminBadgeCardDto,
  AdminBadgeEngineDataDto,
  BadgeFormInput,
  BadgeRarity,
} from "@/types/admin-badges";
import type { AdminPilotWingDto } from "@/types/wing";

function isPositiveGrowth(subtext: string): boolean {
  return subtext.trim().startsWith("+");
}

type AdminBadgesWingsPortalProps = {
  canManage: boolean;
};

export function AdminBadgesWingsPortal({ canManage }: AdminBadgesWingsPortalProps) {
  const searchParams = useSearchParams();
  const preselectedPilotId = searchParams.get("pilot") ?? "";
  const [data, setData] = useState<AdminBadgeEngineDataDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState<BadgeRarity | "ALL">("ALL");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL",
  );

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingBadge, setEditingBadge] = useState<AdminBadgeCardDto | null>(null);
  const [assignBadge, setAssignBadge] = useState<AdminBadgeCardDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/badge-engine");
      const json = (await res.json()) as AdminBadgeEngineDataDto & { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to load badges.");
        setData(null);
      } else {
        setData(json);
      }
    } catch {
      setError("Failed to load badges.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredBadges = useMemo(() => {
    const badges = data?.badges ?? [];
    const query = search.trim().toLowerCase();
    return badges.filter((badge) => {
      if (rarityFilter !== "ALL" && badge.rarity !== rarityFilter) return false;
      if (activeFilter === "ACTIVE" && !badge.isActive) return false;
      if (activeFilter === "INACTIVE" && badge.isActive) return false;
      if (!query) return true;
      return (
        badge.title.toLowerCase().includes(query) ||
        badge.criteria.toLowerCase().includes(query) ||
        badge.code.toLowerCase().includes(query)
      );
    });
  }, [data?.badges, search, rarityFilter, activeFilter]);

  async function handleSaveBadge(input: BadgeFormInput) {
    if (!canManage) return;
    if (modalMode === "edit" && editingBadge?.isMock) {
      setModalError(
        "Sample badges are preview-only until wing definitions exist in the database.",
      );
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      const payload = {
        title: input.title,
        description: input.description,
        category: input.category,
        rarity: input.rarity,
        iconLabel: iconLabelForType(input.iconType),
        imageUrl: input.imageUrl || null,
        autoRule: input.autoRule,
        threshold: input.threshold,
        ruleParam: input.ruleParam || null,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      };

      if (modalMode === "create") {
        const res = await fetch("/api/admin/wing-definitions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) {
          setModalError(json.error ?? "Create failed.");
          return;
        }
        setSuccess(`Badge "${json.definition?.title ?? input.title}" created.`);
        setModalMode(null);
        await load();
      } else if (modalMode === "edit" && editingBadge) {
        const res = await fetch(`/api/admin/wing-definitions/${editingBadge.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) {
          setModalError(json.error ?? "Save failed.");
          return;
        }
        setSuccess(`Badge "${json.definition?.title ?? input.title}" updated.`);
        setModalMode(null);
        setEditingBadge(null);
        await load();
      }
    } catch {
      setModalError("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignBadge(input: {
    pilotProfileId: string;
    note: string;
  }) {
    if (!canManage || !assignBadge || assignBadge.isMock) return;

    setAssigning(true);
    setModalError(null);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/wings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilotProfileId: input.pilotProfileId,
          wingDefinitionId: assignBadge.id,
          note: input.note,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setModalError(json.error ?? "Assign failed.");
        return;
      }
      const message = json.created
        ? `Awarded "${json.wing?.title ?? assignBadge.title}" to pilot.`
        : "Pilot already has this badge.";
      if (input.note && json.created) {
        setSuccess(`${message} Note saved with the award.`);
      } else {
        setSuccess(message);
      }
      setAssignBadge(null);
      await load();
    } catch {
      setModalError("Assign failed.");
    } finally {
      setAssigning(false);
    }
  }

  const stats = data?.stats;
  const recentAwards = data?.recentAwards ?? [];
  const preselectedPilot = useMemo(
    () => data?.pilots.find((pilot) => pilot.id === preselectedPilotId) ?? null,
    [data?.pilots, preselectedPilotId],
  );

  if (loading) {
    return <p className="admin-badges-loading">Loading badges & wings…</p>;
  }

  return (
    <div className="admin-badges-page">
      {preselectedPilot ? (
        <p className="admin-badges-banner admin-badges-banner--info" role="status">
          Assigning for <strong>{preselectedPilot.displayName}</strong> (
          {preselectedPilot.email}). Open a badge and choose Assign — the pilot is
          already selected.
        </p>
      ) : null}
      <section
        className="admin-badges-hero admin-ops-bracket-card"
        aria-label="Badges and wings"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-badges-hero-inner">
          <div className="admin-badges-hero-copy">
            <p className="admin-ops-eyebrow">ACHIEVEMENTS</p>
            <h1 className="admin-badges-hero-title">Badges & Wings</h1>
            <p className="admin-badges-hero-desc">
              Recognize pilots with badges they wear on their profile. Create new
              achievements anytime.
            </p>
          </div>
          {canManage ? (
            <button
              type="button"
              className="admin-badges-btn-gold"
              onClick={() => {
                setModalError(null);
                setEditingBadge(null);
                setModalMode("create");
              }}
            >
              NEW WING
            </button>
          ) : null}
        </div>
      </section>

      {error ? (
        <p className="admin-badges-banner admin-badges-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="admin-badges-banner admin-badges-banner--success" role="status">
          {success}
        </p>
      ) : null}

      {data?.usingMockBadges ? (
        <p className="admin-badges-banner admin-badges-banner--info" role="status">
          Showing sample badge cards until wing definitions exist in the database.
        </p>
      ) : null}

      {stats ? (
        <section className="admin-badges-stats-grid" aria-label="Badge metrics">
          <article className="admin-badges-stat-card">
            <p className="admin-badges-stat-label">TOTAL BADGES</p>
            <p className="admin-badges-stat-value">{stats.totalBadges}</p>
          </article>
          <article className="admin-badges-stat-card">
            <p className="admin-badges-stat-label">AWARDED (30D)</p>
            <p className="admin-badges-stat-value">
              {stats.awarded30d.toLocaleString()}
            </p>
            <p
              className={`admin-badges-stat-sub${
                isPositiveGrowth(stats.awarded30dSubtext)
                  ? " admin-badges-stat-sub--success"
                  : ""
              }`}
            >
              {stats.awarded30dSubtext}
            </p>
          </article>
          <article className="admin-badges-stat-card">
            <p className="admin-badges-stat-label">MOST EARNED</p>
            <p className="admin-badges-stat-value admin-badges-stat-value--sm">
              {stats.mostEarnedTitle}
            </p>
            <p className="admin-badges-stat-sub">{stats.mostEarnedSubtext}</p>
          </article>
          <article className="admin-badges-stat-card">
            <p className="admin-badges-stat-label">RAREST</p>
            <p className="admin-badges-stat-value admin-badges-stat-value--sm">
              {stats.rarestTitle}
            </p>
            <p className="admin-badges-stat-sub">{stats.rarestSubtext}</p>
          </article>
        </section>
      ) : null}

      <section className="admin-badges-controls" aria-label="Badge filters">
        <input
          type="search"
          className="admin-badges-search"
          placeholder="Search badges…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="admin-badges-filter"
          value={rarityFilter}
          onChange={(event) =>
            setRarityFilter(event.target.value as BadgeRarity | "ALL")
          }
        >
          <option value="ALL">All rarities</option>
          <option value="COMMON">Common</option>
          <option value="UNCOMMON">Uncommon</option>
          <option value="RARE">Rare</option>
          <option value="EPIC">Epic</option>
          <option value="LEGENDARY">Legendary</option>
          <option value="MYTHIC">Mythic</option>
        </select>
        <select
          className="admin-badges-filter"
          value={activeFilter}
          onChange={(event) =>
            setActiveFilter(event.target.value as typeof activeFilter)
          }
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </section>

      <section className="admin-badges-grid" aria-label="Badge catalog">
        {filteredBadges.length === 0 ? (
          <p className="admin-badges-empty">No badges match your filters.</p>
        ) : (
          filteredBadges.map((badge) => (
            <AdminBadgeCard
              key={badge.id}
              badge={badge}
              canManage={canManage}
              onEdit={(item) => {
                setModalError(null);
                setEditingBadge(item);
                setModalMode("edit");
              }}
              onAssign={(item) => {
                setModalError(null);
                setAssignBadge(item);
              }}
            />
          ))
        )}
      </section>

      {recentAwards.length > 0 ? (
        <section className="admin-badges-recent" aria-label="Recent awards">
          <h2 className="admin-badges-recent-title">RECENT AWARDS</h2>
          <ul className="admin-badges-recent-list">
            {recentAwards.slice(0, 8).map((award: AdminPilotWingDto) => (
              <li key={award.id} className="admin-badges-recent-item">
                <span className="admin-badges-recent-wing">{award.title}</span>
                <span className="admin-badges-recent-pilot">
                  {award.pilot.displayName}
                </span>
                <span className="admin-badges-recent-date">
                  {new Date(award.earnedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {modalMode ? (
        <AdminBadgeModal
          mode={modalMode}
          badge={editingBadge}
          saving={saving}
          error={modalError}
          onClose={() => {
            setModalMode(null);
            setEditingBadge(null);
            setModalError(null);
          }}
          onSave={handleSaveBadge}
        />
      ) : null}

      {assignBadge ? (
        <AdminBadgeAssignModal
          badge={assignBadge}
          pilots={data?.pilots ?? []}
          initialPilotId={preselectedPilotId || undefined}
          saving={assigning}
          error={modalError}
          onClose={() => {
            setAssignBadge(null);
            setModalError(null);
          }}
          onAssign={handleAssignBadge}
        />
      ) : null}
    </div>
  );
}
