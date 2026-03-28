import { ethers } from "ethers";
import { scrapeTweet } from "./scraper";

// ─────────────────────────────────────────────────────────────
//  campaign.ts — On-chain campaign worker
//  Reads submissions from the contract, fetches real view
//  counts via ScrapingDog, writes them back on-chain, then
//  calls finalizeResults().
// ─────────────────────────────────────────────────────────────

const CampaignABI = [
  "function submissions(uint256) view returns (address creator, string link, uint256 views, uint256 reward, bool paid)",
  "function submissionCount() view returns (uint256)",
  "function setViews(uint256 index, uint256 views) external",
  "function finalizeResults() external",
];

export interface WorkerConfig {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
  scrapingDogApiKey: string;
}

export async function runCampaignWorker(config: WorkerConfig): Promise<void> {
  const { rpcUrl, privateKey, contractAddress, scrapingDogApiKey } = config;

  // ── 1. Setup provider + signer ──────────────────────────────
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const campaign = new ethers.Contract(contractAddress, CampaignABI, wallet);

  console.log(`\n[Worker] Connected to ${rpcUrl}`);
  console.log(`[Worker] Wallet  : ${wallet.address}`);
  console.log(`[Worker] Contract: ${contractAddress}\n`);

  // ── 2. Collect all submissions ──────────────────────────────
  type Submission = {
    index: number;
    creator: string;
    link: string;
    views: bigint;
    reward: bigint;
    paid: boolean;
  };

  const submissions: Submission[] = [];
  let index = 0;

  console.log("[Worker] Reading submissions from contract...");

  while (true) {
    try {
      const sub = await campaign.submissions(index);
      submissions.push({
        index,
        creator: sub.creator as string,
        link: sub.link as string,
        views: sub.views as bigint,
        reward: sub.reward as bigint,
        paid: sub.paid as boolean,
      });
      console.log(`  [${index}] ${sub.creator} — ${sub.link}`);
      index++;
    } catch {
      // Contract reverts when index is out of range — that is our stop signal
      break;
    }
  }

  if (submissions.length === 0) {
    console.log("[Worker] No submissions found. Exiting.");
    return;
  }

  console.log(`\n[Worker] Found ${submissions.length} submission(s).\n`);

  // ── 3. Scrape real view counts ──────────────────────────────
  console.log("[Worker] Fetching view counts via ScrapingDog...\n");

  for (const sub of submissions) {
    console.log(`  Scraping: ${sub.link}`);

    let views = 0;

    try {
      const result = await scrapeTweet(sub.link, scrapingDogApiKey);
      views = result.views;
      console.log(
        `    ✓ views=${views}  likes=${result.likes}  retweets=${result.retweets}`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`    ✗ Scrape failed (${msg}). Using 0 views.`);
    }

    // ── 4. Write view count on-chain ──────────────────────────
    try {
      console.log(`    → setViews(${sub.index}, ${views})`);
      const tx = await campaign.setViews(sub.index, BigInt(views));
      const receipt = await tx.wait();
      console.log(`    ✓ tx mined: ${receipt.hash}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`    ✗ setViews failed: ${msg}`);
    }
  }

  // ── 5. Finalize on-chain ────────────────────────────────────
  console.log("\n[Worker] Calling finalizeResults()...");

  try {
    const txFinal = await campaign.finalizeResults();
    const receipt = await txFinal.wait();
    console.log(`[Worker] ✓ Finalized — tx: ${receipt.hash}`);
    console.log(
      "[Worker] All rewards are locked. Creators can now claim their share."
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Worker] ✗ finalizeResults failed: ${msg}`);
    throw err;
  }
}
