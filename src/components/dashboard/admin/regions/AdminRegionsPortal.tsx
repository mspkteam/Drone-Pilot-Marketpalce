"use client";

import { useCallback, useEffect, useState } from "react";
import type { OperatingRegionDto } from "@/lib/admin/regions";

export function AdminRegionsPortal() {
  const [regions, setRegions] = useState<OperatingRegionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/regions");
      const json = (await res.json()) as {
        regions?: OperatingRegionDto[];
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to load regions.");
        return;
      }
      setRegions(json.regions ?? []);
    } catch {
      setError("Failed to load regions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);
    const res = await fetch("/api/admin/regions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code, timezone }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Failed to create region.");
      return;
    }
    setName("");
    setCode("");
    setTimezone("UTC");
    setNotice("Region created.");
    await load();
  }

  async function toggleActive(region: OperatingRegionDto) {
    const res = await fetch("/api/admin/regions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: region.id, isActive: !region.isActive }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Failed to update region.");
      return;
    }
    await load();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/regions?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Failed to delete region.");
      return;
    }
    setNotice("Region removed.");
    await load();
  }

  return (
    <div className="admin-regions-page">
      <section
        className="admin-regions-hero admin-ops-bracket-card"
        aria-label="Regions"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-regions-hero-copy">
          <p className="admin-ops-eyebrow">REGIONS</p>
          <h1 className="admin-regions-hero-title">Regional Coverage</h1>
          <p className="admin-regions-hero-desc">
            Manage operating regions, timezone defaults, and marketplace availability
            by geography.
          </p>
        </div>
      </section>

      {error ? (
        <p className="admin-regions-banner admin-regions-banner--error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="admin-regions-banner admin-regions-banner--info" role="status">
          {notice}
        </p>
      ) : null}

      <section className="admin-regions-panel admin-ops-bracket-card">
        <h2 className="admin-regions-panel-title">REGION DIRECTORY</h2>
        {loading ? (
          <p className="admin-regions-panel-copy">Loading regions…</p>
        ) : (
          <ul className="admin-regions-list">
            {regions.map((region) => (
              <li key={region.id} className="admin-regions-list-item">
                <div>
                  <p className="admin-regions-list-name">{region.name}</p>
                  <p className="admin-regions-list-meta">
                    {region.code} · {region.timezone} ·{" "}
                    {region.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="admin-regions-list-actions">
                  <button
                    type="button"
                    className="admin-regions-link"
                    onClick={() => void toggleActive(region)}
                  >
                    {region.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    className="admin-regions-link admin-regions-link--danger"
                    onClick={() => void handleDelete(region.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form className="admin-regions-form" onSubmit={(e) => void handleCreate(e)}>
          <h3 className="admin-regions-form-title">Add region</h3>
          <div className="admin-regions-form-grid">
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label>
              Code
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </label>
            <label>
              Timezone
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </label>
          </div>
          <button type="submit" className="admin-regions-link">
            Create region
          </button>
        </form>
      </section>
    </div>
  );
}
