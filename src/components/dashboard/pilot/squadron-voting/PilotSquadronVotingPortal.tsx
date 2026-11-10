"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  SquadronBallotDto,
  SquadronVotingMetrics,
} from "@/lib/admin/squadron-voting";
import type { PilotSquadronEvidence } from "@/lib/pilot/squadron-voting";

const EMPTY_METRICS: SquadronVotingMetrics = {
  squadronMembers: 0,
  activePolls: 0,
  avgTurnoutPct: 0,
  decisions30d: 0,
};

type PilotSquadronVotingPortalProps = {
  initialBallotId?: string | null;
};

export function PilotSquadronVotingPortal({
  initialBallotId = null,
}: PilotSquadronVotingPortalProps) {
  const [ballots, setBallots] = useState<SquadronBallotDto[]>([]);
  const [metrics, setMetrics] = useState<SquadronVotingMetrics>(EMPTY_METRICS);
  const [eligible, setEligible] = useState(true);
  const [gradeLabel, setGradeLabel] = useState("A-4+");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<PilotSquadronEvidence | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const openedInitialBallot = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pilot/squadron-voting");
      const json = (await res.json()) as {
        ballots?: SquadronBallotDto[];
        metrics?: SquadronVotingMetrics;
        eligible?: boolean;
        gradeLabel?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to load squadron votes.");
        return;
      }
      setBallots(json.ballots ?? []);
      setMetrics(json.metrics ?? EMPTY_METRICS);
      setEligible(json.eligible !== false);
      setGradeLabel(json.gradeLabel ?? "A-4+");
    } catch {
      setError("Failed to load squadron votes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openBallots = useMemo(
    () => ballots.filter((ballot) => ballot.status === "open"),
    [ballots],
  );
  const closedBallots = useMemo(
    () => ballots.filter((ballot) => ballot.status === "closed"),
    [ballots],
  );

  async function castVote(ballotId: string, vote: "approve" | "reject") {
    setPendingId(ballotId);
    setError(null);
    try {
      const res = await fetch("/api/pilot/squadron-voting", {
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
    } catch {
      setError("Failed to cast vote.");
    } finally {
      setPendingId(null);
    }
  }

  const openEvidence = useCallback(async (ballotId: string) => {
    setEvidenceLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/pilot/squadron-voting?evidence=${encodeURIComponent(ballotId)}`,
      );
      const json = (await res.json()) as {
        evidence?: PilotSquadronEvidence;
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to load evidence.");
        return;
      }
      setEvidence(json.evidence ?? null);
    } catch {
      setError("Failed to load evidence.");
    } finally {
      setEvidenceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialBallotId || !eligible || loading || openedInitialBallot.current) {
      return;
    }
    openedInitialBallot.current = true;
    void openEvidence(initialBallotId);
  }, [initialBallotId, eligible, loading, openEvidence]);

  if (!eligible && !loading) {
    return (
      <div className="admin-squadron-page">
        <section className="admin-squadron-hero admin-ops-bracket-card">
          <div className="admin-ops-hero-glow" aria-hidden />
          <div className="admin-squadron-hero-copy">
            <p className="admin-ops-eyebrow">Peer Moderation</p>
            <h1 className="admin-squadron-hero-title">Squadron Voting</h1>
            <p className="admin-squadron-hero-desc">
              Squadron ballots are open to active members at grade A-4 and above.
              Your current grade is <strong>{gradeLabel}</strong>. Upgrade via
              Membership to join peer dispute votes.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="admin-squadron-page">
      <section
        className="admin-squadron-hero admin-ops-bracket-card"
        aria-label="Squadron voting"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-squadron-hero-copy">
          <p className="admin-ops-eyebrow">Dispute Review Voting</p>
          <h1 className="admin-squadron-hero-title">Squadron Voting</h1>
          <p className="admin-squadron-hero-desc">
            Review escalated disputes and cast your peer vote. Side with the
            client or the pilot. Parties to a case cannot vote on their own
            ballot.
          </p>
        </div>
      </section>

      <div className="admin-squadron-stats">
        <article className="admin-squadron-stat">
          <div className="admin-squadron-stat-head">
            <p className="admin-squadron-stat-label">Squadron members</p>
          </div>
          <p className="admin-squadron-stat-value">{metrics.squadronMembers}</p>
          <p className="admin-squadron-stat-sub">A-4 and above</p>
        </article>
        <article className="admin-squadron-stat">
          <div className="admin-squadron-stat-head">
            <p className="admin-squadron-stat-label">Active polls</p>
          </div>
          <p className="admin-squadron-stat-value">{metrics.activePolls}</p>
          <p className="admin-squadron-stat-sub">Requiring decision</p>
        </article>
        <article className="admin-squadron-stat">
          <div className="admin-squadron-stat-head">
            <p className="admin-squadron-stat-label">Avg. turnout</p>
          </div>
          <p className="admin-squadron-stat-value">{metrics.avgTurnoutPct}%</p>
          <p className="admin-squadron-stat-sub">Past 30 days</p>
        </article>
        <article className="admin-squadron-stat">
          <div className="admin-squadron-stat-head">
            <p className="admin-squadron-stat-label">Decisions (30d)</p>
          </div>
          <p className="admin-squadron-stat-value">{metrics.decisions30d}</p>
          <p className="admin-squadron-stat-sub">Confirmed rulings</p>
        </article>
      </div>

      {error ? (
        <p className="admin-squadron-banner admin-squadron-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {evidence || evidenceLoading ? (
        <section className="pilot-squadron-evidence" aria-label="Case evidence">
          <div className="pilot-squadron-evidence-head">
            <h2 className="pilot-squadron-evidence-title">Case evidence</h2>
            <button
              type="button"
              className="ras-btn-outline"
              onClick={() => setEvidence(null)}
            >
              Close
            </button>
          </div>
          {evidenceLoading || !evidence ? (
            <p className="admin-squadron-empty">Loading evidence…</p>
          ) : (
            <>
              <p className="pilot-squadron-evidence-meta">
                <strong>{evidence.missionTitle}</strong> · {evidence.clientName} vs{" "}
                {evidence.pilotName}
              </p>
              <p className="pilot-squadron-evidence-reason">{evidence.reason}</p>
              {evidence.entries.length === 0 ? (
                <p className="admin-squadron-empty">
                  No evidence comments posted yet. Use the case summary above.
                </p>
              ) : (
                <ul className="pilot-squadron-evidence-list">
                  {evidence.entries.map((entry) => (
                    <li key={entry.id} className="pilot-squadron-evidence-item">
                      <p className="pilot-squadron-evidence-author">
                        {entry.authorLabel} ·{" "}
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                      <p className="pilot-squadron-evidence-body">{entry.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      ) : null}

      {loading ? (
        <p className="admin-squadron-empty">Loading squadron votes…</p>
      ) : openBallots.length === 0 ? (
        <p className="admin-squadron-empty">
          No active squadron polls right now. When ops escalates a dispute, open
          ballots appear here for A-4+ peers to vote.
        </p>
      ) : (
        <ul className="admin-squadron-vote-list">
          {openBallots.map((ballot, index) => (
            <li key={ballot.id}>
              <PilotVoteCard
                ballot={ballot}
                accent={index === 0}
                busy={pendingId === ballot.id}
                canVote={eligible}
                onVote={castVote}
                onEvidence={() => void openEvidence(ballot.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {closedBallots.length > 0 ? (
        <section className="admin-squadron-closed">
          <h2 className="admin-squadron-closed-title">Closed polls</h2>
          <ul className="admin-squadron-vote-list">
            {closedBallots.map((ballot) => (
              <li key={ballot.id}>
                <PilotVoteCard
                  ballot={ballot}
                  accent={false}
                  busy={false}
                  canVote={false}
                  onVote={castVote}
                  onEvidence={() => void openEvidence(ballot.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

type PilotVoteCardProps = {
  ballot: SquadronBallotDto;
  accent: boolean;
  busy: boolean;
  canVote: boolean;
  onVote: (ballotId: string, vote: "approve" | "reject") => void;
  onEvidence: () => void;
};

function PilotVoteCard({
  ballot,
  accent,
  busy,
  canVote,
  onVote,
  onEvidence,
}: PilotVoteCardProps) {
  const open = ballot.status === "open";
  const officerLabel =
    ballot.squadronMembers === 1 ? "voting officer has" : "voting officers have";

  return (
    <article
      className={`admin-squadron-vote-card${accent && open ? " admin-squadron-vote-card--accent" : ""}`}
    >
      <div className="admin-squadron-vote-top">
        <div>
          <div className="admin-squadron-vote-ids">
            <h3 className="admin-squadron-vote-id">{ballot.voteDisplayId}</h3>
            <span className="admin-squadron-vote-dsp">{ballot.disputeDisplayId}</span>
          </div>
          <p className="admin-squadron-vote-reason">
            {ballot.missionTitle} — {ballot.reason}
          </p>
          <p className="pilot-squadron-parties">
            {ballot.clientName} vs {ballot.pilotName}
          </p>
        </div>
        <p
          className={`admin-squadron-time${ballot.urgent ? " admin-squadron-time--urgent" : ""}`}
        >
          {ballot.timeLeftLabel}
        </p>
      </div>

      <div className="admin-squadron-vote-body">
        <div className="admin-squadron-vote-sides">
          <button
            type="button"
            className={`admin-squadron-side${ballot.viewerVote === "approve" ? " admin-squadron-side--picked" : ""}`}
            disabled={!open || !canVote || busy}
            onClick={() => onVote(ballot.id, "approve")}
          >
            <span className="admin-squadron-side-row">
              <span>Side with client</span>
              <span>
                {ballot.clientVotes}
                <span className="admin-squadron-side-meta">
                  {` votes • ${ballot.clientPct}%`}
                </span>
              </span>
            </span>
            <span className="admin-squadron-track" aria-hidden>
              <span
                className="admin-squadron-fill admin-squadron-fill--client"
                style={{ width: `${ballot.clientPct}%` }}
              />
            </span>
          </button>
          <button
            type="button"
            className={`admin-squadron-side${ballot.viewerVote === "reject" ? " admin-squadron-side--picked" : ""}`}
            disabled={!open || !canVote || busy}
            onClick={() => onVote(ballot.id, "reject")}
          >
            <span className="admin-squadron-side-row">
              <span>Side with Pilot</span>
              <span>
                {ballot.pilotVotes}
                <span className="admin-squadron-side-meta">
                  {` votes • ${ballot.pilotPct}%`}
                </span>
              </span>
            </span>
            <span className="admin-squadron-track" aria-hidden>
              <span
                className="admin-squadron-fill admin-squadron-fill--pilot"
                style={{ width: `${ballot.pilotPct}%` }}
              />
            </span>
          </button>
          <p className="admin-squadron-turnout">
            {ballot.votedCount} of {ballot.squadronMembers} {officerLabel} voted (
            {ballot.turnoutPct}% turnout)
          </p>
          {ballot.viewerVote ? (
            <p className="admin-squadron-recommendation">
              Your vote:{" "}
              {ballot.viewerVote === "approve"
                ? "client"
                : ballot.viewerVote === "reject"
                  ? "pilot"
                  : "abstain"}
            </p>
          ) : null}
          {ballot.recommendation ? (
            <p className="admin-squadron-recommendation">{ballot.recommendation}</p>
          ) : null}
        </div>

        <div className="admin-squadron-vote-actions">
          <button
            type="button"
            className="admin-squadron-action admin-squadron-action--gold"
            onClick={onEvidence}
          >
            View evidence
          </button>
        </div>
      </div>
    </article>
  );
}
