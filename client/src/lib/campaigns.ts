import { useQuery } from "@tanstack/react-query";
import { createPublicClient, defineChain, fallback, formatEther, http } from "viem";
import type { Abi } from "viem";
import type { Campaign, CampaignStats, CampaignStatus, Submission } from "@/types";

const LOCAL_RPC_URL = "http://127.0.0.1:8545";
const MONAD_TESTNET_CHAIN_ID = 10143;
const MONAD_TESTNET_RPC_URL = "https://testnet-rpc.monad.xyz/";
const LEGACY_MONAD_TESTNET_RPC_HOST = "rpc.testnet.monad.xyz";
const CAMPAIGN_NAME_STORAGE_PREFIX = "deccam:campaign-name";

const chainId = Number(import.meta.env.VITE_CHAIN_ID ?? 31337);

function normalizeRpcUrl(url: string): string {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === LEGACY_MONAD_TESTNET_RPC_HOST) {
      return MONAD_TESTNET_RPC_URL;
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

function buildRpcUrls(chainIdValue: number, configuredUrl?: string): [string, ...string[]] {
  const urls = new Set<string>();

  if (configuredUrl) {
    urls.add(normalizeRpcUrl(configuredUrl));
  }

  if (chainIdValue === MONAD_TESTNET_CHAIN_ID) {
    urls.add(MONAD_TESTNET_RPC_URL);
  } else {
    urls.add(LOCAL_RPC_URL);
  }

  return Array.from(urls) as [string, ...string[]];
}

export const rpcUrls = buildRpcUrls(chainId, import.meta.env.VITE_RPC_URL);
export const rpcUrl = rpcUrls[0];
export const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined;
export const workerBaseUrl =
  import.meta.env.VITE_WORKER_URL ?? "http://localhost:3001";

function campaignNameStorageKey(campaignId: number): string {
  return `${CAMPAIGN_NAME_STORAGE_PREFIX}:${chainId}:${contractAddress ?? "unconfigured"}:${campaignId}`;
}

function readCampaignName(campaignId: number): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(campaignNameStorageKey(campaignId));
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function resolveCampaignName(campaignId: number): string {
  return readCampaignName(campaignId) ?? `Campaign #${campaignId}`;
}

export function saveCampaignName(campaignId: number, name: string) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = name.trim();

  if (!normalized) {
    window.localStorage.removeItem(campaignNameStorageKey(campaignId));
    return;
  }

  window.localStorage.setItem(campaignNameStorageKey(campaignId), normalized);
}

export const appChain = defineChain({
  id: chainId,
  name: chainId === 31337 ? "Local" : "Configured Chain",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: rpcUrls,
    },
  },
});

