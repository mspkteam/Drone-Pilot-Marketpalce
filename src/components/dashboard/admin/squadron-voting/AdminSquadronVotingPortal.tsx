"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { SquadronBallotDto } from "@/lib/admin/squadron-voting";

export function AdminSquadronVotingPortal() {
  const [ballots, setBallots] = useState<SquadronBallotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disputeId, setDisputeId] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/squadron-voting");
      const json = (await res.json()) as {
        ballots?: SquadronBallotDto[];
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to load ballots.");
        return;
      }
      setBallots(json.ballots ?? []);
    } catch {
      setError("Failed to load ballots.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function openBallot() {
    if (!disputeId.trim()) return;
    const res = await fetch("/api/admin/squadron-voting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "open", disputeId: disputeId.trim() }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Failed to open ballot.");
      return;
    }
    setDisputeId("");
    await load();
  }

  async function castVote(ballotId: string, vote: "approve" | "reject" | "abstain") {
    const res = await fetch("/api/admin/squadron-voting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "vote", ballotId, vote }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Failed to cast vote.");
      return;
    }
    await load();
  }

  async function closeBallot(ballotId: string) {
    if (!recommendation.trim()) {
      setError("Recommendation is required to close a ballot.");
      return;
    }
    const res = await fetch("/api/admin/squadron-voting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "close",
        ballotId,
        recommendation: recommendation.trim(),
      }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Failed to close ballot.");
      return;
    }
    setRecommendation("");
    await load();
  }

  return (
    <div className="admin-squadron-page">
      <section
        className="admin-squadron-hero admin-ops-bracket-card"
        aria-label="Squadron voting"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-squadron-hero-copy">
          <p className="admin-ops-eyebrow">SQUADRON VOTING</p>
          <h1 className="admin-squadron-hero-title">Squadron Voting</h1>
          <p className="admin-squadron-hero-desc">
            Escalate disputed missions to the officer squadron for collective review
            and resolution recommendations.
          </p>
        </div>
      </section>

      {error ? (
        <p className="admin-squadron-banner admin-squadron-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="admin-squadron-panel admin-ops-bracket-card">
        <h2 className="admin-squadron-panel-title">OPEN BALLOT</h2>
        <div className="admin-squadron-open-row">
          <input
            value={disputeId}
            onChange={(e) => setDisputeId(e.target.value)}
            placeholder="Dispute ID"
            aria-label="Dispute ID"
          />
          <button type="button" className="admin-squadron-link" onClick={() => void openBallot()}>
            Open ballot
          </button>
        </div>
        <p className="admin-squadron-panel-copy">
          Need a dispute ID?{" "}
          <Link href="/dashboard/admin/disputes" className="admin-squadron-link">
            Open Disputes Center
          </Link>
        </p>
      </section>

      <section className="admin-squadron-panel admin-ops-bracket-card">
        <h2 className="admin-squadron-panel-title">ACTIVE BALLOTS</h2>
        {loading ? (
          <p className="admin-squadron-panel-copy">Loading ballots…</p>
        ) : ballots.length === 0 ? (
          <p className="admin-squadron-panel-copy">No squadron ballots yet.</p>
        ) : (
          <ul className="admin-squadron-ballot-list">
            {ballots.map((ballot) => (
              <li key={ballot.id} className="admin-squadron-ballot-item">
                <div>
                  <p className="admin-squadron-ballot-title">
                    {ballot.disputeDisplayId} · {ballot.missionTitle}
                  </p>
                  <p className="admin-squadron-panel-copy">
                    Status: {ballot.status} · Votes: {ballot.votes.length}
                    {ballot.recommendation
                      ? ` · Recommendation: ${ballot.recommendation}`
                      : ""}
                  </p>
                </div>
                {ballot.status === "open" ? (
                  <div className="admin-squadron-ballot-actions">
                    <button
                      type="button"
                      className="admin-squadron-link"
                      onClick={() => void castVote(ballot.id, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="admin-squadron-link"
                      onClick={() => void castVote(ballot.id, "reject")}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="admin-squadron-link"
                      onClick={() => void castVote(ballot.id, "abstain")}
                    >
                      Abstain
                    </button>
                    <input
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      placeholder="Close recommendation"
                      aria-label="Close recommendation"
                    />
                    <button
                      type="button"
                      className="admin-squadron-link"
                      onClick={() => void closeBallot(ballot.id)}
                    >
                      Close ballot
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
