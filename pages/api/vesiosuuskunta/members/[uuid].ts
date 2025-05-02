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
  createVesiosuuskuntaSchema,
  patchMemberSchema,
  uuidSchema,
} from '~/shared/zodSchemas';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const HANDLER: Record<
  string,
  (
    req: NextApiRequest,
    res: NextApiResponse,
    userData: GetUser,
  ) => Promise<void>
> = {
  PATCH: handlePATCH,
};

export default async function handleMemberUUIDRequest(
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
        `${req.method} is not a valid method. Only PATCH request is valid!`,
        405,
      );
    }
  } catch (e) {
    return handleError(res, e);
  }
}

async function handlePATCH(
  req: NextApiRequest,
  res: NextApiResponse,
  userData: GetUser,
) {
  const parsedNewMemberData = patchMemberSchema.safeParse(req.body);
  if (parsedNewMemberData.success === false) {
    throw new HttpError('Request had invalid data, check it again!', 400);
  }

  const memberUUID = uuidSchema.safeParse(req.query.uuid);

  if (memberUUID.success === false) {
    throw new HttpError('Invalid UUID!', 400);
  }

  // get vesiosuuskunta
  const vesiosuuskunta = await prisma.vesiosuuskunta.findFirstOrThrow({
    where: {
      uuid: parsedNewMemberData.data.vesiosuuskuntaUUID,
      ownerUUID: userData.uuid,
    },
  });

  if (!vesiosuuskunta) {
    throw new HttpError('Invalid vesiosuuskunta UUID!', 400);
  }

  const updatedMember = await prisma.member.update({
    where: {
      uuid: memberUUID.data,
      vesiosuuskuntaUUID: vesiosuuskunta.uuid,
    },
    data: parsedNewMemberData.data,
  });
  res.status(200).json(updatedMember);
}
