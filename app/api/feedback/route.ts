// @backend

import 'server-only';

import { auth } from '@/backend/auth/auth';
import prisma from '@/prisma';
import { feedbackSchema } from '@/utils/zodSchemas';
import { NextRequest } from 'next/server';

/**
 * Takes one feedback message from anybody, logged in or not.
 *
 * Who sent it is decided by the session cookie and nothing else. An email in
 * the body is only ever kept as a reply address for senders without an
 * account: looking an account up by that address would let anyone file
 * feedback under somebody else's name just by typing their email.
 *
 * `isAnonymous` is the one thing the body may say about the sender, because it
 * can only ever drop attribution, never claim somebody else's.
 */
export async function POST(req: NextRequest) {
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
