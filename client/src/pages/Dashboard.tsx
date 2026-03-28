import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { parseEther } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Plus, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { CampaignCard } from "@/components/dashboard/CampaignCard";
import {
  appChain,
  campaignFactoryAbi,
  contractAddress,
  getGlobalStats,
  publicClient,
  saveCampaignName,
  useCampaigns,
} from "@/lib/campaigns";
import type { CampaignStatus } from "@/types";

const STATUS_FILTERS: { label: string; value: CampaignStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Finalized", value: "finalized" },
  { label: "Closed", value: "closed" },
];

const DURATION_OPTIONS = [
  { label: "2 minutes", value: "2" },
  { label: "3 minutes", value: "3" },
  { label: "5 minutes", value: "5" },
  { label: "10 minutes", value: "10" },
] as const;

export function Dashboard() {
  const [filter, setFilter] = useState<CampaignStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [createFeedback, setCreateFeedback] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [budgetEth, setBudgetEth] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<(typeof DURATION_OPTIONS)[number]["value"]>("2");
  const [isCreating, setIsCreating] = useState(false);
  const { isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { openConnectModal } = useConnectModal();
  const queryClient = useQueryClient();
  const { data: campaigns = [], isLoading, isError, error } = useCampaigns();

  const stats = getGlobalStats(campaigns);

  const filtered = campaigns.filter((c) => {
    const matchStatus = filter === "all" || c.status === filter;
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  function handleCreateCampaignClick() {
    if (!isConnected) {
      setCreateFeedback(
        "Connect your wallet first. Creating a campaign sends an on-chain transaction from your wallet.",
      );
      setShowCreateForm(false);
      openConnectModal?.();
      return;
    }

    if (!contractAddress) {
      setCreateFeedback(
        "Contract is not configured. Set VITE_CONTRACT_ADDRESS and VITE_RPC_URL before creating campaigns.",
      );
      setShowCreateForm(false);
      return;
    }

    if (chainId !== appChain.id) {
      setCreateFeedback(
        `Switch your wallet to chain ${appChain.id} before creating a campaign.`,
      );
      setShowCreateForm(false);
      return;
    }

    setCreateFeedback(
      "The contract currently stores only budget and deadline. Name, description, and category still need off-chain metadata if you want them.",
    );
    setShowCreateForm((current) => !current);
  }

  async function handleCreateCampaignSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!walletClient || !contractAddress) {
      setCreateFeedback("Connect a wallet before creating a campaign.");
      return;
    }

    const normalizedName = campaignName.trim();
    const normalizedBudget = budgetEth.trim();
    const normalizedMinutes = Number(durationMinutes);

    if (!normalizedName) {
      setCreateFeedback("Enter a campaign name.");
      return;
    }

    if (!normalizedBudget) {
      setCreateFeedback("Enter a campaign budget in ETH.");
      return;
    }

    if (!Number.isFinite(normalizedMinutes) || normalizedMinutes <= 0) {
      setCreateFeedback("Select a campaign duration of 2, 3, 5, or 10 minutes.");
      return;
    }

    let value: bigint;
    try {
      value = parseEther(normalizedBudget);
    } catch {
      setCreateFeedback("Budget must be a valid ETH amount.");
      return;
    }

    if (value <= 0n) {
      setCreateFeedback("Budget must be greater than 0 ETH.");
      return;
    }

    const durationSeconds = BigInt(normalizedMinutes * 60);

    if (durationSeconds <= 0n) {
      setCreateFeedback("Select a valid campaign duration.");
      return;
    }

    setIsCreating(true);
    setCreateFeedback(null);

    try {
      const beforeCount = await publicClient.readContract({
        address: contractAddress,
        abi: campaignFactoryAbi,
        functionName: "getCampaignCount",
      });

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: campaignFactoryAbi,
        functionName: "createCampaign",
        args: [durationSeconds],
        value,
        account: walletClient.account,
        chain: walletClient.chain,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      const afterCount = await publicClient.readContract({
        address: contractAddress,
        abi: campaignFactoryAbi,
        functionName: "getCampaignCount",
      });

      if (afterCount > beforeCount) {
        saveCampaignName(Number(afterCount - 1n), normalizedName);
      }

      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setCampaignName("");
      setBudgetEth("");
      setDurationMinutes("2");
      setShowCreateForm(false);
      setCreateFeedback("Campaign created successfully.");
    } catch (createError) {
      setCreateFeedback(
        createError instanceof Error ? createError.message : String(createError),
      );
    } finally {
      setIsCreating(false);
    }
  }

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
            onClick={handleCreateCampaignClick}
            title={
              !isConnected
                ? "Connect your wallet to create a campaign"
                : "Create campaign"
            }
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
        {createFeedback && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--white)",
              color: "var(--gray-500)",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {createFeedback}
          </div>
        )}

        {showCreateForm && (
          <div
            style={{
              marginBottom: 16,
              padding: "18px",
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "var(--white)",
            }}
          >
            <form
              onSubmit={handleCreateCampaignSubmit}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                alignItems: "end",
              }}
            >
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)" }}>
                  Campaign name
                </span>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Monad Creator Sprint"
                  disabled={isCreating}
                  maxLength={80}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 14,
                    outline: "none",
                    background: "var(--white)",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)" }}>
                  Budget (ETH)
                </span>
                <input
                  type="text"
                  value={budgetEth}
                  onChange={(e) => setBudgetEth(e.target.value)}
                  placeholder="0.50"
                  disabled={isCreating}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 14,
                    outline: "none",
                    background: "var(--white)",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)" }}>
                  Duration
                </span>
                <select
                  value={durationMinutes}
                  onChange={(e) =>
                    setDurationMinutes(
                      e.target.value as (typeof DURATION_OPTIONS)[number]["value"],
                    )
                  }
                  disabled={isCreating}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 14,
                    outline: "none",
                    background: "var(--white)",
                  }}
                >
                  {DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="submit"
                  disabled={isCreating}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: "var(--black)",
                    color: "var(--white)",
                    cursor: isCreating ? "not-allowed" : "pointer",
                    opacity: isCreating ? 0.6 : 1,
                  }}
                >
                  {isCreating ? "Creating..." : "Create On-Chain"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "var(--white)",
                    color: "var(--black)",
                    cursor: isCreating ? "not-allowed" : "pointer",
                    opacity: isCreating ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <DashboardStats
          totalCampaigns={campaigns.length}
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

        {!contractAddress ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              color: "var(--gray-500)",
              fontSize: 14,
              background: "var(--white)",
              borderRadius: 16,
              border: "1px solid var(--border)",
            }}
          >
            Set <code>VITE_CONTRACT_ADDRESS</code> and <code>VITE_RPC_URL</code> to load campaigns from the contract.
          </div>
        ) : isLoading ? (
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
            Loading campaigns from chain...
          </div>
        ) : isError ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              color: "#ef4444",
              fontSize: 14,
              background: "var(--white)",
              borderRadius: 16,
              border: "1px solid var(--border)",
            }}
          >
            Failed to load campaigns: {error instanceof Error ? error.message : String(error)}
          </div>
        ) : filtered.length === 0 ? (
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
