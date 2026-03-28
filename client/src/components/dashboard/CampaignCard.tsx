import { useNavigate } from "react-router-dom";
import type { Campaign } from "@/types";
import { getTotalViews } from "@/lib/campaigns";

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function fmtViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n > 0 ? n.toString() : "—";
}

function statusLabel(s: Campaign["status"]): string {
  if (s === "active") return "On Track";
  if (s === "finalized") return "Finalized";
  return "Campaign Ended";
}

function shortDescription(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= 120) {
    return trimmed;
  }

  return `${trimmed.slice(0, 117)}...`;
}

interface Props {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: Props) {
  const navigate = useNavigate();
  const totalViews = campaign.totalViews ?? getTotalViews(campaign);
  const totalSubmissions = campaign.submissionCount ?? campaign.submissions.length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/dashboard/${campaign.id}`)}
      onKeyDown={(e) =>
        e.key === "Enter" && navigate(`/dashboard/${campaign.id}`)
      }
      className="dash-campaign-card-shell w-full cursor-pointer focus:outline-none"
    >
      <div className="dash-campaign-card">
        <div className="dash-campaign-card-top">
          <div className="dash-campaign-card-copy">
            <p className="dash-campaign-eyebrow">{campaign.category}</p>
            <h3 className="dash-campaign-title">{campaign.name}</h3>
            <p className="dash-campaign-description">{shortDescription(campaign.description)}</p>
            <p className="dash-campaign-creator">{campaign.creatorAddress}</p>
          </div>

          <div className="dash-campaign-dots" aria-hidden="true">
            {Array.from({ length: 42 }).map((_, index) => (
              <span key={`${campaign.id}-dot-${index}`} />
            ))}
          </div>
        </div>

        <div className="dash-campaign-meta-row">
          <div className="dash-campaign-meta-item">
            <span>Budget</span>
            <strong>{campaign.totalBudget} MON</strong>
          </div>

          <div className="dash-campaign-meta-item">
            <span>Views</span>
            <strong>{fmtViews(totalViews)}</strong>
          </div>

          <div className="dash-campaign-meta-item">
            <span>Submissions</span>
            <strong>
              {totalSubmissions} submission{totalSubmissions !== 1 ? "s" : ""}
            </strong>
          </div>

          <div className="dash-campaign-status-wrap">
            <span className="dash-campaign-status">{statusLabel(campaign.status)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/${campaign.id}`);
              }}
              className="dash-campaign-open-btn"
              aria-label={`Open ${campaign.name}`}
            >
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
