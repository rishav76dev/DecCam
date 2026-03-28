import { Coins, Clock, Users, Eye, Zap } from "lucide-react";
import type { Campaign } from "@/types";
import { daysUntil, getTotalViews } from "@/lib/campaigns";

interface Props {
  campaign: Campaign;
  finalized: boolean;
}

export function CampaignOverview({ campaign, finalized }: Props) {
  const totalViews = campaign.totalViews ?? getTotalViews(campaign);
  const days = daysUntil(campaign.deadline);
  const distributed = finalized
    ? campaign.submissions.reduce((a, s) => a + s.reward, 0)
    : 0;

  const deadlineText =
    campaign.status === "closed"
      ? "Campaign ended"
      : days < 0
        ? `${Math.abs(days)} days overdue`
        : days === 0
          ? "Ends today"
          : `${days} days left`;

  const items = [
    {
      label: "Total Budget",
      value: `${campaign.totalBudget} MON`,
      icon: Coins,
      lime: false,
    },
    {
      label: "Time Remaining",
      value: deadlineText,
      icon: Clock,
      lime: false,
    },
    {
      label: "Submissions",
      value: (campaign.submissionCount ?? campaign.submissions.length).toString(),
      icon: Users,
      lime: false,
    },
    {
      label: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      lime: false,
    },
    {
      label: "Distributed",
      value: finalized ? `${distributed.toFixed(4)} MON` : "—",
      icon: Zap,
      lime: finalized,
    },
  ];

  return (
    <div className="overview-stats">
      {items.map(({ label, value, icon: Icon, lime }) => (
        <div key={label} className="overview-stat-shell">
          <div className="overview-stat">
            <div className="overview-stat-label">
              <Icon size={11} style={{ display: "inline", marginRight: 4 }} />
              {label}
            </div>
            <div className={`overview-stat-value${lime ? " lime" : ""}`}>{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
