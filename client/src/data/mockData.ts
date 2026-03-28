import type { Campaign } from "@/types";

// ─────────────────────────────────────────────────────────────
//  DecCampaign — Mock Data
//  5 campaigns × 3-5 submissions each
// ─────────────────────────────────────────────────────────────

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-1",
    name: "DeFi Summer 2025",
    description:
      "Spread the word about the next DeFi revolution. Create compelling tweets showcasing our new automated liquidity protocol and why it's changing on-chain finance forever.",
    category: "DeFi",
    totalBudget: 2.5,
    deadline: "2025-08-31",
    status: "active",
    creatorAddress: "0xaBcD...1234",
    coverGradient: "linear-gradient(135deg, #b8fe66 0%, #4ade80 100%)",
    submissions: [
      {
        id: "s1-1",
        creator: "0x1a2b…3c4d",
        creatorFull: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
        tweetLink: "https://x.com/cryptowhale/status/1876543210987654321",
        views: 12400,
        reward: 0,
        claimed: false,
        submittedAt: "2025-07-10T09:15:00Z",
      },
      {
        id: "s1-2",
        creator: "0x5e6f…7a8b",
        creatorFull: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
        tweetLink: "https://x.com/defi_insider/status/1876543210987654322",
        views: 8750,
        reward: 0,
        claimed: false,
        submittedAt: "2025-07-11T14:30:00Z",
      },
      {
        id: "s1-3",
        creator: "0x9c0d…1e2f",
        creatorFull: "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d",
        tweetLink: "https://x.com/web3creator/status/1876543210987654323",
        views: 5200,
        reward: 0,
        claimed: false,
        submittedAt: "2025-07-12T11:00:00Z",
      },
      {
        id: "s1-4",
        creator: "0x3a4b…5c6d",
        creatorFull: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        tweetLink: "https://x.com/blockchainbuzz/status/1876543210987654324",
        views: 3100,
        reward: 0,
        claimed: false,
        submittedAt: "2025-07-13T08:45:00Z",
      },
    ],
  },

  {
    id: "camp-2",
    name: "NFT Genesis Drop",
    description:
      "Launch campaign for our genesis NFT collection. We need creators to tweet about the artistic vision, utility, and exclusive perks of holding a Genesis NFT from our collection.",
    category: "NFT",
    totalBudget: 1.2,
    deadline: "2025-07-25",
    status: "active",
    creatorAddress: "0xDeF0…5678",
    coverGradient: "linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)",
    submissions: [
      {
        id: "s2-1",
        creator: "0x7e8f…9a0b",
        creatorFull: "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
        tweetLink: "https://x.com/nft_curator/status/1876543210987654401",
        views: 22000,
        reward: 0,
        claimed: false,
        submittedAt: "2025-07-05T10:00:00Z",
      },
      {
        id: "s2-2",
        creator: "0x1c2d…3e4f",
        creatorFull: "0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
        tweetLink: "https://x.com/art_collector/status/1876543210987654402",
        views: 14500,
        reward: 0,
        claimed: false,
        submittedAt: "2025-07-06T13:20:00Z",
      },
      {
        id: "s2-3",
        creator: "0x5a6b…7c8d",
        creatorFull: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
        tweetLink: "https://x.com/digitalartist/status/1876543210987654403",
        views: 9800,
        reward: 0,
        claimed: false,
        submittedAt: "2025-07-07T16:10:00Z",
      },
    ],
  },

  {
    id: "camp-3",
    name: "GameFi Alliance",
    description:
      "Help us grow the GameFi ecosystem. Tweet about how our play-to-earn mechanics are different, why our tokenomics are sustainable, and share your in-game achievements.",
    category: "Gaming",
    totalBudget: 5.0,
    deadline: "2025-09-15",
    status: "active",
    creatorAddress: "0x1122…aAbB",
    coverGradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    submissions: [
      {
        id: "s3-1",
        creator: "0x9e0f…1a2b",
        creatorFull: "0x9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
        tweetLink: "https://x.com/gamingpro/status/1876543210987654501",
        views: 31000,
        reward: 0,
        claimed: false,
        submittedAt: "2025-08-01T07:30:00Z",
      },
      {
        id: "s3-2",
        creator: "0x3c4d…5e6f",
        creatorFull: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
        tweetLink: "https://x.com/p2e_hunter/status/1876543210987654502",
        views: 18200,
        reward: 0,
        claimed: false,
        submittedAt: "2025-08-02T12:00:00Z",
      },
      {
        id: "s3-3",
        creator: "0x7a8b…9c0d",
        creatorFull: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
        tweetLink: "https://x.com/metaverse_gamer/status/1876543210987654503",
        views: 12600,
        reward: 0,
        claimed: false,
        submittedAt: "2025-08-03T09:45:00Z",
      },
      {
        id: "s3-4",
        creator: "0x1e2f…3a4b",
        creatorFull: "0x1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
        tweetLink: "https://x.com/nft_gamer/status/1876543210987654504",
        views: 7400,
        reward: 0,
        claimed: false,
        submittedAt: "2025-08-04T15:15:00Z",
      },
      {
        id: "s3-5",
        creator: "0x5c6d…7e8f",
        creatorFull: "0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
        tweetLink: "https://x.com/guild_master/status/1876543210987654505",
        views: 4300,
        reward: 0,
        claimed: false,
        submittedAt: "2025-08-05T11:30:00Z",
      },
    ],
  },

  {
    id: "camp-4",
    name: "DAO Governance Push",
    description:
      "We're launching our decentralized governance model and need community evangelists. Tweet about the importance of on-chain governance, voter participation, and our proposal system.",
    category: "DAO",
    totalBudget: 0.8,
    deadline: "2025-07-15",
    status: "finalized",
    creatorAddress: "0xCcDd…EeFf",
    coverGradient: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
    submissions: [
      {
        id: "s4-1",
        creator: "0x9a0b…1c2d",
        creatorFull: "0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
        tweetLink: "https://x.com/dao_delegate/status/1876543210987654601",
        views: 6800,
        reward: 0,
        claimed: true,
        submittedAt: "2025-07-01T10:00:00Z",
      },
      {
        id: "s4-2",
        creator: "0x3e4f…5a6b",
        creatorFull: "0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
        tweetLink: "https://x.com/governance_guru/status/1876543210987654602",
        views: 4200,
        reward: 0,
        claimed: false,
        submittedAt: "2025-07-02T14:00:00Z",
      },
      {
        id: "s4-3",
        creator: "0x7c8d…9e0f",
        creatorFull: "0x7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
        tweetLink: "https://x.com/decentral_voice/status/1876543210987654603",
        views: 2900,
        reward: 0,
        claimed: false,
        submittedAt: "2025-07-03T09:30:00Z",
      },
    ],
  },

  {
    id: "camp-5",
    name: "L2 Infrastructure Awareness",
    description:
      "Educate the crypto community about Layer 2 scaling solutions. Tweet about transaction speed, gas cost savings, developer tooling, and why L2 is the future of Ethereum.",
    category: "Infrastructure",
    totalBudget: 3.75,
    deadline: "2025-06-30",
    status: "closed",
    creatorAddress: "0x4455…6677",
    coverGradient: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
    submissions: [
      {
        id: "s5-1",
        creator: "0x1b2c…3d4e",
        creatorFull: "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c",
        tweetLink: "https://x.com/eth_dev/status/1876543210987654701",
        views: 45000,
        reward: 0,
        claimed: true,
        submittedAt: "2025-06-10T08:00:00Z",
      },
      {
        id: "s5-2",
        creator: "0x5f6a…7b8c",
        creatorFull: "0x5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a",
        tweetLink: "https://x.com/layer2_maxi/status/1876543210987654702",
        views: 28000,
        reward: 0,
        claimed: true,
        submittedAt: "2025-06-11T10:30:00Z",
      },
      {
        id: "s5-3",
        creator: "0x9d0e…1f2a",
        creatorFull: "0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e",
        tweetLink: "https://x.com/scaling_now/status/1876543210987654703",
        views: 19500,
        reward: 0,
        claimed: true,
        submittedAt: "2025-06-12T13:15:00Z",
      },
      {
        id: "s5-4",
        creator: "0x3b4c…5d6e",
        creatorFull: "0x3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
        tweetLink: "https://x.com/rollup_fan/status/1876543210987654704",
        views: 11200,
        reward: 0,
        claimed: false,
        submittedAt: "2025-06-13T16:45:00Z",
      },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────

/** Returns the number of days remaining until the deadline. Negative = overdue. */
export function daysUntil(deadline: string): number {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Sum all views across a campaign's submissions */
export function getTotalViews(campaign: Campaign): number {
  return campaign.submissions.reduce((acc, s) => acc + s.views, 0);
}

/** Recalculate rewards for all submissions in a campaign */
export function calculateRewards(campaign: Campaign): Campaign["submissions"] {
  const totalViews = getTotalViews(campaign);
  if (totalViews === 0) return campaign.submissions;
  return campaign.submissions.map((s) => ({
    ...s,
    reward: Number(((s.views / totalViews) * campaign.totalBudget).toFixed(6)),
  }));
}

/** Aggregate dashboard-level stats across all campaigns */
export function getGlobalStats(campaigns: Campaign[]) {
  const totalBudget = campaigns.reduce((a, c) => a + c.totalBudget, 0);
  const totalSubmissions = campaigns.reduce(
    (a, c) => a + c.submissions.length,
    0,
  );
  const totalViews = campaigns.reduce((a, c) => a + getTotalViews(c), 0);
  const active = campaigns.filter((c) => c.status === "active").length;
  return { totalBudget, totalSubmissions, totalViews, active };
}
