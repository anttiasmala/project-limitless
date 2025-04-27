import { NextApiRequest, NextApiResponse } from 'next';
import { handleError } from '~/backend/handleError';
import { HttpError } from '~/backend/HttpError';
import { CreateUser } from '~/shared/types';
import { createUserSchema } from '~/shared/zodSchemas';
import prisma from '~/prisma';
import { hashPassword } from '~/backend/utils';

export default async function Register(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'POST') {
      throw new HttpError('Invalid request method!', 405);
    }
    const validateRequestBody = createUserSchema.parse(req.body);

    await createUser(validateRequestBody);

    res.status(200).end();
  } catch (e) {
    handleError(res, e);
  }
}

async function createUser(userData: CreateUser) {
  const hashedPassword = await hashPassword(userData.password);
  const parsedUserData = createUserSchema.parse({
    ...userData,
    password: hashedPassword,
  });

  await prisma.user.create({
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
}
