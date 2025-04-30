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

const HANDLER: Record<
  string,
  (
    req: NextApiRequest,
    res: NextApiResponse,
    userData: GetUser,
  ) => Promise<void>
> = {
  GET: handleGET,
  POST: handlePOST,
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
  const vesiosuuskunnat = await prisma.vesiosuuskunta.findMany({
    where: {
      ownerUUID: userData.uuid,
    },
    omit: {
      id: true,
    },
  });

  res.status(200).json(vesiosuuskunnat);
  return;
}

async function handlePOST(
  req: NextApiRequest,
  res: NextApiResponse,
  userData: GetUser,
) {
  const parsedVesiosuuskunta = createVesiosuuskuntaSchema.safeParse(req.body);
  if (parsedVesiosuuskunta.success === false) {
    throw new HttpError('Request had invalid data, check it again!', 400);
  }

  const dataObject = {
    ...parsedVesiosuuskunta.data,
    ownerUUID: userData.uuid,
    userUUID: userData.uuid,
  };

  const createdVesiosuuskunta = await prisma.vesiosuuskunta.create({
    data: dataObject,
  });

  return res.status(200).json(createdVesiosuuskunta);
}
