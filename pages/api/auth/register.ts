import { NextApiRequest, NextApiResponse } from 'next';
import { handleError } from '~/backend/handleError';
import { HttpError } from '~/backend/HttpError';
import { CreateUser } from '~/shared/types';
import { createUserSchema } from '~/shared/zodSchemas';
import prisma from '~/prisma';
import { hashPassword } from '~/backend/utils';
import { logUserIn } from './login';
import { authLong } from '~/backend/auth/vesiosuuskunta-auth';

export default async function Register(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'POST') {
      throw new HttpError('Invalid request method!', 405);
    }
    const validateRequestBody = createUserSchema.parse(req.body);

    const sessionUUID = await createUser(validateRequestBody);

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

async function createUser(userData: CreateUser) {
  const hashedPassword = await hashPassword(userData.password);
  const parsedUserData = createUserSchema.parse({
    ...userData,
    password: hashedPassword,
  });
  // perhaps check if user exists before create a new one?
  // autoincrement seemds to increase even if it doesn't do the user
  const createdUser = await prisma.user.create({
    data: parsedUserData,
    select: {
      uuid: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const sessionUUID = await logUserIn(createdUser.uuid);

  return sessionUUID;
}
