// ─────────────────────────────────────────────────────────────
//  scraper.ts — ScrapingDog X (Twitter) post scraper helper
// ─────────────────────────────────────────────────────────────

const SCRAPING_DOG_URL = "https://api.scrapingdog.com/x/post";

// ── Types ─────────────────────────────────────────────────────

export interface ScrapeResult {
  tweetId: string;
  views: number;
  likes: number;
  retweets: number;
  replies: number;
  text: string;
  author: string;
  username: string;
  createdAt: string;
  raw: unknown;
}

export interface ScrapeError {
  tweetId: string;
  error: string;
  views: 0;
}

export type ScrapeOutcome = ScrapeResult | ScrapeError;

// ── Helpers ───────────────────────────────────────────────────

/**
 * Accepts either a bare tweet ID ("1876543210987654321")
 * or any X / Twitter URL:
 *   https://x.com/user/status/1876543210987654321
 *   https://twitter.com/user/status/1876543210987654321?s=20
 * Returns just the numeric ID string.
 */
export function extractTweetId(input: string): string {
  const trimmed = input.trim();

  // Already a bare numeric ID
  if (/^\d+$/.test(trimmed)) return trimmed;

  // Try to pull the ID out of a status URL
  const match = trimmed.match(/\/status\/(\d+)/);
  if (match?.[1]) return match[1];

  // Fall back — return whatever was passed and let the API reject it
  return trimmed;
}

/**
 * ScrapingDog returns different field names depending on the
 * `parsed` flag and API version.  Walk the most common paths.
 */
function normalizeViews(data: Record<string, unknown>): number {
  // parsed=true top-level fields
  const candidates = [
    data["views_count"],
    data["view_count"],
    data["views"],
    // nested under metrics / public_metrics
    (data["metrics"] as Record<string, unknown> | undefined)?.["view_count"],
    (data["public_metrics"] as Record<string, unknown> | undefined)?.[
      "impression_count"
    ],
    (data["public_metrics"] as Record<string, unknown> | undefined)?.[
      "view_count"
    ],
  ];

  for (const v of candidates) {
    if (typeof v === "number" && v >= 0) return v;
    if (typeof v === "string" && /^\d+$/.test(v)) return parseInt(v, 10);
  }
  return 0;
}

function normalizeNumber(
  data: Record<string, unknown>,
  ...keys: string[]
): number {
  for (const key of keys) {
    const v = data[key];
    if (typeof v === "number" && v >= 0) return v;
    if (typeof v === "string" && /^\d+$/.test(v)) return parseInt(v, 10);
  }
  // try nested public_metrics
  const pm = data["public_metrics"] as Record<string, unknown> | undefined;
  if (pm) {
    for (const key of keys) {
      const v = pm[key];
      if (typeof v === "number" && v >= 0) return v;
    }
  }
  return 0;
}

function normalizeString(
  data: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const v = data[key];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return "";
}

// ── Core scrape function ──────────────────────────────────────

/**
 * Scrapes a single tweet via the ScrapingDog API.
 * Throws on network / API errors — callers should catch.
 */
export async function scrapeTweet(
  rawIdOrUrl: string,
  apiKey: string
): Promise<ScrapeResult> {
  const tweetId = extractTweetId(rawIdOrUrl);

  const url = new URL(SCRAPING_DOG_URL);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("tweetId", tweetId);
  url.searchParams.set("parsed", "true");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    // 15-second timeout so the server doesn't hang indefinitely
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `ScrapingDog error ${res.status}: ${res.statusText}. Body: ${body.slice(0, 200)}`
    );
  }

  const data = (await res.json()) as Record<string, unknown>;

  // ScrapingDog sometimes wraps the result in a "data" key
  const payload =
    data["data"] &&
    typeof data["data"] === "object" &&
    !Array.isArray(data["data"])
      ? (data["data"] as Record<string, unknown>)
      : data;

  // Author may be nested
  const authorObj = payload["author"] as Record<string, unknown> | undefined;

  return {
    tweetId,
    views: normalizeViews(payload),
    likes: normalizeNumber(
      payload,
      "likes",
      "like_count",
      "favorite_count",
      "likes_count"
    ),
    retweets: normalizeNumber(
      payload,
      "retweets",
      "retweet_count",
      "retweets_count"
    ),
    replies: normalizeNumber(
      payload,
      "replies",
      "reply_count",
      "replies_count"
    ),
    text: normalizeString(payload, "text", "full_text", "content"),
    author: authorObj
      ? normalizeString(authorObj, "name", "display_name", "full_name")
      : normalizeString(payload, "author_name", "user_name"),
    username: authorObj
      ? normalizeString(authorObj, "username", "screen_name", "handle")
      : normalizeString(payload, "username", "screen_name"),
    createdAt: normalizeString(
      payload,
      "created_at",
      "createdAt",
      "date",
      "timestamp"
    ),
    raw: data,
  };
}

/**
 * Scrape multiple tweets concurrently.
 * Never throws — individual failures are captured as ScrapeError objects.
 */
export async function scrapeBatch(
  rawIds: string[],
  apiKey: string,
  concurrency = 5
): Promise<ScrapeOutcome[]> {
  const results: ScrapeOutcome[] = [];

  // Process in chunks to respect rate limits
  for (let i = 0; i < rawIds.length; i += concurrency) {
    const chunk = rawIds.slice(i, i + concurrency);

    const settled = await Promise.allSettled(
      chunk.map((id) => scrapeTweet(id, apiKey))
    );

    for (let j = 0; j < settled.length; j++) {
      const outcome = settled[j];
      const rawId = chunk[j] ?? "";

      if (outcome.status === "fulfilled") {
        results.push(outcome.value);
      } else {
        results.push({
          tweetId: extractTweetId(rawId),
          error:
            outcome.reason instanceof Error
              ? outcome.reason.message
              : String(outcome.reason),
          views: 0,
        });
      }
    }
  }

  return results;
}
