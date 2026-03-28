// ─────────────────────────────────────────────────────────────
//  index.ts — DecCampaign Worker (Bun HTTP Server)
//
//  Endpoints:
//    GET  /health          → service status
//    POST /scrape          → scrape a single tweet by ID or URL
//    POST /scrape-batch    → scrape multiple tweets concurrently
// ─────────────────────────────────────────────────────────────

import "dotenv/config";
import { ethers } from "ethers";
import campaignFactoryArtifact from "./abi.json";
import { scrapeTweet, scrapeBatch, extractTweetId } from "./scraper";

// ── Config ────────────────────────────────────────────────────

const PORT = Number(process.env.PORT ?? 3001);
const API_KEY = process.env.SCRAPING_DOG_API_KEY ?? "";
const RPC_URL = process.env.RPC_URL ?? "";
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS ?? "";

if (!API_KEY) {
  console.error(
    "[worker] ❌  SCRAPING_DOG_API_KEY is not set.\n" +
      "           Create a .env file from .env.example and add your key.",
  );
  process.exit(1);
}

type CampaignSubmission = {
  creator: string;
  link: string;
  views: bigint;
  reward: bigint;
  paid: boolean;
};

type TransactionReceiptLike = {
  hash: string;
};

type TransactionResponseLike = {
  wait(): Promise<TransactionReceiptLike>;
};

type SkippedSyncUpdate = {
  index: number;
  link: string;
  reason: string;
};

type CampaignFactoryContract = {
  getSubmissionCount(campaignId: bigint): Promise<bigint>;
  getSubmission(campaignId: bigint, index: number): Promise<CampaignSubmission>;
  setViews(
    campaignId: bigint,
    index: number,
    views: bigint,
  ): Promise<TransactionResponseLike>;
  finalizeResults(campaignId: bigint): Promise<TransactionResponseLike>;
};

function getCampaignFactoryContract(): CampaignFactoryContract {
  if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    throw new Error(
      "RPC_URL, PRIVATE_KEY, and CONTRACT_ADDRESS must be set for contract calls.",
    );
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    campaignFactoryArtifact.abi,
    wallet,
  ) as unknown as CampaignFactoryContract;
}

// ── CORS headers (allow all origins for local dev) ────────────

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// ── Response helpers ──────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

function ok(data: unknown): Response {
  return json({
    success: true,
    ...(typeof data === "object" && data !== null ? data : { data }),
  });
}

function err(message: string, status = 400): Response {
  return json({ success: false, error: message }, status);
}

// ── Request handlers ──────────────────────────────────────────

/**
 * GET /health
 * Simple liveness probe.
 */
function handleHealth(): Response {
  return ok({
    service: "DecCampaign Worker",
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      port: PORT,
      scrapingDogConfigured: Boolean(API_KEY),
      contractConfigured: Boolean(RPC_URL && PRIVATE_KEY && CONTRACT_ADDRESS),
    },
  });
}

/**
 * POST /scrape
 * Body: { "tweetId": "1876543210987654321" }
 *   or: { "tweetId": "https://x.com/user/status/1876543210987654321" }
 *
 * Response: { success, tweetId, views, likes, retweets, replies,
 *             text, author, username, createdAt, raw }
 */
async function handleScrape(req: Request): Promise<Response> {
  let body: Record<string, unknown>;

  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err("Request body must be valid JSON.");
  }

  const raw = body["tweetId"];

  if (!raw || typeof raw !== "string" || raw.trim() === "") {
    return err(
      'Missing or invalid field "tweetId". ' +
        'Pass a tweet ID (e.g. "1876543210987654321") or a full X post URL.',
    );
  }

  const tweetId = extractTweetId(raw.trim());

  console.log(`[/scrape] → tweetId: ${tweetId}`);

  try {
    const result = await scrapeTweet(tweetId, API_KEY);

    console.log(`[/scrape] ✓ views: ${result.views.toLocaleString()}`);

    return ok(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`[/scrape] ✗ ${message}`);
    return err(`ScrapingDog request failed: ${message}`, 502);
  }
}

/**
 * POST /scrape-batch
 * Body: { "tweetIds": ["id1", "id2", "https://x.com/..."] }
 *       optional: "concurrency": 3  (default 5, max 10)
 *
 * Response: { success, count, results: ScrapeOutcome[] }
 *
 * Individual failures are captured — the whole batch never 500s.
 */
async function handleScrapeBatch(req: Request): Promise<Response> {
  let body: Record<string, unknown>;

  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err("Request body must be valid JSON.");
  }

  const rawIds = body["tweetIds"];

  if (!Array.isArray(rawIds) || rawIds.length === 0) {
    return err(
      'Missing or invalid field "tweetIds". ' +
        "Pass a non-empty array of tweet IDs or X post URLs.",
    );
  }

  // Validate each entry is a non-empty string
  const ids: string[] = [];
  for (const item of rawIds) {
    if (typeof item !== "string" || item.trim() === "") {
      return err(
        `All entries in "tweetIds" must be non-empty strings. Got: ${JSON.stringify(item)}`,
      );
    }
    ids.push(item.trim());
  }

  // Clamp concurrency between 1 and 10
  const rawConcurrency = body["concurrency"];
  const concurrency = Math.min(
    10,
    Math.max(1, typeof rawConcurrency === "number" ? rawConcurrency : 5),
  );

  console.log(
    `[/scrape-batch] → ${ids.length} tweet(s), concurrency: ${concurrency}`,
  );

  const results = await scrapeBatch(ids, API_KEY, concurrency);

  const succeeded = results.filter((r) => !("error" in r)).length;
  const failed = results.length - succeeded;

  console.log(`[/scrape-batch] ✓ done — ${succeeded} ok, ${failed} failed`);

  return ok({
    count: results.length,
    succeeded,
    failed,
    results,
  });
}

