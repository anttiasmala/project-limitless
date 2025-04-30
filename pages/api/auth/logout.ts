import { NextApiRequest, NextApiResponse } from 'next';
import { handleError } from '~/backend/handleError';
import { HttpError } from '~/backend/HttpError';
import { verifyPassword } from '~/backend/utils';
import { getUserSchema, loginSchema } from '~/shared/zodSchemas';
import prisma from '~/prisma';
import {
  auth,
  authLong,
  validateRequest,
} from '~/backend/auth/vesiosuuskunta-auth';
import { getServerSideProps } from '~/utils/getServerSideProps';

export { getServerSideProps };

export default async function Logout(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'POST') {
      throw new HttpError('Invalid request method!', 405);
    }
    // check if request is validated
    const { session } = await validateRequest(req, res);
    if (!session) {
      res.status(200).end();
      return;
    }
    // if session is found, mark user's isLoggedIn to false it
    await logUserOut(session.uuid);

    res.status(200).end();
    return;
  } catch (e) {
    return handleError(res, e);
  }
}

async function logUserOut(sessionUUID: string) {
  await prisma.session.update({
    where: {
      uuid: sessionUUID,
    },
    data: {
      isLoggedIn: false,
    },
  });

  return;
}
