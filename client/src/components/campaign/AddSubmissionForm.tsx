import { useState } from "react";
import { Plus, Link2 } from "lucide-react";

interface Props {
  disabled: boolean;
  submitting?: boolean;
  submitHint?: string;
  onAdd: (tweetLink: string) => void;
}

export function AddSubmissionForm({
  disabled,
  submitting = false,
  submitHint,
  onAdd,
}: Props) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!link.trim()) {
      setError("Tweet link is required.");
      return;
    }
    if (!link.includes("x.com") && !link.includes("twitter.com")) {
      setError("Please enter a valid X / Twitter URL.");
      return;
    }

    onAdd(link.trim());
    setLink("");
  }

  return (
    <div className="add-submission-form">
      <div className="add-submission-form-title">
        <Link2 size={14} style={{ display: "inline", marginRight: 6 }} />
        Add Submission
      </div>

      <form onSubmit={handleSubmit}>
        <div className="add-submission-row">
          <input
            type="url"
            className="input"
            placeholder="https://x.com/user/status/..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            disabled={disabled || submitting}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={disabled || submitting}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              padding: "0 18px",
              borderRadius: 10,
              border: "none",
              background: "var(--black)",
              color: "var(--white)",
              cursor: disabled || submitting ? "not-allowed" : "pointer",
              opacity: disabled || submitting ? 0.5 : 1,
              whiteSpace: "nowrap",
              height: 40,
              flexShrink: 0,
            }}
          >
            <Plus size={14} />
            {submitting ? "Submitting..." : "Add"}
          </button>
        </div>
        {error && (
          <p style={{ fontSize: 12, color: "#ef4444", marginTop: 8 }}>{error}</p>
        )}
        {!error && submitHint && (
          <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 8 }}>
            {submitHint}
          </p>
        )}
        {disabled && (
          <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 8 }}>
            Distribution is finalized — no new submissions accepted.
          </p>
        )}
      </form>
    </div>
  );
}
