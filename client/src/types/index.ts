// ─────────────────────────────────────────────────────────────
//  DecCampaign — Core Types
// ─────────────────────────────────────────────────────────────

export type CampaignStatus = "active" | "finalized" | "closed";

export type CampaignCategory =
  | "DeFi"
  | "NFT"
  | "Gaming"
  | "Infrastructure"
  | "DAO"
  | "Social"
  | "Other";

// ── Submission ────────────────────────────────────────────────
export interface Submission {
  id: string;
  contractIndex?: number;
  /** Shortened wallet address, e.g. "0x1a2b…3c4d" */
  creator: string;
  /** Full wallet address for display */
  creatorFull: string;
  /** Twitter / X post URL */
  tweetLink: string;
  /** Raw view count from the contract / worker sync */
  views: number;
  /** Reward value in ETH */
  reward: number;
  /** Reward value in wei */
  rewardWei?: bigint;
  /** Whether this creator has claimed their reward */
  claimed: boolean;
  /** ISO timestamp when the submission was added, if available off-chain */
  submittedAt: string;
}

// ── Campaign ──────────────────────────────────────────────────
export interface Campaign {
  id: string;
  name: string;
  description: string;
  category: CampaignCategory;
  /** Total reward pool in ETH */
  totalBudget: number;
  /** Total reward pool in wei */
  totalBudgetWei?: bigint;
  /** ISO date string, e.g. "2025-09-15" */
  deadline: string;
  /** Unix timestamp in seconds */
  deadlineUnix?: number;
  status: CampaignStatus;
  /** Address of the brand / campaign creator */
  creatorAddress: string;
  /** CSS gradient string used as the card cover accent */
  coverGradient: string;
  /** Total aggregated views recorded on-chain */
  totalViews?: number;
  /** Whether results were finalized on-chain */
  resultsFinalized?: boolean;
  /** Number of submissions, even when submissions are not loaded */
  submissionCount?: number;
  submissions: Submission[];
}

// ── Derived / helper types ────────────────────────────────────

/** Aggregated stats derived from a Campaign's submissions */
export interface CampaignStats {
  totalViews: number;
  totalSubmissions: number;
  totalDistributed: number;
  remainingBudget: number;
}

/** Shape passed to the add-submission form handler */
export interface NewSubmissionInput {
  tweetLink: string;
  creatorFull?: string;
}
