import { useNavigate } from "react-router-dom";
import type { Campaign } from "@/types";
import { getTotalViews } from "@/data/mockData";

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

interface Props {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: Props) {
  const navigate = useNavigate();

  const totalViews = getTotalViews(campaign);
  const shortName =
    campaign.name.length > 13
      ? campaign.name.slice(0, 11) + "…"
      : campaign.name;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/dashboard/${campaign.id}`)}
      onKeyDown={(e) =>
        e.key === "Enter" && navigate(`/dashboard/${campaign.id}`)
      }
      className="w-full cursor-pointer focus:outline-none"
      style={{
        background: "#f5fbe8",
        border: "1px solid #e4e4e7",
        borderRadius: 20,
        padding: "26px",
        fontFamily: "'DM Sans', sans-serif",
        backgroundImage:
          "radial-gradient(circle, rgba(90,160,0,0.10) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="flex items-start gap-4">
        {/* LEFT: CAMPAIGN → CATEGORY */}
        <div className="flex items-start flex-1 min-w-0">
          {/* Column A */}
          <div className="flex flex-col shrink-0">
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 28,
                color: "#111",
                letterSpacing: "1.5px",
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              CAMPAIGN
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#111",
                marginTop: 10,
                letterSpacing: "0.4px",
              }}
            >
              {shortName.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#aaa",
                fontWeight: 400,
                marginTop: 4,
                fontFamily: "monospace",
                maxWidth: 140,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {campaign.creatorAddress}
            </span>
          </div>

          {/* Arrow */}
          <div
            style={{
              padding: "3px 14px 0 14px",
              color: "#111",
              fontSize: 26,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            →
          </div>

          {/* Column B */}
          <div className="flex flex-col shrink-0">
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 28,
                color: "#111",
                letterSpacing: "1.5px",
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              {campaign.category.length > 8
                ? campaign.category.slice(0, 7).toUpperCase()
                : campaign.category.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#111",
                marginTop: 10,
                letterSpacing: "0.4px",
              }}
            >
              VIEWS
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#aaa",
                fontWeight: 400,
                marginTop: 4,
              }}
            >
              {fmtViews(totalViews)}
            </span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          style={{
            background: "white",
            borderRadius: 18,
            padding: "15px 17px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            minWidth: 190,
            flexShrink: 0,
            border: "1px solid #e4e4e7",
          }}
        >
          <div className="flex flex-col gap-1">
            <span style={{ fontSize: 17, fontWeight: 600, color: "#111" }}>
              {campaign.totalBudget} ETH
            </span>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 400 }}>
              {campaign.submissions.length} Submission
              {campaign.submissions.length !== 1 ? "s" : ""}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#111",
                marginTop: 6,
              }}
            >
              {statusLabel(campaign.status)}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/${campaign.id}`);
            }}
            style={{
              width: 44,
              height: 44,
              background: "#1c1c1c",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: "none",
              flexShrink: 0,
              outline: "none",
            }}
          >
            <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
