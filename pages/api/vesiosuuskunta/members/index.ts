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
  const unTrusfulUUID =
    req.headers.referer?.match(/vesiosuuskunta\/(.+?)\/members/)?.[1] ??
    undefined;

  if (!unTrusfulUUID) {
    throw new HttpError(
      'Request was not sent from incorrect place, check it again!',
      400,
    );
  }

  // check vesiosuuskunta exists with given UUID and user's UUID

  const vesiosuuskunta = await prisma.vesiosuuskunta.findFirstOrThrow({
    where: {
      uuid: unTrusfulUUID,
      ownerUUID: userData.uuid,
    },
  });

  const vesiosuuskuntaMembers = await prisma.member.findMany({
    where: {
      vesiosuuskuntaUUID: vesiosuuskunta.uuid,
    },
  });

  res.status(200).json(vesiosuuskuntaMembers);
  return;
}

async function handlePOST(
  req: NextApiRequest,
  res: NextApiResponse,
  userData: GetUser,
) {
  const parsedMember = createMemberSchema.safeParse(req.body);
  if (parsedMember.success === false) {
    throw new HttpError('Request had invalid data, check it again!', 400);
  }

  const unTrusfulUUID =
    req.headers.referer?.match(/vesiosuuskunta\/(.+?)\/members/)?.[1] ??
    undefined;

  if (!unTrusfulUUID) {
    throw new HttpError(
      'Request was not sent from incorrect place, check it again!',
      400,
    );
  }
  // get vesiosuuskunta
  const vesiosuuskunta = await prisma.vesiosuuskunta.findFirstOrThrow({
    where: {
      uuid: unTrusfulUUID,
      ownerUUID: userData.uuid,
    },
  });

  const dataObject = {
    ...parsedMember.data,
    vesiosuuskuntaUUID: vesiosuuskunta?.uuid ?? '',
  };

  const createdVesiosuuskunta = await prisma.member.create({
    data: dataObject,
  });

  return res.status(200).json(createdVesiosuuskunta);
}
