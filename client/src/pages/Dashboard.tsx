import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { CampaignCard } from "@/components/dashboard/CampaignCard";
import { MOCK_CAMPAIGNS, getGlobalStats } from "@/data/mockData";
import type { CampaignStatus } from "@/types";

const STATUS_FILTERS: { label: string; value: CampaignStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Finalized", value: "finalized" },
  { label: "Closed", value: "closed" },
];

export function Dashboard() {
  const [filter, setFilter] = useState<CampaignStatus | "all">("all");
  const [search, setSearch] = useState("");

  const stats = getGlobalStats(MOCK_CAMPAIGNS);

  const filtered = MOCK_CAMPAIGNS.filter((c) => {
    const matchStatus = filter === "all" || c.status === filter;
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="dash-page">
      <Navbar />

      {/* Page header */}
      <div className="dash-header">
        <div className="dash-header-inner">
          <div>
            <h1 className="dash-title">Campaigns</h1>
            <p className="dash-subtitle">
              Browse and manage all active decentralized campaigns
            </p>
          </div>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: "var(--black)",
              color: "var(--white)",
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
            Create Campaign
          </button>
        </div>
      </div>

      <div className="dash-body">
        {/* Stats */}
        <DashboardStats
          totalCampaigns={stats.totalBudget !== undefined ? MOCK_CAMPAIGNS.length : 0}
          active={stats.active}
          totalBudget={stats.totalBudget}
          totalSubmissions={stats.totalSubmissions}
        />

        {/* Filters + search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {/* Filter tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 4,
            }}
          >
            {STATUS_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "6px 16px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 150ms",
                  background:
                    filter === value ? "var(--black)" : "transparent",
                  color: filter === value ? "var(--white)" : "var(--gray-500)",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "8px 14px",
              minWidth: 220,
            }}
          >
            <Search size={14} style={{ color: "var(--gray-400)", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 13,
                color: "var(--black)",
                background: "transparent",
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* Campaign grid */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              color: "var(--gray-400)",
              fontSize: 14,
              background: "var(--white)",
              borderRadius: 16,
              border: "1px solid var(--border)",
            }}
          >
            No campaigns match your filters.
          </div>
        ) : (
          <div className="campaign-grid">
            {filtered.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
