import { NextApiRequest, NextApiResponse } from 'next/types';
import {
  requireLogin,
  validateRequest,
} from '~/backend/auth/vesiosuuskunta-auth';
import { handleError } from '~/backend/handleError';
import { HttpError } from '~/backend/HttpError';
import { GetUser } from '~/shared/types';
import prisma from '~/prisma';
import { createVesiosuuskuntaSchema } from '~/shared/zodSchemas';
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
  GET: handleGET,
};

export default async function handleVesiosuuskuntaRequest(
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
  const givenUUID = z.string().uuid().safeParse(req.query.uuid);
  console.log(req.query.uuid);
  if (givenUUID.success === false) {
    throw new HttpError('Invalid UUID!', 400);
  }
  console.log(givenUUID.data);

  const vesiosuuskunta = await prisma.vesiosuuskunta.findFirst({
    where: {
      uuid: givenUUID.data,
      ownerUUID: userData.uuid,
    },
    omit: {
      id: true,
    },
  });

  res.status(200).json(vesiosuuskunta);
  return;
}

//async function handlePATCH(){}
//async function handlePUT(){}
