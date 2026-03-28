import type { Submission } from "@/types";
import { SubmissionRow } from "./SubmissionRow";

interface Props {
  submissions: Submission[];
  totalBudget: number;
  finalized: boolean;
  onViewsChange: (id: string, views: number) => void;
  onClaim: (id: string) => void;
}

export function SubmissionList({
  submissions,
  totalBudget,
  finalized,
  onViewsChange,
  onClaim,
}: Props) {
  const totalViews = submissions.reduce((a, s) => a + s.views, 0);

  function calcReward(views: number) {
    if (totalViews === 0) return 0;
    return (views / totalViews) * totalBudget;
  }

  return (
    <div className="submissions-panel">
      <div className="submissions-panel-header">
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--black)" }}>
          Submissions ({submissions.length})
        </span>
        <span style={{ fontSize: 12, color: "var(--gray-500)" }}>
          Total views: {totalViews.toLocaleString()}
        </span>
      </div>

      {submissions.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "var(--gray-400)",
            fontSize: 14,
          }}
        >
          No submissions yet. Add the first one below.
        </div>
      ) : (
        <>
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Creator</th>
                <th>Tweet Link</th>
                <th>Views</th>
                <th>Reward</th>
                <th>Claim</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <SubmissionRow
                  key={s.id}
                  submission={s}
                  reward={calcReward(s.views)}
                  finalized={finalized}
                  onViewsChange={onViewsChange}
                  onClaim={onClaim}
                />
              ))}
            </tbody>
          </table>

          {/* Totals row */}
          <div className="submissions-total-row">
            <span className="submissions-total-label">
              Budget allocated: {totalBudget} ETH
            </span>
            <span className="submissions-total-label">
              Distributed:{" "}
              {submissions
                .reduce((a, s) => a + calcReward(s.views), 0)
                .toFixed(6)}{" "}
              ETH
            </span>
          </div>
        </>
      )}
    </div>
  );
}
