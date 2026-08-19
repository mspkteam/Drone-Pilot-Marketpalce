"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type {
  SquadronBallotDto,
  SquadronVotingMetrics,
} from "@/lib/admin/squadron-voting";
import { useModeratorPermissions } from "@/contexts/ModeratorPermissionsContext";

const EMPTY_METRICS: SquadronVotingMetrics = {
  squadronMembers: 0,
  activePolls: 0,
  avgTurnoutPct: 0,
  decisions30d: 0,
};

export function AdminSquadronVotingPortal() {
  const [ballots, setBallots] = useState<SquadronBallotDto[]>([]);
  const [metrics, setMetrics] = useState<SquadronVotingMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { canPerform } = useModeratorPermissions();
  const canVote = canPerform("disputes", "recommend");
  const canResolve = canPerform("disputes", "resolve");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/squadron-voting");
      const json = (await res.json()) as {
        ballots?: SquadronBallotDto[];
        metrics?: SquadronVotingMetrics;
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to load squadron votes.");
        return;
      }
      setBallots(json.ballots ?? []);
      setMetrics(json.metrics ?? EMPTY_METRICS);
    } catch {
      setError("Failed to load squadron votes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openBallots = ballots.filter((ballot) => ballot.status === "open");
  const closedBallots = ballots.filter((ballot) => ballot.status === "closed");

  async function castVote(ballotId: string, vote: "approve" | "reject") {
    setPendingId(ballotId);
    setError(null);
    try {
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
    } catch {
      setError("Failed to cast vote.");
    } finally {
      setPendingId(null);
    }
  }

  async function closeEarly(ballotId: string) {
    setPendingId(ballotId);
    setError(null);
    try {
      const res = await fetch("/api/admin/squadron-voting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close", ballotId }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to close ballot.");
        return;
      }
      await load();
    } catch {
      setError("Failed to close ballot.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="admin-squadron-page">
      <section
        className="admin-squadron-hero admin-ops-bracket-card"
        aria-label="Peer moderation"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-squadron-hero-copy">
          <p className="admin-ops-eyebrow">Dispute Review Voting</p>
          <h1 className="admin-squadron-hero-title">Peer Moderation</h1>
          <p className="admin-squadron-hero-desc">
            Leadership reviews disputed contracts. Majority vote determines the
            final outcome.
          </p>
        </div>
      </section>

      <div className="admin-squadron-stats">
        <article className="admin-squadron-stat">
          <div className="admin-squadron-stat-head">
            <p className="admin-squadron-stat-label">Squadron members</p>
            <span className="admin-squadron-stat-icon" aria-hidden>
              <img src="/icons/admin-squadron/stat-members.svg" alt="" />
            </span>
          </div>
          <p className="admin-squadron-stat-value">{metrics.squadronMembers}</p>
          <p className="admin-squadron-stat-sub">A-4 and above</p>
          <div className="admin-squadron-stat-bar" aria-hidden>
            <span style={{ width: "85%" }} />
          </div>
        </article>
        <article className="admin-squadron-stat">
          <div className="admin-squadron-stat-head">
            <p className="admin-squadron-stat-label">Active polls</p>
            <span className="admin-squadron-stat-icon" aria-hidden>
              <img src="/icons/admin-squadron/stat-polls.svg" alt="" />
            </span>
          </div>
          <p className="admin-squadron-stat-value">{metrics.activePolls}</p>
          <p className="admin-squadron-stat-sub">Requiring decision</p>
          <div className="admin-squadron-stat-pips" aria-hidden>
            {Array.from({ length: 4 }, (_, index) => (
              <span
                key={index}
                className={
                  index < Math.min(metrics.activePolls, 4)
                    ? "admin-squadron-stat-pip admin-squadron-stat-pip--on"
                    : "admin-squadron-stat-pip"
                }
              />
            ))}
          </div>
        </article>
        <article className="admin-squadron-stat">
          <div className="admin-squadron-stat-head">
            <p className="admin-squadron-stat-label">Avg. turnout</p>
            <span className="admin-squadron-stat-icon" aria-hidden>
              <img src="/icons/admin-squadron/stat-turnout.svg" alt="" />
            </span>
          </div>
          <p className="admin-squadron-stat-value">{metrics.avgTurnoutPct}%</p>
          <p className="admin-squadron-stat-sub">Past 30 days</p>
          <div
            className="admin-squadron-stat-bar admin-squadron-stat-bar--success"
            aria-hidden
          >
            <span style={{ width: `${Math.min(metrics.avgTurnoutPct, 100)}%` }} />
          </div>
        </article>
        <article className="admin-squadron-stat">
          <div className="admin-squadron-stat-head">
            <p className="admin-squadron-stat-label">Decisions (30d)</p>
            <span className="admin-squadron-stat-icon" aria-hidden>
              <img src="/icons/admin-squadron/stat-decisions.svg" alt="" />
            </span>
          </div>
          <p className="admin-squadron-stat-value">{metrics.decisions30d}</p>
          <p className="admin-squadron-stat-sub">Confirmed rulings</p>
          <div className="admin-squadron-stat-segments" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        </article>
      </div>

      {error ? (
        <p className="admin-squadron-banner admin-squadron-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="admin-squadron-empty">Loading squadron votes…</p>
      ) : openBallots.length === 0 ? (
        <p className="admin-squadron-empty">
          No active polls. Send a case from{" "}
          <Link href="/dashboard/admin/disputes">Disputes</Link> to open a
          squadron vote.
        </p>
      ) : (
        <ul className="admin-squadron-vote-list">
          {openBallots.map((ballot, index) => (
            <li key={ballot.id}>
              <VoteCard
                ballot={ballot}
                accent={index === 0}
                busy={pendingId === ballot.id}
                canVote={canVote}
                canResolve={canResolve}
                onVote={castVote}
                onCloseEarly={closeEarly}
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
                <VoteCard
                  ballot={ballot}
                  accent={false}
                  busy={false}
                  canVote={false}
                  canResolve={canResolve}
                  onVote={castVote}
                  onCloseEarly={closeEarly}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

type VoteCardProps = {
  ballot: SquadronBallotDto;
  accent: boolean;
  busy: boolean;
  canVote: boolean;
  canResolve: boolean;
  onVote: (ballotId: string, vote: "approve" | "reject") => void;
  onCloseEarly: (ballotId: string) => void;
};

function VoteCard({
  ballot,
  accent,
  busy,
  canVote,
  canResolve,
  onVote,
  onCloseEarly,
}: VoteCardProps) {
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
          <p className="admin-squadron-vote-reason">{ballot.reason}</p>
        </div>
        <p
          className={`admin-squadron-time${ballot.urgent ? " admin-squadron-time--urgent" : ""}`}
        >
          <span className="admin-squadron-time-icon" aria-hidden>
            <img
              src={
                ballot.urgent
                  ? "/icons/admin-squadron/clock-urgent.svg"
                  : "/icons/admin-squadron/clock.svg"
              }
              alt=""
            />
          </span>
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
          {ballot.recommendation ? (
            <p className="admin-squadron-recommendation">{ballot.recommendation}</p>
          ) : null}
        </div>

        <div className="admin-squadron-vote-actions">
          {canResolve ? (
            <Link
              href={`${ballot.evidenceHref}?resolve=1`}
              className="admin-squadron-action admin-squadron-action--mute"
            >
              <span className="admin-squadron-action-icon" aria-hidden>
                <img src="/icons/admin-squadron/override.svg" alt="" />
              </span>
              Override
            </Link>
          ) : null}
          <Link
            href={ballot.evidenceHref}
            className="admin-squadron-action admin-squadron-action--gold"
          >
            <span className="admin-squadron-action-icon" aria-hidden>
              <img src="/icons/admin-squadron/evidence.svg" alt="" />
            </span>
            View evidence
          </Link>
          {open && canVote ? (
            <button
              type="button"
              className="admin-squadron-action admin-squadron-action--danger"
              disabled={busy}
              onClick={() => onCloseEarly(ballot.id)}
            >
              <span className="admin-squadron-action-icon" aria-hidden>
                <img src="/icons/admin-squadron/close-early.svg" alt="" />
              </span>
              Close early
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
