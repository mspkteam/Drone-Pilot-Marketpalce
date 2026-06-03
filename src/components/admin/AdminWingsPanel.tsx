"use client";

import { useCallback, useEffect, useState } from "react";
import { WingBadge } from "@/components/wings/WingBadge";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";
import { getWingAutoRuleLabel, getWingCategoryLabel } from "@/lib/wings/status";
import type { AdminPilotWingDto, WingDefinitionDto } from "@/types/wing";
import { WING_AUTO_RULES, WING_CATEGORIES } from "@/types/wing";

type PilotOption = { id: string; displayName: string; email: string };

export function AdminWingsPanel() {
  const [definitions, setDefinitions] = useState<WingDefinitionDto[]>([]);
  const [recentAwards, setRecentAwards] = useState<AdminPilotWingDto[]>([]);
  const [pilots, setPilots] = useState<PilotOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("milestone");
  const [autoRule, setAutoRule] = useState("manual_only");
  const [iconLabel, setIconLabel] = useState("");
  const [threshold, setThreshold] = useState("");
  const [ruleParam, setRuleParam] = useState("");
  const [creating, setCreating] = useState(false);

  const [assignPilotId, setAssignPilotId] = useState("");
  const [assignWingId, setAssignWingId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/wings");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load wings.");
        setDefinitions([]);
        setRecentAwards([]);
      } else {
        setDefinitions(data.definitions ?? []);
        setRecentAwards(data.recentAwards ?? []);
        setPilots(data.pilots ?? []);
      }
    } catch {
      setError("Failed to load wings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createDefinition(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/wing-definitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          autoRule,
          iconLabel: iconLabel || null,
          ruleParam: ruleParam || null,
          threshold: threshold ? parseInt(threshold, 10) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Create failed.");
      } else {
        setSuccess("Wing definition created.");
        setTitle("");
        setDescription("");
        await load();
      }
    } catch {
      setError("Create failed.");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(def: WingDefinitionDto) {
    setError(null);
    const res = await fetch(`/api/admin/wing-definitions/${def.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !def.isActive }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Update failed.");
    } else {
      await load();
    }
  }

  async function assignWing(e: React.FormEvent) {
    e.preventDefault();
    setAssigning(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/wings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilotProfileId: assignPilotId,
          wingDefinitionId: assignWingId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Assign failed.");
      } else {
        setSuccess(
          data.created
            ? `Awarded "${data.wing.title}" to pilot.`
            : "Pilot already has this wing.",
        );
        await load();
      }
    } catch {
      setError("Assign failed.");
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading wings…</p>;
  }

  return (
    <div className="space-y-10">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-700" role="status">
          {success}
        </p>
      ) : null}

      <section className="rounded-lg border border-border bg-surface-elevated p-5">
        <h2 className="font-semibold">Manual award</h2>
        <form onSubmit={(e) => void assignWing(e)} className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Pilot" htmlFor="assign-pilot">
            <select
              id="assign-pilot"
              className={inputClassName}
              value={assignPilotId}
              onChange={(e) => setAssignPilotId(e.target.value)}
              required
            >
              <option value="">Select pilot…</option>
              {pilots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} ({p.email})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Wing" htmlFor="assign-wing">
            <select
              id="assign-wing"
              className={inputClassName}
              value={assignWingId}
              onChange={(e) => setAssignWingId(e.target.value)}
              required
            >
              <option value="">Select wing…</option>
              {definitions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.awardedCount} awarded)
                </option>
              ))}
            </select>
          </FormField>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={assigning}>
              {assigning ? "Awarding…" : "Award wing"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-border bg-surface-elevated p-5">
        <h2 className="font-semibold">Create wing definition</h2>
        <form
          onSubmit={(e) => void createDefinition(e)}
          className="mt-4 space-y-4"
        >
          <FormField label="Title" htmlFor="wing-title" required>
            <input
              id="wing-title"
              className={inputClassName}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Description" htmlFor="wing-desc" required>
            <textarea
              id="wing-desc"
              className={inputClassName}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Category" htmlFor="wing-cat">
              <select
                id="wing-cat"
                className={inputClassName}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {WING_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {getWingCategoryLabel(c)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Icon label" htmlFor="wing-icon">
              <input
                id="wing-icon"
                className={inputClassName}
                value={iconLabel}
                onChange={(e) => setIconLabel(e.target.value)}
                placeholder="★"
                maxLength={4}
              />
            </FormField>
            <FormField label="Auto-assign rule" htmlFor="wing-rule">
              <select
                id="wing-rule"
                className={inputClassName}
                value={autoRule}
                onChange={(e) => setAutoRule(e.target.value)}
              >
                {WING_AUTO_RULES.map((r) => (
                  <option key={r} value={r}>
                    {getWingAutoRuleLabel(r)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Threshold (count rules)" htmlFor="wing-threshold">
              <input
                id="wing-threshold"
                type="number"
                min={1}
                className={inputClassName}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </FormField>
            <FormField label="Rule param (e.g. license)" htmlFor="wing-param">
              <input
                id="wing-param"
                className={inputClassName}
                value={ruleParam}
                onChange={(e) => setRuleParam(e.target.value)}
              />
            </FormField>
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? "Creating…" : "Create definition"}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold">Wing definitions</h2>
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
          {definitions.map((d) => (
            <li key={d.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
              <div>
                <WingBadge
                  title={d.title}
                  iconLabel={d.iconLabel}
                  category={d.category}
                />
                <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {d.code} · {getWingAutoRuleLabel(d.autoRule)} · {d.awardedCount}{" "}
                  awarded
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => void toggleActive(d)}
              >
                {d.isActive ? "Deactivate" : "Activate"}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold">Recent awards</h2>
        {recentAwards.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No awards yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
            {recentAwards.map((a) => (
              <li key={a.id} className="p-4 text-sm">
                <span className="font-medium">{a.pilot.displayName}</span> earned{" "}
                <WingBadge
                  title={a.title}
                  iconLabel={a.iconLabel}
                  category={a.category}
                />{" "}
                <span className="text-muted-foreground">
                  · {new Date(a.earnedAt).toLocaleString()} · {a.source}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
