import { ExternalLink, CheckCircle2 } from "lucide-react";
import type { Submission } from "@/types";

interface Props {
  submission: Submission;
  reward: number;
  finalized: boolean;
  onClaim: (id: string) => void;
  claimPending?: boolean;
}

const AVATAR_COLORS = [
  "#b8fe66","#a78bfa","#f59e0b","#38bdf8","#f472b6","#34d399","#fb923c",
];

function avatarColor(address: string) {
  const code = address.charCodeAt(2) + address.charCodeAt(3);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export function SubmissionRow({
  submission,
  reward,
  finalized,
  onClaim,
  claimPending = false,
}: Props) {
  const initials = submission.creator.slice(2, 4).toUpperCase();
  const bg = avatarColor(submission.creator);

  return (
    <tr>
      {/* Creator */}
      <td>
        <div className="creator-cell">
          <div className="creator-avatar" style={{ background: bg }}>
            {initials}
          </div>
          <span className="creator-address">{submission.creator}</span>
        </div>
      </td>

      {/* Tweet link */}
      <td>
        <a
          href={submission.tweetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="tweet-link"
          title={submission.tweetLink}
        >
          {submission.tweetLink.replace("https://x.com/", "@").slice(0, 24)}…
          <ExternalLink size={11} />
        </a>
      </td>

      {/* Views input */}
      <td>
        <span className="reward-value">{submission.views.toLocaleString()}</span>
      </td>

      {/* Reward */}
      <td>
        <span className="reward-value">
          {reward > 0 ? `${reward.toFixed(6)} ETH` : "—"}
        </span>
      </td>

      {/* Claim */}
      <td>
        {finalized ? (
          submission.claimed ? (
            <button className="claim-btn claim-btn-claimed" disabled>
              <CheckCircle2 size={13} /> Claimed
            </button>
          ) : (
            <button
              className="claim-btn claim-btn-ready"
              disabled={claimPending}
              onClick={() => onClaim(submission.id)}
            >
              {claimPending ? "Claiming..." : "Claim Reward"}
            </button>
          )
        ) : (
          <span style={{ fontSize: 12, color: "var(--gray-400)" }}>—</span>
        )}
      </td>
    </tr>
  );
}
