// ─────────────────────────────────────────────────────────────
//  index.ts — DecCampaign Worker (Bun HTTP Server)
//
//  Endpoints:
//    GET  /health          → service status
//    POST /scrape          → scrape a single tweet by ID or URL
//    POST /scrape-batch    → scrape multiple tweets concurrently
// ─────────────────────────────────────────────────────────────

import { scrapeTweet, scrapeBatch, extractTweetId } from "./scraper";

// ── Config ────────────────────────────────────────────────────

const PORT = Number(process.env.PORT ?? 3001);
const API_KEY = process.env.SCRAPING_DOG_API_KEY ?? "";

if (!API_KEY) {
  console.error(
    "[worker] ❌  SCRAPING_DOG_API_KEY is not set.\n" +
      "           Create a .env file from .env.example and add your key.",
  );
  process.exit(1);
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

  // ── 404 ───────────────────────────────────────────────────
  return err(
    `Route not found: ${method} ${pathname}. ` +
      "Available: GET /health · POST /scrape · POST /scrape-batch",
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
╰─────────────────────────────────────────╯
`);

export default server;
