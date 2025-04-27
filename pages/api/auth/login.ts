import { NextApiRequest, NextApiResponse } from 'next';
import { handleError } from '~/backend/handleError';
import { HttpError } from '~/backend/HttpError';
import { verifyPassword } from '~/backend/utils';
import { loginSchema } from '~/shared/zodSchemas';
import prisma from '~/prisma';

export default async function Login(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      throw new HttpError('Invalid request method!', 405);
    }

    const loginDetails = loginSchema.parse(req.body);

    const userDetails = await prisma.user.findUnique({
      where: {
        email: loginDetails.email,
      },
      select: {
        password: true,
        uuid: true,
      },
    });

    const verifiedPassword = verifyPassword(
      loginDetails.password,
      userDetails?.password ?? '',
    );

    if (!verifiedPassword) throw new HttpError('Password is invalid!', 400);

    res.status(200).end();
  } catch (e) {
    return handleError(res, e);
  }
}
