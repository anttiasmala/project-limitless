import { NextApiRequest, NextApiResponse } from 'next';
import { handleError } from '~/backend/handleError';
import { HttpError } from '~/backend/HttpError';
import { verifyPassword } from '~/backend/utils';
import { getUserSchema, loginSchema } from '~/shared/zodSchemas';
import prisma from '~/prisma';
import { auth, authLong } from '~/backend/auth/vesiosuuskunta-auth';
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

    const userDetailsParse = getUserSchema.safeParse(req.body);

    if (!userDetailsParse.success) {
      throw new HttpError("Expected to get User's data!", 400);
    }
    const userDetails = userDetailsParse.data;

    const isPasswordSame = verifyPassword(
      loginDetails.password,
      userDetailsParse?.password ?? '',
    );

    if (!isPasswordSame) throw new HttpError('Password is invalid!', 400);

    const sessionUUID = await logUserIn(userDetailsParse.uuid);

    res
      .appendHeader(
        'Set-cookie',
        authLong.createSessionCookie(sessionUUID).serialize(),
      )
      .status(200)
      .end();
  } catch (e) {
    return handleError(res, e);
  }
}

async function logUserIn(userUUID: string) {
  const { uuid: sessionUUID } = await authLong.createSession(userUUID);

  return sessionUUID;
}
