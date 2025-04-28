import type { IncomingMessage, ServerResponse } from 'http';
import { TimeSpan } from './auth';
import prisma from '~/prisma';
import type { User, FrontendSession } from '~/shared/types';
import { NextApiRequest, NextApiResponse } from 'next';
import { HttpError } from '~/backend/HttpError';
import { VesiosuuskuntaAuthAdapter } from './db-adapter';
import { VesiosuuskuntaAuth } from './auth';

const prismaAdapter = new VesiosuuskuntaAuthAdapter(prisma);

/** 1 hour */
export const auth = new VesiosuuskuntaAuth(prismaAdapter, {
  sessionExpiresIn: new TimeSpan(1, 'h'),
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
});

/** 30 days | 1 month */
export const authLong = new VesiosuuskuntaAuth(prismaAdapter, {
  sessionExpiresIn: new TimeSpan(30, 'd'),
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
});

export async function validateRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<
  { user: User; session: FrontendSession } | { user: null; session: null }
> {
  const sessionId = auth.readSessionCookie(req.headers.cookie ?? '');
  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }
  const result = await auth.validateSession(sessionId);
  if (result.session && result.session.fresh) {
    res.appendHeader(
      'Set-Cookie',
      auth.createSessionCookie(result.session.uuid).serialize(),
    );
  }
  if (!result.session) {
    res.appendHeader('Set-Cookie', auth.createBlankSessionCookie().serialize());
  }

  return result;
}

export async function requireLogin(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<{ user: User; session: FrontendSession }> {
  const userDetails = await validateRequest(req, res);
  if (
    !userDetails.session ||
    !userDetails.user ||
    !userDetails.session.isLoggedIn
  ) {
    throw new HttpError('You are unauthorized!', 401);
  }
  return userDetails;
}

/**
 * Checks for a valid user and session, **REGARDLESS** of login status
 *
 * **ATTENTION**: the user **DOES NOT** need to be logged in for this function to validate request
 */

export async function checkIfSessionValid(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<{ user: User; session: FrontendSession }> {
  const userData = await validateRequest(req, res);
  if (!userData.session || !userData.user) {
    throw new HttpError('You are unauthorized!', 401);
  }
  return userData;
}