/**
 * POST /sync-campaign
 * Body: { "campaignId": 0 }
 *
 * Reads campaign submissions from the contract, scrapes each X post view count,
 * writes views on-chain via setViews(), then finalizes the campaign.
 */
async function handleSyncCampaign(req: Request): Promise<Response> {
  let body: Record<string, unknown>;

  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err("Request body must be valid JSON.");
  }

  const rawCampaignId = body["campaignId"];
  if (
    rawCampaignId === undefined ||
    rawCampaignId === null ||
    (typeof rawCampaignId !== "number" &&
      typeof rawCampaignId !== "string" &&
      typeof rawCampaignId !== "bigint")
  ) {
    return err('Missing or invalid field "campaignId".');
  }

  let campaignId: bigint;
  try {
    campaignId = BigInt(rawCampaignId);
  } catch {
    return err('Field "campaignId" must be a valid integer.');
  }

  try {
    const campaignFactory = getCampaignFactoryContract();
    const submissionCount = Number(
      await campaignFactory.getSubmissionCount(campaignId),
    );
    const updates: Array<{
      index: number;
      link: string;
      views: number;
      txHash: string;
    }> = [];
    const skipped: SkippedSyncUpdate[] = [];

    console.log(`[/sync-campaign] → campaignId: ${campaignId}`);
    console.log(`[/sync-campaign] → submissions: ${submissionCount}`);

    if (submissionCount === 0) {
      return json(
        {
          success: false,
          error: `Campaign ${campaignId} has no submissions. Sync skipped.`,
          campaignId: campaignId.toString(),
          submissionCount,
          updates,
          skipped,
        },
        409,
      );
    }

    for (let index = 0; index < submissionCount; index++) {
      const submission = await campaignFactory.getSubmission(campaignId, index);
      let views = 0;
      let scrapeFailed = false;

      try {
        const result = await scrapeTweet(submission.link, API_KEY);
        views = result.views;
        console.log(
          `[/sync-campaign] [${index}] scraped ${views} views for ${submission.link}`,
        );
      } catch (scrapeError) {
        const message =
          scrapeError instanceof Error
            ? scrapeError.message
            : String(scrapeError);
        scrapeFailed = true;
        console.warn(
          `[/sync-campaign] [${index}] scrape failed: ${message}. Skipping on-chain update.`,
        );
        skipped.push({
          index,
          link: submission.link,
          reason: `scrape failed: ${message}`,
        });
      }

      if (scrapeFailed) {
        continue;
      }

      if (views <= 0) {
        console.log(
          `[/sync-campaign] [${index}] skipping ${submission.link} because scraped views were 0.`,
        );
        skipped.push({
          index,
          link: submission.link,
          reason: "scraped views were 0",
        });
        continue;
      }

      const tx = await campaignFactory.setViews(campaignId, index, BigInt(views));
      const receipt = await tx.wait();

      updates.push({
        index,
        link: submission.link,
        views,
        txHash: receipt.hash,
      });
    }

    if (updates.length === 0) {
      return json(
        {
          success: false,
          error: `Campaign ${campaignId} has no non-zero scraped views. Sync skipped.`,
          campaignId: campaignId.toString(),
          submissionCount,
          updates,
          skipped,
        },
        409,
      );
    }

    const finalizeTx = await campaignFactory.finalizeResults(campaignId);
    const finalizeReceipt = await finalizeTx.wait();

    console.log(
      `[/sync-campaign] ✓ finalized campaign ${campaignId} with tx ${finalizeReceipt.hash}`,
    );

    return ok({
      campaignId: campaignId.toString(),
      submissionCount,
      updates,
      skipped,
      finalizeTxHash: finalizeReceipt.hash,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`[/sync-campaign] ✗ ${message}`);
    return err(`Campaign sync failed: ${message}`, 502);
  }
}

// ── Main router ───────────────────────────────────────────────

async function router(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);
  const method = req.method.toUpperCase();

  // CORS preflight for every route
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // ── Routes ────────────────────────────────────────────────
  if (method === "GET" && pathname === "/health") {
    return handleHealth();
  }

  if (method === "POST" && pathname === "/scrape") {
    return handleScrape(req);
  }

  if (method === "POST" && pathname === "/scrape-batch") {
    return handleScrapeBatch(req);
  }

  if (method === "POST" && pathname === "/sync-campaign") {
    return handleSyncCampaign(req);
  }

  // ── 404 ───────────────────────────────────────────────────
  return err(
    `Route not found: ${method} ${pathname}. ` +
      "Available: GET /health · POST /scrape · POST /scrape-batch · POST /sync-campaign",
    404,
  );
}

// ── Start server ──────────────────────────────────────────────

const server = Bun.serve({
  port: PORT,
  fetch: router,
});

console.log(`
╭─────────────────────────────────────────╮
│   DecCampaign Worker                    │
│   Listening on http://localhost:${PORT}    │
│                                         │
│   GET  /health                          │
│   POST /scrape          (single tweet)  │
│   POST /scrape-batch    (bulk tweets)   │
│   POST /sync-campaign   (on-chain sync) │
╰─────────────────────────────────────────╯
`);
