import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CampaignOverview } from "@/components/campaign/CampaignOverview";
import { ActionBar } from "@/components/campaign/ActionBar";
import { SubmissionList } from "@/components/campaign/SubmissionList";
import { AddSubmissionForm } from "@/components/campaign/AddSubmissionForm";
import { MOCK_CAMPAIGNS } from "@/data/mockData";
import type { Submission } from "@/types";

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "active"
      ? "status-active"
      : status === "finalized"
        ? "status-finalized"
        : "status-closed";
  const label =
    status === "active" ? "Active" : status === "finalized" ? "Finalized" : "Closed";
  return (
    <span
      className={cls}
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 9999,
        letterSpacing: "0.03em",
        textTransform: "uppercase" as const,
      }}
    >
      {label}
    </span>
  );
}

export function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const base = MOCK_CAMPAIGNS.find((c) => c.id === campaignId);

  // ── Local state (UI only, no blockchain) ──────────────────────
  const [submissions, setSubmissions] = useState<Submission[]>(
    base?.submissions ?? [],
  );
  const [finalized, setFinalized] = useState(base?.status === "finalized");

  // ── Handlers ──────────────────────────────────────────────────

  /** Update views for a single submission */
  const handleViewsChange = useCallback((id: string, views: number) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, views } : s)),
    );
  }, []);

  /** Fill random realistic view counts */
  const handleSimulateViews = useCallback(() => {
    setSubmissions((prev) =>
      prev.map((s) => ({
        ...s,
        views: Math.floor(Math.random() * 48_000) + 2_000,
      })),
    );
  }, []);

  /** Lock the distribution */
  const handleFinalize = useCallback(() => {
    const totalViews = submissions.reduce((a, s) => a + s.views, 0);
    if (totalViews === 0) {
      alert("Simulate or enter views before finalizing.");
      return;
    }
    setSubmissions((prev) =>
      prev.map((s) => ({
        ...s,
        reward:
          totalViews > 0
            ? Number(((s.views / totalViews) * (base?.totalBudget ?? 0)).toFixed(6))
            : 0,
      })),
    );
    setFinalized(true);
  }, [submissions, base?.totalBudget]);

  /** Toggle claimed state for a creator */
  const handleClaim = useCallback((id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, claimed: true } : s)),
    );
  }, []);

  /** Add a new submission */
  const handleAddSubmission = useCallback(
    (tweetLink: string, creatorFull: string) => {
      const short =
        creatorFull.length > 12
          ? `${creatorFull.slice(0, 6)}…${creatorFull.slice(-4)}`
          : creatorFull;
      const newSub: Submission = {
        id: `sub-${Date.now()}`,
        creator: short,
        creatorFull,
        tweetLink,
        views: 0,
        reward: 0,
        claimed: false,
        submittedAt: new Date().toISOString(),
      };
      setSubmissions((prev) => [...prev, newSub]);
    },
    [],
  );

  // ── Not found ─────────────────────────────────────────────────
  if (!base) {
    return (
      <div className="detail-page">
        <Navbar />
        <div
          style={{
            textAlign: "center",
            padding: "120px 24px",
            color: "var(--gray-500)",
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--black)", marginBottom: 8 }}>
            Campaign not found
          </h2>
          <p style={{ marginBottom: 24 }}>
            The campaign ID "{campaignId}" does not exist.
          </p>
          <Link to="/dashboard" className="btn-pill-black" style={{ display: "inline-flex" }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Navbar />

      {/* Page header */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <Link to="/dashboard" className="detail-back">
            <ArrowLeft size={14} /> All Campaigns
          </Link>

          <div className="detail-title-row">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {/* Gradient dot */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: base.coverGradient,
                    flexShrink: 0,
                  }}
                />
                <h1 className="detail-title">{base.name}</h1>
                <StatusBadge status={finalized ? "finalized" : base.status} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "var(--gray-100)",
                    color: "var(--gray-500)",
                  }}
                >
                  {base.category}
                </span>
              </div>
              <p className="detail-creator">
                Created by {base.creatorAddress} ·{" "}
                {new Date(base.deadline).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <a
              href={`https://x.com`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--gray-500)",
                textDecoration: "none",
              }}
            >
              <ExternalLink size={13} /> View on X
            </a>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: 13,
              color: "var(--gray-500)",
              maxWidth: 680,
              lineHeight: 1.6,
              marginTop: 12,
            }}
          >
            {base.description}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">
        {/* Overview stats */}
        <CampaignOverview
          campaign={{ ...base, submissions }}
          finalized={finalized}
        />

        {/* Action bar */}
        {base.status !== "closed" && (
          <ActionBar
            finalized={finalized}
            onSimulateViews={handleSimulateViews}
            onFinalize={handleFinalize}
          />
        )}

        {/* Submissions list */}
        <SubmissionList
          submissions={submissions}
          totalBudget={base.totalBudget}
          finalized={finalized}
          onViewsChange={handleViewsChange}
          onClaim={handleClaim}
        />

        {/* Add submission form */}
        <AddSubmissionForm
          disabled={finalized || base.status === "closed"}
          onAdd={handleAddSubmission}
        />
      </div>
    </div>
  );
}
