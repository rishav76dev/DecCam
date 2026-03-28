import { BarChart3, Layers, Coins, Users } from "lucide-react";

interface Props {
  totalCampaigns: number;
  active: number;
  totalBudget: number;
  totalSubmissions: number;
}

const stats = (p: Props) => [
  { label: "Total Campaigns", value: p.totalCampaigns, icon: Layers, suffix: "" },
  { label: "Active Now", value: p.active, icon: BarChart3, suffix: "" },
  { label: "Total Budget", value: p.totalBudget.toFixed(2), icon: Coins, suffix: " ETH" },
  { label: "Submissions", value: p.totalSubmissions, icon: Users, suffix: "" },
];

export function DashboardStats(props: Props) {
  return (
    <div className="dash-stats">
      {stats(props).map(({ label, value, icon: Icon, suffix }) => (
        <div key={label} className="dash-stat-shell">
          <div className="dash-stat-card">
            <div className="dash-stat-icon">
              <Icon size={18} />
            </div>
            <div className="dash-stat-value">
              {value}{suffix}
            </div>
            <div className="dash-stat-label">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
