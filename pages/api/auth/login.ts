import { NextApiRequest, NextApiResponse } from 'next';
import { handleError } from '~/backend/handleError';
import { HttpError } from '~/backend/HttpError';
import { verifyPassword } from '~/backend/utils';
import { loginSchema } from '~/shared/zodSchemas';
import prisma from '~/prisma';
import { auth, authLong } from '~/backend/auth/vesiosuuskunta-auth';

export default async function Login(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      throw new HttpError('Invalid request method!', 405);
    }

    const loginDetails = loginSchema.parse(req.body);

    const userDetails = await prisma.user.findUniqueOrThrow({
      where: {
        email: loginDetails.email,
      },
      select: {
        password: true,
        uuid: true,
      },
    });

    const isPasswordSame = verifyPassword(
      loginDetails.password,
      userDetails?.password ?? '',
    );

    if (!isPasswordSame) throw new HttpError('Password is invalid!', 400);

    const sessionUUID = await logUserIn(userDetails.uuid);

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