export const campaignFactoryAbi = [
  {
    type: "function",
    name: "getCampaignCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "campaigns",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "brand", type: "address" },
      { name: "deadline", type: "uint256" },
      { name: "totalBudget", type: "uint256" },
      { name: "totalViews", type: "uint256" },
      { name: "resultsFinalized", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "getSubmissionCount",
    stateMutability: "view",
    inputs: [{ name: "campaignId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getSubmission",
    stateMutability: "view",
    inputs: [
      { name: "campaignId", type: "uint256" },
      { name: "index", type: "uint256" },
    ],
    outputs: [
      { name: "creator", type: "address" },
      { name: "link", type: "string" },
      { name: "views", type: "uint256" },
      { name: "reward", type: "uint256" },
      { name: "paid", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "createCampaign",
    stateMutability: "payable",
    inputs: [{ name: "duration", type: "uint256" }],
    outputs: [{ name: "campaignId", type: "uint256" }],
  },
  {
    type: "function",
    name: "submit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "campaignId", type: "uint256" },
      { name: "link", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "claimReward",
    stateMutability: "nonpayable",
    inputs: [
      { name: "campaignId", type: "uint256" },
      { name: "index", type: "uint256" },
    ],
    outputs: [],
  },
] as const satisfies Abi;

export const publicClient = createPublicClient({
  chain: appChain,
  transport: fallback(rpcUrls.map((url) => http(url, { timeout: 10_000 }))),
});

function shortenAddress(address: string): string {
  return address.length > 10
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : address;
}

function gradientForId(id: number): string {
  const gradients = [
    "linear-gradient(135deg, #b8fe66 0%, #4ade80 100%)",
    "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    "linear-gradient(135deg, #34d399 0%, #059669 100%)",
    "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
  ];

  return gradients[id % gradients.length] ?? gradients[0];
}

function deadlineToIso(deadlineUnix: bigint): string {
  return new Date(Number(deadlineUnix) * 1000).toISOString();
}

export function getCampaignStatus(
  deadlineUnix: number,
  resultsFinalized: boolean,
): CampaignStatus {
  if (resultsFinalized) {
    return "finalized";
  }

  return Date.now() >= deadlineUnix * 1000 ? "closed" : "active";
}

export function daysUntil(deadline: string): number {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getTotalViews(campaign: Campaign): number {
  return campaign.submissions.reduce((acc, submission) => acc + submission.views, 0);
}

export function getGlobalStats(campaigns: Campaign[]) {
  const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.totalBudget, 0);
  const totalSubmissions = campaigns.reduce(
    (sum, campaign) => sum + campaign.submissions.length,
    0,
  );
  const totalViews = campaigns.reduce(
    (sum, campaign) => sum + (campaign.totalViews ?? getTotalViews(campaign)),
    0,
  );
  const active = campaigns.filter((campaign) => campaign.status === "active").length;

  return { totalBudget, totalSubmissions, totalViews, active };
}

function buildCampaignBase(
  id: number,
  brand: string,
  deadline: bigint,
  totalBudget: bigint,
  totalViews: bigint,
  resultsFinalized: boolean,
): Omit<Campaign, "submissions"> {
  const deadlineUnix = Number(deadline);

  return {
    id: id.toString(),
    name: resolveCampaignName(id),
    description:
      "This campaign is loaded from the contract. Rich metadata is not stored on-chain yet, so the UI can only show the campaign's financial and timing state dynamically.",
    category: "Other",
    totalBudget: Number(formatEther(totalBudget)),
    totalBudgetWei: totalBudget,
    deadline: deadlineToIso(deadline),
    deadlineUnix,
    status: getCampaignStatus(deadlineUnix, resultsFinalized),
    creatorAddress: brand,
    coverGradient: gradientForId(id),
    totalViews: Number(totalViews),
    resultsFinalized,
  };
}

async function fetchCampaigns(): Promise<Campaign[]> {
  if (!contractAddress) {
    return [];
  }

  const count = await publicClient.readContract({
    address: contractAddress,
    abi: campaignFactoryAbi,
    functionName: "getCampaignCount",
  });

  const campaignCount = Number(count);

  if (campaignCount === 0) {
    return [];
  }

  const [campaignResults, submissionCountResults] = await Promise.all([
    Promise.all(
      Array.from({ length: campaignCount }, (_, index) =>
        publicClient.readContract({
          address: contractAddress,
          abi: campaignFactoryAbi,
          functionName: "campaigns",
          args: [BigInt(index)],
        }),
      ),
    ),
    Promise.all(
      Array.from({ length: campaignCount }, (_, index) =>
        publicClient.readContract({
          address: contractAddress,
          abi: campaignFactoryAbi,
          functionName: "getSubmissionCount",
          args: [BigInt(index)],
        }),
      ),
    ),
  ]);

  return campaignResults.map((campaignResult, index) => {
    const [brand, deadline, totalBudget, totalViews, resultsFinalized] = campaignResult;
    return {
      ...buildCampaignBase(
        index,
        brand,
        deadline,
        totalBudget,
        totalViews,
        resultsFinalized,
      ),
      submissions: [],
      submissionCount: Number(submissionCountResults[index]),
    };
  });
}

async function fetchCampaignDetail(campaignId: number): Promise<Campaign | null> {
  if (!contractAddress) {
    return null;
  }

  const [campaignResult, submissionCountResult] = await Promise.all([
    publicClient.readContract({
      address: contractAddress,
      abi: campaignFactoryAbi,
      functionName: "campaigns",
      args: [BigInt(campaignId)],
    }),
    publicClient.readContract({
      address: contractAddress,
      abi: campaignFactoryAbi,
      functionName: "getSubmissionCount",
      args: [BigInt(campaignId)],
    }),
  ]);

  const [brand, deadline, totalBudget, totalViews, resultsFinalized] = campaignResult;
  const submissionCount = Number(submissionCountResult);

  let submissions: Submission[] = [];

  if (submissionCount > 0) {
    const submissionResults = await Promise.all(
      Array.from({ length: submissionCount }, (_, index) =>
        publicClient.readContract({
          address: contractAddress,
          abi: campaignFactoryAbi,
          functionName: "getSubmission",
          args: [BigInt(campaignId), BigInt(index)],
        }),
      ),
    );

    submissions = submissionResults.map((submissionResult, index) => {
      const [creator, link, views, reward, paid] = submissionResult;
      return {
        id: `${campaignId}-${index}`,
        contractIndex: index,
        creator: shortenAddress(creator),
        creatorFull: creator,
        tweetLink: link,
        views: Number(views),
        reward: Number(formatEther(reward)),
        rewardWei: reward,
        claimed: paid,
        submittedAt: "",
      };
    });
  }

  return {
    ...buildCampaignBase(
      campaignId,
      brand,
      deadline,
      totalBudget,
      totalViews,
      resultsFinalized,
    ),
    submissions,
    submissionCount,
  };
}

export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns", contractAddress, chainId],
    queryFn: fetchCampaigns,
  });
}

export function useCampaignDetail(campaignId: number | null) {
  return useQuery({
    queryKey: ["campaign", contractAddress, chainId, campaignId],
    queryFn: async () => {
      if (campaignId === null) {
        return null;
      }

      return fetchCampaignDetail(campaignId);
    },
    enabled: campaignId !== null,
  });
}

export function getCampaignStats(campaign: Campaign): CampaignStats {
  const totalDistributed = campaign.submissions.reduce(
    (sum, submission) => sum + submission.reward,
    0,
  );

  return {
    totalViews: campaign.totalViews ?? getTotalViews(campaign),
    totalSubmissions: campaign.submissions.length,
    totalDistributed,
    remainingBudget: Math.max(campaign.totalBudget - totalDistributed, 0),
  };
}
