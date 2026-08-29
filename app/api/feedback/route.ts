// @backend

import 'server-only';

import { auth } from '@/backend/auth/auth';
import {
  checkRateLimit,
  describeRetryAfter,
  type RateLimitWindow,
} from '@/backend/rateLimit';
import prisma from '@/prisma';
import { feedbackSchema } from '@/utils/zodSchemas';
import { NextRequest } from 'next/server';

/**
 * How many times one sender may send a feedback. The endpoint needs no login, so without this
 * a script could fill the table in a loop.
 *
 * Two windows, shortest first: the burst one stops the loop straight away, and
 * the daily one stops the slower drip that would stay under it. Both are set
 * well above what somebody reporting a handful of bugs in one sitting sends.
 */
const FEEDBACK_RATE_LIMITS: readonly RateLimitWindow[] = [
  { name: 'burst', limit: 3, windowSeconds: 10 * 60 },
  { name: 'daily', limit: 15, windowSeconds: 24 * 60 * 60 },
];

/**
 * Takes one feedback message from anybody, logged in or not.
 *
 * Who sent it is decided by the session cookie. An email in
 * the body is only kept as a reply address for senders without an
 * account. Looking an account by the email address would let anyone send
 * a feedback under somebody else's name just by typing their email.
 */
export async function POST(req: NextRequest) {
  // Ratelimit is checked before the body is even read

  const rateLimit = await checkRateLimit(
    'feedback',
    req.headers,
    FEEDBACK_RATE_LIMITS,
  );

  if (!rateLimit.allowed) {
    const retryAfter = describeRetryAfter(rateLimit.retryAfterSeconds);

    return new Response(
      `Too many feedback messages have been sent. Please try again in ${retryAfter}.`,
      {
        status: 429,
        // The form shows the text above, but a client that reads headers
        // instead is told the same thing in the way it expects.
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return new Response('Feedback body is not valid JSON!', { status: 400 });
  }

  const parsedBody = feedbackSchema.safeParse(body);

  if (!parsedBody.success) {
    return new Response("Feedback's body is invalid!", { status: 400 });
  }

  const { message, type, email, pageUrl, isAnonymous } = parsedBody.data;

  // Check if feedback is anonymous or not
  const authSession = isAnonymous
    ? null
    : await auth.api.getSession({ headers: req.headers });

  const userId = authSession?.user.id ?? null;

  await prisma.feedback.create({
    data: {
      message,
      type,
      pageUrl: pageUrl ?? null,
      // An account's address is read through the relation, so a separate copy
      // is only stored when there is no account to read it from.
      email: userId ? null : (email ?? null),
      userId,
    },
  });

  return new Response('Thanks for the feedback!', { status: 200 });
}
