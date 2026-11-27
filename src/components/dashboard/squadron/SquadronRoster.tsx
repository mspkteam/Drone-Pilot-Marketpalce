import type { SquadronBallotDto } from "@/lib/admin/squadron-voting";

type SquadronRosterProps = {
  ballot: Pick<
    SquadronBallotDto,
    "roster" | "notVotedCount" | "minVotes" | "minVotesMet" | "votedCount" | "status"
  >;
};

/** Voted / not-voted roster — rendered for admins and Squadron Commanders only. */
export function SquadronRoster({ ballot }: SquadronRosterProps) {
  if (!ballot.roster) return null;

  return (
    <div className="admin-squadron-roster">
      <p className="admin-squadron-turnout">
        Minimum {ballot.minVotes} votes ·{" "}
        {ballot.minVotesMet
          ? "minimum reached"
          : `${Math.max(ballot.minVotes - ballot.votedCount, 0)} more needed — otherwise Super Admin decides`}
      </p>
      <details>
        <summary className="admin-squadron-roster-summary">
          Roster: {ballot.votedCount} voted · {ballot.notVotedCount ?? 0} not voted
        </summary>
        {ballot.roster.length === 0 ? (
          <p className="admin-squadron-empty">No eligible commanders.</p>
        ) : (
          <ul className="admin-squadron-roster-list">
            {ballot.roster.map((entry) => (
              <li
                key={entry.userId}
                className={`admin-squadron-roster-item${entry.voted ? " admin-squadron-roster-item--voted" : ""}`}
              >
                <span>{entry.name}</span>
                <span>{entry.voted ? "Voted" : "Not voted"}</span>
              </li>
            ))}
          </ul>
        )}
      </details>
    </div>
  );
}
