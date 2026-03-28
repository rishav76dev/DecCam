import { RefreshCw, Lock, CheckCircle } from "lucide-react";

interface Props {
  finalized: boolean;
  isSyncing?: boolean;
  disabled?: boolean;
  syncLabel?: string;
  helperText?: string;
  syncDisabledReason?: string;
  onSyncViews: () => void;
  onFinalize: () => void;
}

export function ActionBar({
  finalized,
  isSyncing = false,
  disabled = false,
  syncLabel = "Sync Views",
  helperText = "Fetch current X post views from the worker, then finalize the distribution on-chain.",
  syncDisabledReason,
  onSyncViews,
  onFinalize,
}: Props) {
  return (
    <div className="action-bar-shell">
      <div className="action-bar">
        <div className="action-bar-left">
          {!finalized ? (
            <>
              <button
                className="btn btn-outline btn-sm"
                onClick={onSyncViews}
                disabled={disabled || isSyncing}
                title={syncDisabledReason}
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
                  cursor: disabled || isSyncing ? "not-allowed" : "pointer",
                  opacity: disabled || isSyncing ? 0.6 : 1,
                  transition: "all 150ms",
                }}
              >
                <RefreshCw size={14} />
                {isSyncing ? "Syncing..." : syncLabel}
              </button>

              <button
                onClick={onFinalize}
                disabled={disabled || isSyncing}
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
                  cursor: disabled || isSyncing ? "not-allowed" : "pointer",
                  opacity: disabled || isSyncing ? 0.6 : 1,
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
            {syncDisabledReason ?? helperText}
          </p>
        )}
      </div>
    </div>
  );
}
