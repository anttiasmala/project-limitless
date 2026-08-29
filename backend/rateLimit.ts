// @backend

// Counters live in Postgres rather than in a Map in this process. The app can
// be served by more than one instance, and every one of them has to see the
// same count for the limit to mean anything. A restart would empty a Map too.

import 'server-only';

import prisma from '@/prisma';
import { createHash } from 'node:crypto';

/**
 * One rule: how many requests the same caller may send, and in how long a
 * time. For example `{ name: 'burst', limit: 3, windowSeconds: 600 }` means
 * three requests per ten minutes.
 */
export type RateLimitWindow = {
  /** Goes into the database key, so every rule gets its own counter. */
  name: string;
  limit: number;
  windowSeconds: number;
};

export type RateLimitResult =
  { allowed: true } | { allowed: false; retryAfterSeconds: number };

/** How often a call also deletes old rows. 0.05 is about one call in twenty. */
const CLEANUP_CHANCE = 0.05;

/**
 * Counts one request from this caller and says if it is allowed.
 *
 * Every rule in `windows` has its own counter. If any counter goes over its
 * limit, the request is not allowed and the answer tells how many seconds the
 * caller has to wait. A route should call this first and do its own work only
 * when the answer is `allowed`.
 *
 * Put the shortest rule first. Counting stops at the first rule that is full,
 * so a caller already blocked by the ten minute rule does not also use up the
 * requests the daily rule allows.
 */
export async function checkRateLimit(
  scope: string,
  headers: Headers,
  windows: readonly RateLimitWindow[],
): Promise<RateLimitResult> {
  const caller = hashClientIp(headers);

  for (const window of windows) {
    const key = `${scope}:${window.name}:${caller}`;
    const { count, retryAfterSeconds } = await openOrBumpWindow(
      key,
      window.windowSeconds,
    );

    if (count > window.limit) return { allowed: false, retryAfterSeconds };
  }

  await cleanUpClosedWindows();

  return { allowed: true };
}

/**
 * Turns the seconds of a {@link RateLimitResult} into text for a person, like
 * "10 minutes". Always rounds up, so the wait shown is never shorter than the
 * real one.
 */
export function describeRetryAfter(retryAfterSeconds: number): string {
  if (retryAfterSeconds < 60) {
    return retryAfterSeconds === 1
      ? '1 second'
      : `${retryAfterSeconds} seconds`;
  }

  const minutes = Math.ceil(retryAfterSeconds / 60);
  if (minutes < 60) return minutes === 1 ? '1 minute' : `${minutes} minutes`;

  const hours = Math.ceil(minutes / 60);
  return hours === 1 ? '1 hour' : `${hours} hours`;
}

/**
 * Adds one to the caller's counter and returns the new count, plus how many
 * seconds are left until the counter starts over. A new counter is started
 * when there is none yet, or when the old one has run out of time.
 *
 * This is raw SQL because it all has to happen in one database statement.
 * Reading the count and then writing it back would go wrong when two requests
 * arrive at the same time: both would read the same number, and one of them
 * would not be counted. `ON CONFLICT` lets Postgres handle that instead, and
 * it updates the row one request at a time.
 *
 * While a counter is running its end time is left as it is, so sending more
 * requests cannot push the caller's own reset further away.
 *
 * The seconds left are counted in SQL instead of sending the end time back to
 * JavaScript. Both times then come from the database's own clock, so there is
 * no time zone or clock difference to get wrong. The answer is never below 1,
 * so nobody is told to wait "0 seconds".
 */
async function openOrBumpWindow(key: string, windowSeconds: number) {
  const [window] = await prisma.$queryRaw<
    { count: number; retryAfterSeconds: number }[]
  >`
    INSERT INTO "rate_limit" ("key", "count", "expiresAt")
    VALUES (${key}, 1, now() + make_interval(secs => ${windowSeconds}::float8))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "rate_limit"."expiresAt" > now() THEN "rate_limit"."count" + 1
        ELSE 1
      END,
      "expiresAt" = CASE
        WHEN "rate_limit"."expiresAt" > now() THEN "rate_limit"."expiresAt"
        ELSE now() + make_interval(secs => ${windowSeconds}::float8)
      END
    RETURNING
      "count",
      GREATEST(1, CEIL(EXTRACT(EPOCH FROM ("expiresAt" - now()))))::int
        AS "retryAfterSeconds"
  `;

  return window;
}

/**
 * Deletes the rows whose time has run out. Such a row is never read again,
 * because a counter that has run out is started over instead of continued.
 * This only keeps the table from growing forever, so doing it on about one
 * request in twenty is enough.
 */
async function cleanUpClosedWindows() {
  if (Math.random() >= CLEANUP_CHANCE) return;

  await prisma.rateLimit.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}

/**
 * The caller's IP address as a hash, which is what tells callers apart here.
 *
 * It is hashed so the database never holds a real address. The salt is needed
 * because there are few enough IP addresses that somebody could hash all of
 * them and see which hash matches.
 */
function hashClientIp(headers: Headers): string {
  // Not a secret of its own: BETTER_AUTH_SECRET is already required, and a
  // missing salt would only make the hashes reversible, not the limit weaker.
  const salt = process.env.BETTER_AUTH_SECRET ?? '';

  return createHash('sha256')
    .update(`${salt}:${readClientIp(headers)}`)
    .digest('hex');
}

/**
 * The client's address, read from the headers that the proxy in front of the
 * site (Vercel, Cloudflare, nginx, ...) adds to every request.
 *
 * A client can send these headers itself, so they can be faked if the app can
 * be reached without a proxy in front of it. That is a reason to keep it
 * behind one, not a reason to skip the limit.
 */
function readClientIp(headers: Headers): string {
  // The list grows left to right, each proxy appending the address it was
  // contacted from, so the original client is the first entry.
  const forwardedFor = headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  const ip =
    forwardedFor ||
    headers.get('cf-connecting-ip')?.trim() ||
    headers.get('x-real-ip')?.trim();

  // With no address to tell callers apart, everybody shares one counter. That
  // is stricter than intended, but a limit nobody is counted against is none.
  return ip || 'unknown';
}
