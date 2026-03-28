import { Shuffle, Lock, CheckCircle } from "lucide-react";

interface Props {
  finalized: boolean;
  onSimulateViews: () => void;
  onFinalize: () => void;
}

export function ActionBar({ finalized, onSimulateViews, onFinalize }: Props) {
  return (
    <div className="action-bar">
      <div className="action-bar-left">
        {!finalized ? (
          <>
            <button
              className="btn btn-outline btn-sm"
              onClick={onSimulateViews}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                padding: "8px 16px",
                borderRadius: 10,
                border: "1.5px solid var(--border)",
                background: "var(--white)",
                color: "var(--black)",
                cursor: "pointer",
                transition: "all 150ms",
              }}
            >
              <Shuffle size={14} />
              Simulate Fetch Views
            </button>

            <button
              onClick={onFinalize}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                padding: "8px 16px",
                borderRadius: 10,
                border: "1.5px solid var(--black)",
                background: "var(--black)",
                color: "var(--white)",
                cursor: "pointer",
                transition: "all 150ms",
              }}
            >
              <Lock size={14} />
              Finalize Distribution
            </button>
          </>
        ) : (
          <div className="finalized-banner">
            <CheckCircle size={16} />
            Distribution finalized — rewards locked and ready to claim.
          </div>
        )}
      </div>

      {!finalized && (
        <p className="action-bar-status">
          Simulate views to auto-fill realistic numbers, then finalize to lock rewards.
        </p>
      )}
    </div>
  );
}
