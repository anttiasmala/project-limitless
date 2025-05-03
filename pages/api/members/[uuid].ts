import { NextApiRequest, NextApiResponse } from 'next/types';
import {
  requireLogin,
  validateRequest,
} from '~/backend/auth/vesiosuuskunta-auth';
import { handleError } from '~/backend/handleError';
import { HttpError } from '~/backend/HttpError';
import { GetUser } from '~/shared/types';
import prisma from '~/prisma';
import {
  createMemberSchema,
  createVesiosuuskuntaSchema,
  patchMemberSchema,
} from '~/shared/zodSchemas';
import { Prisma } from '@prisma/client';

const HANDLER: Record<
  string,
  (
    req: NextApiRequest,
    res: NextApiResponse,
    userData: GetUser,
  ) => Promise<void>
> = {
  GET: handleGET,
  PATCH: handlePATCH,
};

export default async function handleMembersRequests(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { user: userData } = await requireLogin(req, res);

    const reqHandler = req.method !== undefined && HANDLER[req.method];
    if (reqHandler) {
      await reqHandler(req, res, userData);
    } else {
      throw new HttpError(
        `${req.method} is not a valid method. Only GET and POST requests are valid!`,
        405,
      );
    }
  } catch (e) {
    return handleError(res, e);
  }
}

async function handleGET(
  req: NextApiRequest,
  res: NextApiResponse,
  userData: GetUser,
) {
  res.status(200).end();
  return;
}

async function handlePATCH(
  req: NextApiRequest,
  res: NextApiResponse,
  userData: GetUser,
) {
  const parsedMember = patchMemberSchema.safeParse(req.body);
  if (parsedMember.success === false) {
    throw new HttpError('Request had invalid data, check it again!', 400);
  }

  const dataObject = {
    ...parsedMember.data,
    userUUID: userData.uuid,
  };

  const updatedMember = await prisma.member.update({
    where: {
      userUUID: userData.uuid,
      uuid: parsedMember.data.uuid,
    },
    data: dataObject,
  });

  return res.status(200).json(updatedMember);
}
